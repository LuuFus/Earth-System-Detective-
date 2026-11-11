"""Monthly counts of fire and thermal-anomaly detections in Ukraine from NASA FIRMS (VIIRS S-NPP).

Source: NASA FIRMS yearly country archives, VIIRS 375 m on Suomi NPP (public, no key needed):
  https://firms.modaps.eosdis.nasa.gov/data/country/viirs-snpp/<year>/viirs-snpp_<year>_Ukraine.csv

Kept: detections of type 0 (presumed vegetation fire: field and forest fires, and also fires
caused by shelling) with nominal or high confidence. Left out: type 2 (static industrial
sources such as flares and steel plants), type 3 (offshore) and low-confidence detections.

Counts go into the same 0.25 deg grid as the other layers. The archive holds only detections
inside Ukraine, so cells with no detection at all in any year are marked as no data (they are
outside Ukraine or nothing ever burned there).

Output (read by the site):
  frontend/public/data/fires/ukraine.json   grid, months, source
  frontend/public/data/fires/ukraine.bin    int16 [month][row][col], rows north to south, counts,
                                            -32768 = no data

Usage (from the repository root):
    python data-pipeline/build_fires.py
    python data-pipeline/build_fires.py --to 2025
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_no2 import BOX, STEP, get  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache" / "fires"
OUT = ROOT / "frontend" / "public" / "data" / "fires"
URL = "https://firms.modaps.eosdis.nasa.gov/data/country/viirs-snpp/{y}/viirs-snpp_{y}_Ukraine.csv"
FIRST = 2012


def year_rows(year: int) -> list[dict] | None:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"viirs-snpp_{year}_Ukraine.csv"
    if not path.exists():
        try:
            path.write_bytes(get(URL.format(y=year)))
        except Exception as e:  # the current year appears only when it is over
            print(f"{year}: no yearly file ({e})")
            return None
    return list(csv.DictReader(io.StringIO(path.read_text(encoding="utf-8"))))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--to", type=int, default=dt.date.today().year - 1)
    args = parser.parse_args()

    rows_n = round((BOX["n"] - BOX["s"]) / STEP)
    cols_n = round((BOX["e"] - BOX["w"]) / STEP)
    years = list(range(FIRST, args.to + 1))
    cube = np.zeros((len(years) * 12, rows_n, cols_n), dtype=np.int32)
    kept = dropped = 0
    for yi, year in enumerate(years):
        rows = year_rows(year)
        if rows is None:
            raise SystemExit(f"missing FIRMS archive for {year}")
        for r in rows:
            if r.get("type") not in ("0",) or r.get("confidence") == "l":
                dropped += 1
                continue
            lat, lon = float(r["latitude"]), float(r["longitude"])
            if not (BOX["s"] <= lat < BOX["n"] and BOX["w"] <= lon < BOX["e"]):
                continue
            month = int(r["acq_date"][5:7])
            row = int((BOX["n"] - lat) / STEP)
            col = int((lon - BOX["w"]) / STEP)
            cube[yi * 12 + month - 1, row, col] += 1
            kept += 1
        print(f"{year}: {sum(1 for _ in rows)} rows", flush=True)

    ever = cube.sum(axis=0) > 0
    stored = np.where(ever[None, :, :], np.minimum(cube, 32767), -32768).astype("<i2")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "ukraine.bin").write_bytes(stored.tobytes())
    meta = {
        "source": "NASA FIRMS, VIIRS 375 m (Suomi NPP), yearly country archive for Ukraine; type 0, nominal and high confidence",
        "url": "https://firms.modaps.eosdis.nasa.gov/country/",
        "unit": "detections",
        "scale": 1,
        "noData": -32768,
        "box": BOX,
        "step": STEP,
        "rows": rows_n,
        "cols": cols_n,
        "start": f"{FIRST}-01",
        "months": len(years) * 12,
        "built": dt.date.today().isoformat(),
    }
    (OUT / "ukraine.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(f"wrote {OUT / 'ukraine.bin'}: {kept} detections kept, {dropped} left out, {int(ever.sum())} cells with data")


if __name__ == "__main__":
    main()
