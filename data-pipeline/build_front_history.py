"""Occupied territory of Ukraine week by week since 2022, for the timeline player.

Source: DeepState (deepstatemap.live), every published version of the map:
  https://deepstatemap.live/api/history/public            list of versions
  https://deepstatemap.live/api/history/<id>/geojson      one version

For one version a week (the last one on or before each Sunday since 3 April 2022, plus the newest)
the script keeps the polygons DeepState marks as occupied — the occupied areas, Crimea and the
parts of Donetsk and Luhansk regions occupied since 2014 — inside Ukraine. Areas marked as
liberated or of unknown status are left out, and so are the "occupied" territories of other
countries the newer versions also draw. A first frame, before 24 February 2022, holds only Crimea
and the 2014 line, as the first version draws them.

Numbers: every frame is rasterised at 0.005° (about 400 x 550 m) and cut along Ukraine's border
(Natural Earth, with Crimea). Area = sum of cell areas; captured / liberated = cells occupied now
but not a week before, and the other way round. The border lines are simplified (Douglas-Peucker,
0.003°) and rounded to 0.001° for drawing.

Output: frontend/public/data/ukraine/front-history.json
  rings   pool of rings, each [lon0, lat0, dlon1, dlat1, ...] in thousandths of a degree
  ukraine Ukraine's outline, same encoding, to clip the drawing
  frames  [{d: date, r: [ring indices], a: km², g: km² captured, l: km² liberated, pre?: 1}]

Needs numpy only. Downloads are cached in data-pipeline/cache/front/.

Usage (from the repository root):
    python data-pipeline/build_front_history.py
"""

from __future__ import annotations

import datetime as dt
import json
import math
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache" / "front"
OUT = ROOT / "frontend" / "public" / "data" / "ukraine" / "front-history.json"
COUNTRIES = ROOT / "frontend" / "public" / "data" / "geo" / "countries.json"
API = "https://deepstatemap.live/api/history"
AGENT = "EarthSystemDetective/1.0 (open-source educational site)"

# Grid for the numbers: covers every area occupied since 2022.
W, E, S, N = 28.0, 40.5, 44.0, 52.6
STEP = 0.005
COLS = round((E - W) / STEP)
ROWS = round((N - S) / STEP)
Q = 1000  # thousandths of a degree
UKRAINE_KM2 = 603_628  # official area of Ukraine, with Crimea
SIMPLIFY = 0.003

OCCUPIED = ("окупован", "ордло", "крим", "зайняті ворогом", "occupied", "cadr")
NOT_OCCUPIED = ("звільн", "liberated", "абхаз", "цхінвал", "придністр", "transnistria", "невідом", "unknown", "під питанням")


def get(url: str, path: Path | None = None) -> bytes:
    if path and path.exists():
        return path.read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            break
        except Exception as err:  # noqa: BLE001
            if attempt == 3:
                raise
            print(f"  retry {url}: {err}")
            time.sleep(3 * (attempt + 1))
    if path:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        time.sleep(0.4)  # be gentle with the server
    return data


def is_occupied(name: str) -> bool:
    n = name.lower()
    return any(k in n for k in OCCUPIED) and not any(k in n for k in NOT_OCCUPIED)


def polygons(geom: dict) -> list[list[list[list[float]]]]:
    """Every polygon (a list of rings) in a geometry."""
    t = geom.get("type")
    if t == "Polygon":
        return [geom["coordinates"]]
    if t == "MultiPolygon":
        return list(geom["coordinates"])
    if t == "GeometryCollection":
        return [p for g in geom.get("geometries", []) for p in polygons(g)]
    return []


def occupied_polygons(fc: dict, only: tuple[str, ...] | None = None) -> list[list[np.ndarray]]:
    out = []
    for f in fc.get("features", []):
        name = (f.get("properties") or {}).get("name") or ""
        if not f.get("geometry") or not is_occupied(name):
            continue
        if only and not any(k in name.lower() for k in only):
            continue
        for poly in polygons(f["geometry"]):
            rings = [np.asarray([[c[0], c[1]] for c in ring], dtype=np.float64) for ring in poly if len(ring) >= 4]
            if not rings:
                continue
            cx, cy = rings[0][:, 0].mean(), rings[0][:, 1].mean()
            if W <= cx <= E and S <= cy <= N:
                out.append(rings)
    return out


def rasterise(polys: list[list[np.ndarray]]) -> np.ndarray:
    """Union of the polygons (each filled even-odd with its holes) on the grid, by cell centres."""
    mask = np.zeros((ROWS, COLS), dtype=bool)
    for rings in polys:
        x1 = []
        y1 = []
        x2 = []
        y2 = []
        for ring in rings:
            px = (ring[:, 0] - W) / STEP
            py = (N - ring[:, 1]) / STEP
            x1.append(px)
            y1.append(py)
            x2.append(np.roll(px, -1))
            y2.append(np.roll(py, -1))
        ax, ay, bx, by = (np.concatenate(v) for v in (x1, y1, x2, y2))
        keep = ay != by
        ax, ay, bx, by = ax[keep], ay[keep], bx[keep], by[keep]
        lo = np.minimum(ay, by)
        hi = np.maximum(ay, by)
        r0 = np.ceil(lo - 0.5).astype(int)
        r1 = np.ceil(hi - 0.5).astype(int)  # exclusive
        r0 = np.clip(r0, 0, ROWS)
        r1 = np.clip(r1, 0, ROWS)
        counts = np.maximum(0, r1 - r0)
        if counts.sum() == 0:
            continue
        idx = np.repeat(np.arange(len(ax)), counts)
        offs = np.arange(counts.sum()) - np.repeat(np.cumsum(counts) - counts, counts)
        rows = r0[idx] + offs
        yc = rows + 0.5
        xs = ax[idx] + (yc - ay[idx]) * (bx[idx] - ax[idx]) / (by[idx] - ay[idx])
        order = np.lexsort((xs, rows))
        rows = rows[order]
        xs = xs[order]
        # Pairs of crossings in each row bound the filled spans (even-odd).
        diff = np.zeros((ROWS, COLS + 1), dtype=np.int32)
        start = np.ones(len(rows), dtype=bool)
        start[1:] = rows[1:] != rows[:-1]
        k = np.zeros(len(rows), dtype=int)
        # position of each crossing within its row
        group = np.cumsum(start) - 1
        first = np.flatnonzero(start)
        k = np.arange(len(rows)) - first[group]
        a = k % 2 == 0
        b = np.flatnonzero(a)
        b = b[b + 1 < len(rows)]
        b = b[rows[b + 1] == rows[b]]
        c0 = np.clip(np.ceil(xs[b] - 0.5).astype(int), 0, COLS)
        c1 = np.clip(np.ceil(xs[b + 1] - 0.5).astype(int), 0, COLS)
        np.add.at(diff, (rows[b], c0), 1)
        np.add.at(diff, (rows[b], c1), -1)
        mask |= np.cumsum(diff, axis=1)[:, :COLS] > 0
    return mask


ROW_LAT = N - (np.arange(ROWS) + 0.5) * STEP
CELL_KM2 = (STEP * 111.32 * np.cos(np.radians(ROW_LAT))) * (STEP * 110.57)


def area(mask: np.ndarray) -> float:
    return float((mask.sum(axis=1) * CELL_KM2).sum())


def simplify(ring: np.ndarray, tol: float) -> np.ndarray:
    """Douglas-Peucker on a closed ring."""
    n = len(ring)
    if n < 5:
        return ring
    keep = np.zeros(n, dtype=bool)
    keep[0] = keep[-1] = True
    # Split the ring at its farthest point from the first one, so both halves are open lines.
    far = int(np.argmax(((ring - ring[0]) ** 2).sum(axis=1)))
    keep[far] = True
    stack = [(0, far), (far, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        seg = ring[i + 1 : j]
        a, b = ring[i], ring[j]
        d = b - a
        length = math.hypot(d[0], d[1])
        if length == 0:
            dist = np.hypot(seg[:, 0] - a[0], seg[:, 1] - a[1])
        else:
            dist = np.abs(d[0] * (seg[:, 1] - a[1]) - d[1] * (seg[:, 0] - a[0])) / length
        m = int(np.argmax(dist))
        if dist[m] > tol:
            k = i + 1 + m
            keep[k] = True
            stack.append((i, k))
            stack.append((k, j))
    return ring[keep]


def encode(ring: np.ndarray) -> tuple[int, ...] | None:
    r = simplify(ring, SIMPLIFY)
    q = np.round(r * Q).astype(np.int64)
    # Drop repeated points after rounding.
    keep = np.ones(len(q), dtype=bool)
    keep[1:] = np.any(q[1:] != q[:-1], axis=1)
    q = q[keep]
    if len(q) < 4:
        return None
    flat = q.reshape(-1)
    out = np.empty_like(flat)
    out[:2] = flat[:2]
    out[2:] = flat[2:] - flat[:-2]
    return tuple(int(v) for v in out)


def main() -> None:
    print("versions…")
    versions = json.loads(get(f"{API}/public"))
    versions = sorted((v for v in versions if v.get("status") is not False), key=lambda v: v["createdAt"])
    by_day: dict[str, dict] = {}
    for v in versions:
        by_day[v["createdAt"][:10]] = v  # the last version of each day
    days = sorted(by_day)
    first = dt.date.fromisoformat(days[0])
    last = dt.date.fromisoformat(days[-1])
    targets = []
    d = first
    while d <= last:
        targets.append(d)
        d += dt.timedelta(days=7)
    if targets[-1] != last:
        targets.append(last)
    picks: list[tuple[str, dict]] = []
    for t in targets:
        day = max(x for x in days if x <= t.isoformat())
        if not picks or picks[-1][1]["id"] != by_day[day]["id"]:
            picks.append((t.isoformat(), by_day[day]))
    print(f"{len(versions)} versions, {len(picks)} weekly frames {picks[0][0]} … {picks[-1][0]}")

    countries = json.loads(COUNTRIES.read_text(encoding="utf-8"))["countries"]
    ua = next(c for c in countries if c["code"] == "UA")
    ua_rings = [np.asarray(r, dtype=np.float64).reshape(-1, 2) for r in ua["rings"]]
    # The grid covers only the east (every area occupied since 2022); the share is of the whole country.
    ua_mask = rasterise([ua_rings])
    ua_area = UKRAINE_KM2

    pool: dict[tuple[int, ...], int] = {}
    rings_out: list[list[int]] = []

    def ring_ids(polys: list[list[np.ndarray]]) -> list[int]:
        ids = []
        for rings in polys:
            for ring in rings:
                e = encode(ring)
                if e is None:
                    continue
                if e not in pool:
                    pool[e] = len(rings_out)
                    rings_out.append(list(e))
                ids.append(pool[e])
        return ids

    frames = []
    prev = None
    for i, (date, v) in enumerate(picks):
        fc = json.loads(get(f"{API}/{v['id']}/geojson", CACHE / f"{v['id']}.json"))
        if i == 0:
            # Before the full-scale invasion: Crimea and the 2014 line, as the first version draws them.
            pre = occupied_polygons(fc, only=("крим", "ордло", "crimea", "cadr"))
            m = rasterise(pre) & ua_mask
            frames.append({"d": "2022-02-23", "r": ring_ids(pre), "a": round(area(m)), "g": 0, "l": 0, "pre": 1})
            prev = m
        polys = occupied_polygons(fc)
        m = rasterise(polys) & ua_mask
        g = area(m & ~prev) if prev is not None else 0
        lost = area(prev & ~m) if prev is not None else 0
        frames.append({"d": date, "v": v["id"], "r": ring_ids(polys), "a": round(area(m)), "g": round(g), "l": round(lost)})
        prev = m
        if i % 20 == 0 or i == len(picks) - 1:
            print(f"  {date}: {area(m):,.0f} km² ({100 * area(m) / ua_area:.1f}%), +{g:,.0f} −{lost:,.0f}")

    out = {
        "source": "DeepState (deepstatemap.live): occupied areas, Crimea and the 2014 line, one version a week",
        "url": "https://deepstatemap.live/",
        "built": dt.date.today().isoformat(),
        "q": Q,
        "box": [W, S, E, N],
        "ukraineKm2": round(ua_area),
        "ukraine": [list(encode(r) or ()) for r in ua_rings],
        "rings": rings_out,
        "frames": frames,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(frames)} frames, {len(rings_out)} rings, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    sys.exit(main())
