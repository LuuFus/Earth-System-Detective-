"""Monthly MODIS vegetation (NDVI) and daytime land surface temperature over Ukraine.

Sources (NASA LP DAAC, read through NASA's cloud OPeNDAP, only the box over Ukraine):
  ndvi  MOD13C2 v061, CMG 0.05 deg monthly NDVI (Terra), 2000-02 onwards
  lst   MOD11C3 v061, CMG 0.05 deg monthly daytime land surface temperature (Terra), 2000-03 onwards

Each month's 0.05 deg pixels are averaged into the same 0.25 deg grid as the NO2 layer; a cell
needs at least half of its 25 pixels with data. Water and missing pixels are left out.

Needs a NASA Earthdata Login token in data-pipeline/.env (see .env.example).

Output (read by the site):
  frontend/public/data/<product>/ukraine.json   grid, months, units, source
  frontend/public/data/<product>/ukraine.bin    int16 [month][row][col], rows north to south,
                                                value * scale = NDVI or degrees C, -32768 = no data

Usage (from the repository root):
    python data-pipeline/build_modis.py ndvi
    python data-pipeline/build_modis.py lst
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import datetime as dt
import json
import sys
import time
import urllib.parse
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_no2 import BOX, STEP, get, token  # noqa: E402  same box, grid and HTTP helpers

ROOT = Path(__file__).resolve().parent.parent
PIXEL = 0.05
BLOCK = round(STEP / PIXEL)  # 5 x 5 pixels per cell

PRODUCTS = {
    "ndvi": {
        "collection": "C2565788914-LPCLOUD",
        "variable": "/MOD_Grid_monthly_CMG_VI/Data_Fields/CMG_0_05_Deg_Monthly_NDVI",
        "fill": -3000,
        "to_value": lambda raw: raw / 10000.0,  # NDVI
        "valid": lambda v: (v >= -0.2) & (v <= 1.0),
        "scale": 1e-4,  # stored int16 * scale = NDVI
        "unit": "NDVI",
        "source": "NASA MODIS/Terra MOD13C2 v061, CMG 0.05 deg monthly NDVI (LP DAAC)",
        "url": "https://lpdaac.usgs.gov/products/mod13c2v061/",
        "start": "2000-03",
    },
    "lst": {
        "collection": "C2565788897-LPCLOUD",
        "variable": "/MODIS_MONTHLY_0_05DEG_CMG_LST/Data_Fields/LST_Day_CMG",
        "fill": 0,
        "to_value": lambda raw: raw * 0.02 - 273.15,  # degrees C
        "valid": lambda v: (v > -80) & (v < 80),
        "scale": 0.01,  # stored int16 * scale = degrees C
        "unit": "degC",
        "source": "NASA MODIS/Terra MOD11C3 v061, CMG 0.05 deg monthly daytime land surface temperature (LP DAAC)",
        "url": "https://lpdaac.usgs.gov/products/mod11c3v061/",
        "start": "2000-03",
    },
}


def granule(collection: str, month: dt.date) -> str | None:
    end = (month.replace(day=28) + dt.timedelta(days=4)).replace(day=1) - dt.timedelta(seconds=1)
    params = {
        "collection_concept_id": collection,
        "temporal": f"{month.isoformat()}T00:00:00Z,{end.isoformat()}T23:59:59Z",
        "page_size": 10,
    }
    data = json.loads(get("https://cmr.earthdata.nasa.gov/search/granules.umm_json?" + urllib.parse.urlencode(params)))
    for item in data["items"]:
        # The monthly file starts on the first day of the month.
        begin = item["umm"].get("TemporalExtent", {}).get("RangeDateTime", {}).get("BeginningDateTime", "")
        if not begin.startswith(month.strftime("%Y-%m")):
            continue
        for link in item["umm"].get("RelatedUrls", []):
            if link.get("Type") == "USE SERVICE API" and "opendap.earthdata.nasa.gov" in link["URL"]:
                return link["URL"]
    return None


def pixel_box() -> tuple[int, int, int, int]:
    """Rows from the north (row 0 = 90 N) and columns from 180 W, on the 0.05 deg grid."""
    r0 = round((90 - BOX["n"]) / PIXEL)
    r1 = round((90 - BOX["s"]) / PIXEL) - 1
    c0 = round((BOX["w"] + 180) / PIXEL)
    c1 = round((BOX["e"] + 180) / PIXEL) - 1
    return r0, r1, c0, c1


def read_month(product: dict, url: str, auth: str) -> np.ndarray:
    r0, r1, c0, c1 = pixel_box()
    ce = urllib.parse.quote(f"{product['variable']}[{r0}:{r1}][{c0}:{c1}]", safe="")
    text = get(f"{url}.dap.csv?dap4.ce={ce}", auth, timeout=300).decode("utf-8")
    rows = [[float(v) for v in line.split(",")[1:] if v.strip()] for line in text.splitlines() if line.startswith(product["variable"])]
    raw = np.array(rows, dtype=np.float64)
    if raw.shape != (r1 - r0 + 1, c1 - c0 + 1):
        raise RuntimeError(f"unexpected shape {raw.shape}")
    values = product["to_value"](raw)
    values[(raw == product["fill"]) | ~product["valid"](values)] = np.nan
    # Average 5 x 5 pixels into each 0.25 deg cell; half of them must have data.
    h, w = values.shape[0] // BLOCK, values.shape[1] // BLOCK
    blocks = values[: h * BLOCK, : w * BLOCK].reshape(h, BLOCK, w, BLOCK)
    count = np.isfinite(blocks).sum(axis=(1, 3))
    with np.errstate(invalid="ignore"):
        mean = np.nanmean(blocks, axis=(1, 3))
    mean[count < (BLOCK * BLOCK) / 2] = np.nan
    return mean  # rows north to south


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("product", choices=sorted(PRODUCTS))
    parser.add_argument("--from", dest="start")
    last_full = (dt.date.today().replace(day=1) - dt.timedelta(days=1)).strftime("%Y-%m")
    parser.add_argument("--to", dest="end", default=last_full)
    args = parser.parse_args()
    product = PRODUCTS[args.product]
    auth = token()
    cache = ROOT / "data-pipeline" / "cache" / args.product
    cache.mkdir(parents=True, exist_ok=True)

    y, m = map(int, (args.start or product["start"]).split("-"))
    ye, me = map(int, args.end.split("-"))
    months = []
    while (y, m) <= (ye, me):
        months.append(dt.date(y, m, 1))
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)

    def one(month: dt.date) -> np.ndarray:
        path = cache / f"{month:%Y-%m}.npy"
        if path.exists():
            return np.load(path)
        url = granule(product["collection"], month)
        if not url:
            print(f"{month:%Y-%m}: no file in the NASA archive, left empty", flush=True)
            r0, r1, c0, c1 = pixel_box()
            return np.full(((r1 - r0 + 1) // BLOCK, (c1 - c0 + 1) // BLOCK), np.nan)
        grid = read_month(product, url, auth)
        np.save(path, grid)
        return grid

    t0 = time.time()
    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        grids = list(pool.map(one, months))
    print(f"{args.product}: {len(months)} months in {time.time() - t0:.0f} s")

    cube = np.stack(grids)
    stored = np.where(np.isfinite(cube), np.round(cube / product["scale"]), -32768)
    stored = np.clip(stored, -32768, 32767).astype("<i2")
    out = ROOT / "frontend" / "public" / "data" / args.product
    out.mkdir(parents=True, exist_ok=True)
    (out / "ukraine.bin").write_bytes(stored.tobytes())
    meta = {
        "source": product["source"],
        "url": product["url"],
        "unit": product["unit"],
        "scale": product["scale"],
        "noData": -32768,
        "box": BOX,
        "step": STEP,
        "rows": int(cube.shape[1]),
        "cols": int(cube.shape[2]),
        "start": months[0].strftime("%Y-%m"),
        "months": len(months),
        "built": dt.date.today().isoformat(),
    }
    (out / "ukraine.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    cover = np.isfinite(cube).mean() * 100
    print(f"wrote {out / 'ukraine.bin'} ({stored.nbytes / 1e6:.1f} MB), {len(months)} months, {cover:.0f}% of cells with data")


if __name__ == "__main__":
    main()
