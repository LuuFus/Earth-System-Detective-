"""Build the climate layer from NASA GISTEMP v4.

Downloads the 1200 km land+ocean surface temperature anomaly grid
(GISTEMP v4, GHCNv4 + ERSSTv5, base period 1951-1980) from NASA GISS, averages
each 2x2 degree cell into calendar-year means and writes two files for the web app:

  frontend/public/data/gistemp/annual.bin   int8, [year][lat][lon], 0.1 degC steps, -128 = no data
  frontend/public/data/gistemp/meta.json    years, grid, scale, global means, source

Rows run south to north (lat -89..89) and columns west to east (lon -179..179),
which is the layout three.js expects for an equirectangular DataTexture.

Usage (from the repository root):
    python data-pipeline/build_gistemp.py            # download if missing, then build
    python data-pipeline/build_gistemp.py --refresh  # force a fresh download

Needs numpy and scipy (the GISTEMP file is classic NetCDF); h5py only if NASA
ever switches the file to NetCDF-4.
"""

from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
import shutil
import sys
import urllib.request
from pathlib import Path

import numpy as np

SOURCE_URL = "https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz"
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache"
OUT = ROOT / "frontend" / "public" / "data" / "gistemp"
MIN_MONTHS = 9  # a cell needs at least this many valid months for a yearly mean


def download(refresh: bool) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    gz_path = CACHE / "gistemp1200_GHCNv4_ERSSTv5.nc.gz"
    nc_path = CACHE / "gistemp1200_GHCNv4_ERSSTv5.nc"
    if refresh or not gz_path.exists():
        print(f"downloading {SOURCE_URL}")
        with urllib.request.urlopen(SOURCE_URL, timeout=120) as response, open(gz_path, "wb") as out:
            shutil.copyfileobj(response, out, length=1 << 20)
    if refresh or not nc_path.exists() or nc_path.stat().st_mtime < gz_path.stat().st_mtime:
        with gzip.open(gz_path, "rb") as src, open(nc_path, "wb") as dst:
            shutil.copyfileobj(src, dst, length=1 << 20)
    return nc_path


def read_netcdf(path: Path):
    magic = path.read_bytes()[:4]
    if magic[:3] == b"CDF":
        from scipy.io import netcdf_file

        with netcdf_file(path, "r", mmap=False) as nc:
            lat = nc.variables["lat"][:].astype(float)
            lon = nc.variables["lon"][:].astype(float)
            time = nc.variables["time"][:].astype(float)
            time_units = nc.variables["time"].units.decode()
            var = nc.variables["tempanomaly"]
            raw = var[:].astype(np.float64)
            fill = getattr(var, "_FillValue", 32767)
            scale = float(getattr(var, "scale_factor", 1.0))
            offset = float(getattr(var, "add_offset", 0.0))
            data = np.where(raw == fill, np.nan, raw * scale + offset)
        return lat, lon, time, time_units, data
    if magic[:4] == b"\x89HDF":
        try:
            import h5py
        except ImportError:
            sys.exit("This GISTEMP file is NetCDF-4; install h5py (pip install h5py) and run again.")
        with h5py.File(path, "r") as f:
            lat = f["lat"][:].astype(float)
            lon = f["lon"][:].astype(float)
            time = f["time"][:].astype(float)
            time_units = f["time"].attrs["units"]
            time_units = time_units.decode() if isinstance(time_units, bytes) else str(time_units)
            var = f["tempanomaly"]
            raw = var[:].astype(np.float64)
            fill = var.attrs.get("_FillValue", 32767)
            scale = float(var.attrs.get("scale_factor", 1.0))
            offset = float(var.attrs.get("add_offset", 0.0))
            data = np.where(raw == fill, np.nan, raw * scale + offset)
        return lat, lon, time, time_units, data
    sys.exit(f"Unrecognised file format: {magic!r}")


def month_years(time: np.ndarray, units: str) -> np.ndarray:
    # e.g. "days since 1800-01-01 00:00:00"
    unit, _, origin = units.partition(" since ")
    if unit.strip() != "days":
        sys.exit(f"Unexpected time units: {units}")
    start = dt.datetime.fromisoformat(origin.strip().replace(" 00:00:00", "").strip())
    return np.array([(start + dt.timedelta(days=float(d))).year for d in time])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--refresh", action="store_true", help="download the GISTEMP file again")
    args = parser.parse_args()

    lat, lon, time, units, data = read_netcdf(download(args.refresh))
    years_of_month = month_years(time, units)
    if lat[0] > lat[-1]:
        lat = lat[::-1]
        data = data[:, ::-1, :]

    complete = [y for y in np.unique(years_of_month) if (years_of_month == y).sum() == 12]
    years = np.arange(complete[0], complete[-1] + 1)
    nlat, nlon = len(lat), len(lon)
    print(f"grid {nlat}x{nlon}, months {len(time)}, complete years {years[0]}-{years[-1]}")

    weights = np.cos(np.deg2rad(lat))[:, None] * np.ones((1, nlon))
    annual = np.full((len(years), nlat, nlon), -128, dtype=np.int8)
    global_mean: list[float | None] = []
    for i, year in enumerate(years):
        block = data[years_of_month == year]
        valid = np.isfinite(block).sum(axis=0)
        with np.errstate(invalid="ignore"):
            mean = np.nanmean(np.where(np.isfinite(block), block, np.nan), axis=0)
        mean[valid < MIN_MONTHS] = np.nan
        ok = np.isfinite(mean)
        annual[i][ok] = np.clip(np.round(mean[ok] * 10), -127, 127).astype(np.int8)
        global_mean.append(round(float((mean[ok] * weights[ok]).sum() / weights[ok].sum()), 3) if ok.any() else None)

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "annual.bin").write_bytes(annual.tobytes(order="C"))
    meta = {
        "source": "NASA GISS Surface Temperature Analysis (GISTEMP v4), GHCNv4 + ERSSTv5, 1200 km smoothing",
        "url": "https://data.giss.nasa.gov/gistemp/",
        "baseline": "1951-1980",
        "built": dt.date.today().isoformat(),
        "startYear": int(years[0]),
        "endYear": int(years[-1]),
        "nlat": nlat,
        "nlon": nlon,
        "lat0": float(lat[0]),
        "lon0": float(lon[0]),
        "step": float(lat[1] - lat[0]),
        "scale": 0.1,
        "missing": -128,
        "minMonths": MIN_MONTHS,
        "globalMean": global_mean,
    }
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    size = (OUT / "annual.bin").stat().st_size / 1e6
    print(f"wrote {OUT / 'annual.bin'} ({size:.1f} MB) and meta.json; global mean {years[-1]}: {global_mean[-1]} C")


if __name__ == "__main__":
    main()
