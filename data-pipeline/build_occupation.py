"""Build the Ukraine war layer from the official Ukrainian list of territories.

Source of the statuses: the List of territories where hostilities are (were) conducted or
that are temporarily occupied by the Russian Federation, approved by Order No. 376 of the
Ministry for Development of Communities and Territories of Ukraine (28.02.2025, registered
with the Ministry of Justice No. 380/43786), current edition as published on
zakon.rada.gov.ua/laws/show/z0380-25. Official acts are not subject to copyright in Ukraine.

The list goes settlement by settlement (KATOTTG codes) with a status and start and end dates.
For every settlement this script keeps the status that has no end date, then rolls the
settlements up to territorial communities (hromadas):

  occupied  every listed settlement of the hromada is temporarily occupied now
  partly    some, but not all, listed settlements are temporarily occupied now
  combat    no settlement occupied, at least one in active hostilities now

Hromada boundaries come from OpenStreetMap (© OpenStreetMap contributors, ODbL), matched by
the KATOTTG code in the `katotth` tag. Output:

  frontend/public/data/ukraine/war.json

Usage (from the repository root):
    python data-pipeline/build_occupation.py
    python data-pipeline/build_occupation.py --docx URL [URL ...] --edition DD.MM.YYYY

When the Ministry publishes a new edition, open zakon.rada.gov.ua/laws/show/z0380-25,
copy the three .docx links under "Перелік" and pass them with --docx and the edition date.
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache"
OUT = ROOT / "frontend" / "public" / "data" / "ukraine" / "war.json"

DOCX = [
    "https://zakon.rada.gov.ua/laws/file/text/141/f543637n58.docx",
    "https://zakon.rada.gov.ua/laws/file/text/141/f543637n59.docx",
    "https://zakon.rada.gov.ua/laws/file/text/141/f543637n63.docx",
]
EDITION = "16.10.2026"
ORDER_URL = "https://zakon.rada.gov.ua/laws/show/z0380-25"
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]
UA = "EarthSystemDetective/1.0 (NASA Space Apps 2026 student project)"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

OCCUPIED = "окупован"
ACTIVE = "активних бойових"


def fetch(url: str, data: bytes | None = None, timeout: int = 300) -> bytes:
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def cached(name: str, url: str) -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / name
    if not path.exists():
        print(f"downloading {url}")
        path.write_bytes(fetch(url))
    return path.read_bytes()


def docx_rows(blob: bytes) -> list[list[str]]:
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    rows = []
    for tr in root.iter(f"{W}tr"):
        cells = ["".join(t.text or "" for t in tc.iter(f"{W}t")).strip() for tc in tr.iter(f"{W}tc")]
        rows.append(cells)
    return rows


def parse_date(s: str) -> dt.date | None:
    try:
        return dt.datetime.strptime(s.strip(), "%d.%m.%Y").date()
    except ValueError:
        return None


def current_statuses(urls: list[str]) -> dict[str, dict]:
    """KATOTTG code -> {status, since, names} for the entry that has no end date."""
    by_code: dict[str, dict] = {}
    for i, url in enumerate(urls):
        for row in docx_rows(cached(f"z0380-25-part{i + 1}.docx", url)):
            if len(row) < 8 or not row[4].startswith("UA"):
                continue
            region, district, hromada, settlement, code, status, start, end = row[:8]
            if end.strip():
                continue  # that period is over
            since = parse_date(start)
            prev = by_code.get(code)
            if prev and prev["since"] and since and prev["since"] > since:
                continue
            by_code[code] = {
                "status": status.lower(),
                "since": since,
                "region": region,
                "district": district,
                "hromada": hromada,
                "settlement": settlement,
            }
    return by_code


def hromada_key(code: str) -> str:
    # UA + oblast (2) + district (2) + hromada (3): the first 9 characters name the hromada.
    return code[:9]


def classify(statuses: dict[str, dict]) -> tuple[dict[str, str], dict[str, str], dict]:
    """Hromada classes, whole-region classes (codes without a hromada part) and counts."""
    per = defaultdict(lambda: {"total": 0, "occupied": 0, "active": 0, "since": None, "name": ""})
    regions: dict[str, str] = {}
    for code, s in statuses.items():
        occupied = OCCUPIED in s["status"]
        active = ACTIVE in s["status"]
        # KATOTTG: UA + oblast (2) + district (2) + hromada (3) + settlement (3) + 7 more digits.
        if code[4:9] == "00000" or code[6:9] == "000":
            # A whole oblast or district listed in one row (Crimea, Sevastopol).
            if occupied:
                regions[code[:4] if code[4:9] == "00000" else code[:6]] = "occupied"
            continue
        h = per[hromada_key(code)]
        h["total"] += 1
        h["occupied"] += occupied
        h["active"] += active
        h["name"] = s["hromada"]
        if occupied and s["since"] and (h["since"] is None or s["since"] < h["since"]):
            h["since"] = s["since"]
    classes: dict[str, str] = {}
    for key, h in per.items():
        if h["occupied"] == h["total"] and h["total"]:
            classes[key] = "occupied"
        elif h["occupied"]:
            classes[key] = "partly"
        elif h["active"]:
            classes[key] = "combat"
    counts = {
        "settlementsListed": len(statuses),
        "settlementsOccupied": sum(1 for s in statuses.values() if OCCUPIED in s["status"]),
        "settlementsActive": sum(1 for s in statuses.values() if ACTIVE in s["status"]),
        "hromadasOccupied": sum(1 for c in classes.values() if c == "occupied"),
        "hromadasPartly": sum(1 for c in classes.values() if c == "partly"),
        "hromadasCombat": sum(1 for c in classes.values() if c == "combat"),
    }
    return classes, regions, counts


def overpass(query: str) -> dict:
    last: Exception | None = None
    for attempt in range(4):
        for url in OVERPASS:
            try:
                return json.loads(fetch(url, urllib.parse.urlencode({"data": query}).encode(), timeout=400))
            except Exception as e:  # busy servers answer 429/502/504
                last = e
                time.sleep(10 * (attempt + 1))
    raise RuntimeError(f"Overpass failed: {last}")


def rings_from_members(members: list[dict]) -> list[list[tuple[float, float]]]:
    """Join the outer ways of a boundary relation into closed rings."""
    segments = [[(p["lon"], p["lat"]) for p in m["geometry"]] for m in members if m.get("type") == "way" and m.get("role") in ("outer", "") and m.get("geometry")]
    rings = []
    while segments:
        ring = segments.pop()
        changed = True
        while ring[0] != ring[-1] and changed:
            changed = False
            for i, seg in enumerate(segments):
                if seg[0] == ring[-1]:
                    ring += seg[1:]
                elif seg[-1] == ring[-1]:
                    ring += seg[::-1][1:]
                elif seg[-1] == ring[0]:
                    ring = seg + ring[1:]
                elif seg[0] == ring[0]:
                    ring = seg[::-1] + ring[1:]
                else:
                    continue
                segments.pop(i)
                changed = True
                break
        if len(ring) >= 4:
            rings.append(ring)
    return rings


def simplify(points: list[tuple[float, float]], tol: float) -> list[tuple[float, float]]:
    """Douglas-Peucker on lon/lat."""
    if len(points) < 4:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = points[a], points[b]
        dx, dy = x2 - x1, y2 - y1
        norm = (dx * dx + dy * dy) ** 0.5
        best, idx = 0.0, -1
        for i in range(a + 1, b):
            x0, y0 = points[i]
            if norm:
                d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            else:  # closed ring: first and last points coincide, use the distance to that point
                d = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
            if d > best:
                best, idx = d, i
        if best > tol and idx > 0:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(points, keep) if k]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--docx", nargs="+", default=DOCX)
    parser.add_argument("--edition", default=EDITION)
    args = parser.parse_args()

    statuses = current_statuses(args.docx)
    classes, regions, counts = classify(statuses)
    print("counts", counts, "whole regions", regions)

    oblasts = sorted({k[2:4] for k in classes} | {k[2:4] for k in regions})
    query = (
        '[out:json][timeout:360];relation["boundary"="administrative"]["admin_level"="7"]'
        f'["katotth"~"^UA({"|".join(oblasts)})"];out geom;'
    )
    cache_file = CACHE / f"osm-hromadas-{'-'.join(oblasts)}.json"
    if cache_file.exists():
        osm = json.loads(cache_file.read_text(encoding="utf-8"))
    else:
        print("querying OpenStreetMap (Overpass) for hromada boundaries")
        osm = overpass(query)
        cache_file.write_text(json.dumps(osm), encoding="utf-8")

    features: dict[str, list] = {"occupied": [], "partly": [], "combat": []}
    matched = set()
    for el in osm.get("elements", []):
        code = el.get("tags", {}).get("katotth", "")
        key = hromada_key(code)
        cls = classes.get(key) or regions.get(code[:4]) or regions.get(code[:6])
        if not cls:
            continue
        rings = [simplify(r, 0.003) for r in rings_from_members(el.get("members", []))]
        rings = [[round(v, 4) for p in r for v in p] for r in rings if len(r) >= 4]
        if rings:
            features[cls].append(rings)
            matched.add(key)

    # Regions with no hromada boundaries in OpenStreetMap (Crimea has no hromadas on the ground,
    # Sevastopol is listed whole): when every listed hromada there is occupied, draw the region
    # from its districts (admin levels 5-6), which follow the coastline. The oblast relations
    # (level 4) also take in the 12-mile territorial sea, so they are only a last resort.
    whole = set(regions)
    for prefix in {k[:4] for k in classes}:
        keys = [k for k in classes if k.startswith(prefix)]
        if all(classes[k] == "occupied" for k in keys) and not any(k in matched for k in keys):
            whole.add(prefix)
    whole = sorted(p for p in whole if not any(k.startswith(p) for k in matched))
    if whole:
        cache_whole = CACHE / f"osm-whole-{'-'.join(whole)}.json"
        if cache_whole.exists():
            osm_whole = json.loads(cache_whole.read_text(encoding="utf-8"))
        else:
            print("querying OpenStreetMap for whole-region boundaries", whole)
            osm_whole = overpass(
                '[out:json][timeout:300];relation["boundary"="administrative"]'
                f'["admin_level"~"^[456]$"]["katotth"~"^({"|".join(whole)})"];out geom;'
            )
            cache_whole.write_text(json.dumps(osm_whole), encoding="utf-8")
        done = set()
        for prefix in whole:
            els = [e for e in osm_whole.get("elements", []) if e.get("tags", {}).get("katotth", "").startswith(prefix)]
            districts = [e for e in els if e["tags"].get("admin_level") in ("5", "6")]
            for el in districts or [e for e in els if e["tags"].get("admin_level") == "4"][:1]:
                rings = [simplify(r, 0.003) for r in rings_from_members(el.get("members", []))]
                rings = [[round(v, 4) for p in r for v in p] for r in rings if len(r) >= 4]
                if rings:
                    features["occupied"].append(rings)
                    done.add(prefix)
            if prefix in done:
                matched.update(k for k in classes if k.startswith(prefix))
        print("whole regions drawn", sorted(done))

    missing = sorted(k for k in classes if k not in matched)
    if missing:
        by_oblast = defaultdict(int)
        for k in missing:
            by_oblast[k[:4]] += 1
        print("unmatched hromadas by oblast", dict(by_oblast))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "source": "Перелік територій, на яких ведуться (велися) бойові дії або тимчасово окупованих Російською Федерацією; наказ Мінрозвитку № 376",
                "sourceEn": "List of territories of hostilities or temporary occupation by the Russian Federation, Order No. 376 of the Ministry for Development of Communities and Territories of Ukraine",
                "url": ORDER_URL,
                "edition": args.edition,
                "built": dt.date.today().isoformat(),
                "boundaries": "© OpenStreetMap contributors, ODbL",
                "counts": counts,
                "unmatchedHromadas": len(missing),
                "occupied": features["occupied"],
                "partly": features["partly"],
                "combat": features["combat"],
            },
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    size = OUT.stat().st_size / 1e3
    print(f"wrote {OUT} ({size:.0f} kB): " + ", ".join(f"{k} {len(v)}" for k, v in features.items()) + f"; unmatched hromadas {len(missing)}")


if __name__ == "__main__":
    main()
