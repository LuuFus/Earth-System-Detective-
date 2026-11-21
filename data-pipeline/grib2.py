"""A small GRIB2 reader for the NOAA GFS files the site uses.

Only what GFS on NOMADS needs: a regular lat/lon grid (template 3.0), product templates 4.0
and 4.8, and data packed simply (5.0) or with complex packing, with or without spatial
differencing (5.2, 5.3). Pure Python and numpy, so it runs anywhere (ecCodes has no Windows
wheel).

    for field in read_grib2(open("gfs.grb2", "rb").read()):
        field.key       # (discipline, category, number, surface type, surface value)
        field.values    # numpy float64 array [nj][ni], rows in file order
"""

from __future__ import annotations

import struct
from dataclasses import dataclass

import numpy as np


@dataclass
class Field:
    discipline: int
    category: int
    number: int
    surface: int
    level: float
    ni: int
    nj: int
    lat1: float
    lon1: float
    lat2: float
    lon2: float
    scan: int
    values: np.ndarray

    @property
    def key(self) -> tuple[int, int, int, int, float]:
        return (self.discipline, self.category, self.number, self.surface, self.level)


def _signed(raw: int, bits: int) -> int:
    """GRIB stores signed integers as sign and magnitude, not two's complement."""
    sign = 1 << (bits - 1)
    return -(raw & (sign - 1)) if raw & sign else raw


class _Bits:
    def __init__(self, data: bytes):
        self.bits = np.unpackbits(np.frombuffer(data, dtype=np.uint8))
        self.pos = 0

    def fixed(self, n: int, width: int) -> np.ndarray:
        """n unsigned values of `width` bits each."""
        if n == 0:
            return np.zeros(0, dtype=np.int64)
        if width == 0:
            return np.zeros(n, dtype=np.int64)
        idx = self.pos + np.arange(n)[:, None] * width + np.arange(width)[None, :]
        self.pos += n * width
        weights = (1 << np.arange(width - 1, -1, -1)).astype(np.int64)
        return self.bits[idx].astype(np.int64) @ weights

    def varying(self, widths: np.ndarray) -> np.ndarray:
        """One value per entry of `widths`, each that many bits, packed back to back."""
        widths = widths.astype(np.int64)
        n = widths.size
        wmax = int(widths.max()) if n else 0
        if wmax == 0:
            return np.zeros(n, dtype=np.int64)
        starts = self.pos + np.concatenate([[0], np.cumsum(widths)[:-1]])
        self.pos += int(widths.sum())
        j = np.arange(wmax)[None, :]
        idx = np.minimum(starts[:, None] + j, self.bits.size - 1)
        shift = widths[:, None] - 1 - j
        weights = np.where(shift >= 0, np.left_shift(1, np.maximum(shift, 0)), 0).astype(np.int64)
        return (self.bits[idx].astype(np.int64) * weights).sum(axis=1)

    def align(self) -> None:
        self.pos = (self.pos + 7) // 8 * 8


def _unpack(template: int, s5: bytes, s7: bytes, npts: int) -> np.ndarray:
    ref = struct.unpack(">f", s5[11:15])[0]
    e = _signed(struct.unpack(">H", s5[15:17])[0], 16)
    d = _signed(struct.unpack(">H", s5[17:19])[0], 16)
    nbits = s5[19]
    data = s7[5:]
    scale = 2.0**e / 10.0**d
    base = ref / 10.0**d

    if template == 0:
        if nbits == 0:
            return np.full(npts, base)
        x = _Bits(data).fixed(npts, nbits)
        return base + x * scale

    if template not in (2, 3):
        raise ValueError(f"GRIB2 data template 5.{template} is not supported")

    missing_mgmt = s5[22]
    if missing_mgmt != 0:
        raise ValueError("missing-value management in complex packing is not supported")
    ng = struct.unpack(">I", s5[31:35])[0]
    ref_width = s5[35]
    bits_width = s5[36]
    ref_len = struct.unpack(">I", s5[37:41])[0]
    len_inc = s5[41]
    last_len = struct.unpack(">I", s5[42:46])[0]
    bits_len = s5[46]

    order = 0
    extra = 0
    ivals: list[int] = []
    minsd = 0
    if template == 3:
        order = s5[47]
        extra = s5[48]
    off = 0
    if order:
        for _ in range(order):
            ivals.append(_signed(int.from_bytes(data[off : off + extra], "big"), 8 * extra))
            off += extra
        minsd = _signed(int.from_bytes(data[off : off + extra], "big"), 8 * extra)
        off += extra

    bits = _Bits(data[off:])
    refs = bits.fixed(ng, nbits)
    bits.align()
    widths = bits.fixed(ng, bits_width) + ref_width
    bits.align()
    lengths = bits.fixed(ng, bits_len) * len_inc + ref_len
    bits.align()
    if ng:
        lengths[-1] = last_len
    if int(lengths.sum()) != npts:
        raise ValueError(f"group lengths add up to {int(lengths.sum())}, expected {npts}")
    per_value_width = np.repeat(widths, lengths)
    x = bits.varying(per_value_width) + np.repeat(refs, lengths)

    if order == 1:
        dx = x[1:] + minsd
        x = np.concatenate([[ivals[0]], ivals[0] + np.cumsum(dx)])
    elif order == 2:
        # X[n] = d[n] + 2 X[n-1] - X[n-2]: the steps X[n] - X[n-1] are a running sum of d.
        dx = x[2:] + minsd
        step1 = ivals[1] - ivals[0]
        steps = step1 + np.cumsum(dx)
        x = np.concatenate([[ivals[0], ivals[1]], ivals[1] + np.cumsum(steps)])
    return base + x.astype(np.float64) * scale


def read_grib2(blob: bytes) -> list[Field]:
    out: list[Field] = []
    i = 0
    while True:
        i = blob.find(b"GRIB", i)
        if i < 0:
            break
        discipline = blob[i + 6]
        total = struct.unpack(">Q", blob[i + 8 : i + 16])[0]
        j = i + 16
        end = i + total - 4
        grid = None
        product = None
        s5 = None
        while j < end:
            length = struct.unpack(">I", blob[j : j + 4])[0]
            num = blob[j + 4]
            sec = blob[j : j + length]
            if num == 3:
                tmpl = struct.unpack(">H", sec[12:14])[0]
                if tmpl != 0:
                    raise ValueError(f"grid template 3.{tmpl} is not supported")
                ni = struct.unpack(">I", sec[30:34])[0]
                nj = struct.unpack(">I", sec[34:38])[0]
                lat1 = _signed(struct.unpack(">I", sec[46:50])[0], 32) / 1e6
                lon1 = _signed(struct.unpack(">I", sec[50:54])[0], 32) / 1e6
                lat2 = _signed(struct.unpack(">I", sec[55:59])[0], 32) / 1e6
                lon2 = _signed(struct.unpack(">I", sec[59:63])[0], 32) / 1e6
                scan = sec[71]
                grid = (ni, nj, lat1, lon1, lat2, lon2, scan)
            elif num == 4:
                category = sec[9]
                number = sec[10]
                surface = sec[22]
                factor = _signed(sec[23], 8)
                value = _signed(struct.unpack(">I", sec[24:28])[0], 32)
                product = (category, number, surface, value / 10.0**factor)
            elif num == 5:
                s5 = sec
            elif num == 6:
                if sec[5] != 255:
                    raise ValueError("bit-mapped GRIB2 fields are not supported")
            elif num == 7:
                assert grid and product and s5 is not None
                npts = struct.unpack(">I", s5[5:9])[0]
                template = struct.unpack(">H", s5[9:11])[0]
                values = _unpack(template, s5, sec, npts)
                ni, nj = grid[0], grid[1]
                out.append(
                    Field(discipline, product[0], product[1], product[2], product[3], ni, nj, grid[2], grid[3], grid[4], grid[5], grid[6], values.reshape(nj, ni))
                )
            j += length
        i += total
    return out
