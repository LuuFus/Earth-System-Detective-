"""Monthly tropospheric NO2 over Ukraine from NASA OMI (Aura), for the "Air: NO2" layer.

Source: OMNO2d v003, OMI/Aura NO2 Cloud-Screened Total and Tropospheric Column, daily L3 global
0.25 x 0.25 deg (NASA GES DISC). Variable ColumnAmountNO2TropCloudScreened: tropospheric column,
pixels with cloud fraction < 30 %, in molecules per cm2.

Only the box over Ukraine is read, through NASA's cloud OPeNDAP service, so each day costs about
40 kB instead of an 11 MB file. For every 0.25 deg cell the script averages the valid days of a
month (at least MIN_DAYS of them, otherwise the month is missing there).

Needs a NASA Earthdata Login token in data-pipeline/.env (see .env.example).

Output (read by the site):
  frontend/public/data/no2/ukraine.json   grid, months, units, source
  frontend/public/data/no2/ukraine.bin    int16 [month][row][col], rows north to south,
                                          value = column / SCALE, -32768 = no data

Usage (from the repository root):
    python data-pipeline/build_no2.py                 # 2005-01 up to the last complete month
    python data-pipeline/build_no2.py --to 2025-12
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import datetime as dt
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache" / "no2"
OUT = ROOT / "frontend" / "public" / "data" / "no2"

COLLECTION = "C1266136111-GES_DISC"  # OMNO2d v003
VARIABLE = "/HDFEOS/GRIDS/ColumnAmountNO2/Data_Fields/ColumnAmountNO2TropCloudScreened"
# Box over Ukraine with a margin, on the 0.25 deg grid (cell edges).
BOX = {"s": 44.0, "n": 53.0, "w": 22.0, "e": 41.0}
STEP = 0.25
MIN_DAYS = 3
SCALE = 1e13  # stored unit: 1e13 molecules/cm2, so 1e15 reads as 100
UA = "EarthSystemDetective/1.0 (NASA Space Apps 2026 student project)"


def token() -> str:
    env = ROOT / "data-pipeline" / ".env"
    if not env.exists():
        raise SystemExit("data-pipeline/.env is missing: copy .env.example and paste your Earthdata token")
    for line in env.read_text(encoding="utf-8").splitlines():
        if line.startswith("EARTHDATA_TOKEN="):
            value = line.split("=", 1)[1].strip().strip('"')
            if value:
                return value
    raise SystemExit("EARTHDATA_TOKEN is empty in data-pipeline/.env")


def get(url: str, auth: str | None = None, timeout: int = 120) -> bytes:
    headers = {"User-Agent": UA}
    if auth:
        headers["Authorization"] = f"Bearer {auth}"
    last: Exception | None = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise SystemExit(f"NASA refused the token ({e.code}): check data-pipeline/.env and the approved applications")
            last = e
        except Exception as e:  # timeouts, resets
            last = e
        time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"failed after retries: {url[:120]}: {last}")


def granules(month: dt.date) -> list[str]:
    """OPeNDAP URLs of the daily files of one month, from NASA's catalogue (CMR)."""
    end = (month.replace(day=28) + dt.timedelta(days=4)).replace(day=1) - dt.timedelta(seconds=1)
    params = {
        "collection_concept_id": COLLECTION,
        "temporal": f"{month.isoformat()}T00:00:00Z,{end.isoformat()}T23:59:59Z",
        "page_size": 100,
    }
    data = json.loads(get("https://cmr.earthdata.nasa.gov/search/granules.umm_json?" + urllib.parse.urlencode(params)))
    urls = []
    for item in data["items"]:
        for link in item["umm"].get("RelatedUrls", []):
            if link.get("Type") == "USE SERVICE API" and "opendap.earthdata.nasa.gov" in link["URL"]:
                urls.append(link["URL"])
                break
    return sorted(set(urls))


def index_box() -> tuple[int, int, int, int]:
    """Row and column ranges in the global grid; rows run south to north from -90."""
    r0 = round((BOX["s"] + 90) / STEP)
    r1 = round((BOX["n"] + 90) / STEP) - 1
    c0 = round((BOX["w"] + 180) / STEP)
    c1 = round((BOX["e"] + 180) / STEP) - 1
    return r0, r1, c0, c1


def read_day(url: str, auth: str) -> np.ndarray:
    r0, r1, c0, c1 = index_box()
    ce = urllib.parse.quote(f"{VARIABLE}[{r0}:{r1}][{c0}:{c1}]", safe="")
    text = get(f"{url}.dap.csv?dap4.ce={ce}", auth).decode("utf-8")
    rows = []
    for line in text.splitlines():
        if not line.startswith(VARIABLE):
            continue
        rows.append([float(v) for v in line.split(",")[1:]])
    grid = np.array(rows, dtype=np.float64)
    if grid.shape != (r1 - r0 + 1, c1 - c0 + 1):
        raise RuntimeError(f"unexpected shape {grid.shape} from {url[:100]}")
    grid[grid < -1e29] = np.nan
    return grid


def month_mean(month: dt.date, auth: str, pool: cf.ThreadPoolExecutor) -> tuple[np.ndarray, int]:
    cache = CACHE / f"{month:%Y-%m}.npz"
    if cache.exists():
        z = np.load(cache)
        return z["mean"], int(z["days"])
    urls = granules(month)
    if not urls:
        # NASA has no files for this month (OMI has gaps): leave it empty, and do not cache it,
        # so a later run picks the files up if they appear.
        r0, r1, c0, c1 = index_box()
        print(f"{month:%Y-%m}: no OMI files in the NASA archive, left empty", flush=True)
        return np.full((r1 - r0 + 1, c1 - c0 + 1), np.nan), 0
    days = list(pool.map(lambda u: read_day(u, auth), urls))
    stack = np.stack(days)
    valid = np.isfinite(stack).sum(axis=0)
    with np.errstate(invalid="ignore"):
        mean = np.nanmean(np.where(np.isfinite(stack), stack, np.nan), axis=0)
    mean[valid < MIN_DAYS] = np.nan
    CACHE.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(cache, mean=mean, days=len(days))
    return mean, len(days)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--from", dest="start", default="2005-01")
    last_full = (dt.date.today().replace(day=1) - dt.timedelta(days=1)).strftime("%Y-%m")
    parser.add_argument("--to", dest="end", default=last_full)
    args = parser.parse_args()

    auth = token()
    y, m = map(int, args.start.split("-"))
    ye, me = map(int, args.end.split("-"))
    months = []
    while (y, m) <= (ye, me):
        months.append(dt.date(y, m, 1))
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)

    grids = []
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        for i, month in enumerate(months):
            t0 = time.time()
            mean, days = month_mean(month, auth, pool)
            grids.append(mean)
            cover = np.isfinite(mean).mean() * 100
            print(f"{month:%Y-%m}: {days} days, {cover:.0f}% of cells, {time.time() - t0:.1f} s ({i + 1}/{len(months)})", flush=True)

    # Rows north to south, like the other grids of the site.
    cube = np.stack(grids)[:, ::-1, :]
    stored = np.where(np.isfinite(cube), np.round(cube / SCALE), -32768)
    stored = np.clip(stored, -32768, 32767).astype("<i2")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "ukraine.bin").write_bytes(stored.tobytes())
    meta = {
        "source": "NASA OMI/Aura OMNO2d v003, ColumnAmountNO2TropCloudScreened (GES DISC)",
        "url": "https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary",
        "unit": "molecules/cm2",
        "scale": SCALE,
        "noData": -32768,
        "box": BOX,
        "step": STEP,
        "rows": int(cube.shape[1]),
        "cols": int(cube.shape[2]),
        "start": months[0].strftime("%Y-%m"),
        "months": len(months),
        "minDays": MIN_DAYS,
        "built": dt.date.today().isoformat(),
    }
    (OUT / "ukraine.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(f"wrote {OUT / 'ukraine.bin'} ({stored.nbytes / 1e6:.1f} MB), {len(months)} months")


if __name__ == "__main__":
    main()
