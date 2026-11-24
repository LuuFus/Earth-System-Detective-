"""Live data for the site: the weather forecast (NOAA GFS) and fires (NASA FIRMS).

Both sources refuse requests from a browser on another site (no CORS), so a GitHub Action runs
this script every hour and publishes the files with the site. Locally:

    python data-pipeline/build_live.py            # weather and fires
    python data-pipeline/build_live.py --no-gfs   # fires only (fast)

Weather: the newest complete GFS run on a 1° grid, every 3 hours from +3 h to +72 h, read with
grib2.py. Each frame is one file of six byte grids, 360 x 181, rows north to south, columns from
0° east:
    u, v       wind at 10 m, (byte - 128) * 0.5 m/s
    t          air at 2 m, byte / 2 - 70 °C
    precip     rain and snow, (byte / 32)^2 mm per hour
    gust       wind gusts, byte / 4 m/s
    cloud      total cloud, byte %

Fires: VIIRS detections of the last 48 hours from NOAA-20, NOAA-21 and Suomi NPP, one point per
375 m pixel (the newest detection, the strongest fire). Arrays one after another: lat float32,
lon float32, age in minutes uint16, fire power in MW uint16, flags uint8 (1 = night, 2 = high
confidence). Plus fires per day in Ukraine for the last 7 days.

Air: PM2.5 and PM10 from Sensor.Community's open citizen sensors (hourly means, outdoor only),
with the US EPA Air Quality Index computed from them (2024 breakpoints), as air.json.

Air forecast: the CAMS European air quality model (Copernicus) through Open-Meteo, 4 days ahead
every 3 hours on a 0.5° grid over Ukraine and its neighbours (43-55° N, 20-42° E): US AQI, PM2.5
and dust. A model, not measurements: it fills the places without stations and shows where smoke
and dust are going. The model runs once or twice a day, so the grid is fetched again only when
the published one is over 11 hours old (it is taken back from the live site otherwise, as the
GitHub Action starts with no files). One byte per value, 255 = no value:
    aqi    US AQI, byte * 2
    pm25   PM2.5, (byte / 11)^2 ug/m3
    dust   dust, (byte / 5.6)^2 ug/m3
Arrays [time][variable][row north to south][column west to east].

Radiation: the background gamma dose rate at fixed stations around the world, as radiation.json:
official networks with open data (Germany: BfS ODL, about 1700 probes; Finland: STUK through the
Finnish Meteorological Institute, about 250) and volunteers' counters (Safecast, CC0; Geiger
counters of Sensor.Community, ODbL). Volunteer counters give counts per minute; they are turned
into uSv/h with the factor of each tube (Safecast: 334 counts a minute per uSv/h for the LND 7317
and 7318, 108 for the LND 712 and 7128; Sensor.Community: the MultiGeiger factors). Readings
older than 48 hours are left out. Each point: [lat, lon, uSv/h, minutes old, source].
The Ukrainian stations (SaveEcoBot) are read by the site itself, every five minutes.

Binary files are zlib-compressed (the site inflates them with DecompressionStream).

Output: frontend/public/data/live/manifest.json, weather/fNNN.bin, fires.bin, air.json, airq.bin,
radiation.json
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import math
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from grib2 import read_grib2  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "public" / "data" / "live"
UA_SHAPE = ROOT / "frontend" / "public" / "data" / "geo" / "countries.json"
AGENT = "EarthSystemDetective/1.0 (open-source educational site)"

NOMADS = "https://nomads.ncep.noaa.gov"
HOURS = list(range(3, 73, 3))
# (discipline, category, number, surface type) -> name; levels are checked separately.
WANTED = {
    (0, 2, 2, 103): "u",
    (0, 2, 3, 103): "v",
    (0, 0, 0, 103): "t",
    (0, 1, 7, 1): "precip",
    (0, 2, 22, 1): "gust",
    (0, 6, 1, 10): "cloud",
}
ORDER = ["u", "v", "t", "precip", "gust", "cloud"]

FIRMS = "https://firms.modaps.eosdis.nasa.gov/data/active_fire"
SATELLITES = [
    ("noaa-20-viirs-c2", "J1_VIIRS_C2", "NOAA-20"),
    ("noaa-21-viirs-c2", "J2_VIIRS_C2", "NOAA-21"),
    ("suomi-npp-viirs-c2", "SUOMI_VIIRS_C2", "Suomi NPP"),
    # MODIS on Terra and Aqua: coarser (1 km) but often the freshest pass, and a backup when a
    # VIIRS feed is down.
    ("modis-c6.1", "MODIS_C6_1", "MODIS Terra/Aqua"),
]


def confidence(r: dict) -> str:
    """VIIRS gives l/n/h, MODIS a number from 0 to 100."""
    c = (r.get("confidence") or "").strip().lower()
    if c in ("l", "low"):
        return "low"
    if c in ("h", "high"):
        return "high"
    if c.isdigit():
        v = int(c)
        return "low" if v < 30 else "high" if v >= 80 else "nominal"
    return "nominal"


def get(url: str, tries: int = 4, timeout: int = 120) -> bytes:
    last: Exception | None = None
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
            time.sleep(2 + 3 * k)
    raise RuntimeError(f"{url}: {last}")


def exists(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": AGENT})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status == 200
    except Exception:
        return False


# ---------- weather ----------


def latest_run(now: dt.datetime) -> dt.datetime:
    """Newest GFS cycle whose last frame we need is already on NOMADS."""
    cycle = now.replace(minute=0, second=0, microsecond=0, hour=now.hour // 6 * 6)
    for _ in range(6):
        stamp = cycle.strftime("%Y%m%d")
        hh = cycle.strftime("%H")
        url = f"{NOMADS}/pub/data/nccf/com/gfs/prod/gfs.{stamp}/{hh}/atmos/gfs.t{hh}z.pgrb2.1p00.f{HOURS[-1]:03d}.idx"
        if exists(url):
            return cycle
        cycle -= dt.timedelta(hours=6)
    raise RuntimeError("no complete GFS run found on NOMADS")


def frame_url(run: dt.datetime, hour: int) -> str:
    stamp = run.strftime("%Y%m%d")
    hh = run.strftime("%H")
    params = [
        f"dir=%2Fgfs.{stamp}%2F{hh}%2Fatmos",
        f"file=gfs.t{hh}z.pgrb2.1p00.f{hour:03d}",
        "var_UGRD=on",
        "var_VGRD=on",
        "var_TMP=on",
        "var_PRATE=on",
        "var_GUST=on",
        "var_TCDC=on",
        "lev_10_m_above_ground=on",
        "lev_2_m_above_ground=on",
        "lev_surface=on",
        "lev_entire_atmosphere=on",
    ]
    return f"{NOMADS}/cgi-bin/filter_gfs_1p00.pl?" + "&".join(params)


def quantize(name: str, v: np.ndarray) -> np.ndarray:
    if name in ("u", "v"):
        q = np.round(v / 0.5) + 128
    elif name == "t":
        q = np.round((v - 273.15 + 70) * 2)
    elif name == "precip":
        q = np.round(np.sqrt(np.maximum(v, 0) * 3600) * 32)  # kg/m²/s -> mm/h
    elif name == "gust":
        q = np.round(v * 4)
    else:
        q = np.round(v)
    return np.clip(q, 0, 255).astype(np.uint8)


def build_weather(now: dt.datetime) -> dict:
    run = latest_run(now)
    print(f"GFS run {run:%Y-%m-%d %HZ}")
    folder = OUT / "weather"
    folder.mkdir(parents=True, exist_ok=True)
    frames = []
    for hour in HOURS:
        fields = read_grib2(get(frame_url(run, hour)))
        grids: dict[str, np.ndarray] = {}
        for f in fields:
            name = WANTED.get((f.discipline, f.category, f.number, f.surface))
            if not name:
                continue
            if name in ("u", "v") and f.level != 10:
                continue
            if name == "t" and f.level != 2:
                continue
            if (f.ni, f.nj, f.lat1, f.lon1) != (360, 181, 90.0, 0.0):
                raise RuntimeError(f"unexpected GFS grid {f.ni}x{f.nj} from {f.lat1},{f.lon1}")
            grids[name] = quantize(name, f.values)
        missing = [n for n in ORDER if n not in grids]
        if missing:
            raise RuntimeError(f"f{hour:03d}: missing {missing}")
        blob = b"".join(grids[n].tobytes() for n in ORDER)
        name = f"f{hour:03d}.bin"
        (folder / name).write_bytes(zlib.compress(blob, 9))
        valid = run + dt.timedelta(hours=hour)
        frames.append({"hour": hour, "time": valid.strftime("%Y-%m-%dT%H:%MZ"), "file": f"weather/{name}"})
        print(f"  +{hour:02d} h  {valid:%d %b %H:%MZ}  {len(blob) // 1024} KB")
    # Frames from an older run are left behind on a new run with the same names: nothing to delete.
    return {
        "source": "NOAA NCEP GFS 0.25/1.0 deg, via NOMADS",
        "url": "https://www.nco.ncep.noaa.gov/pmb/products/gfs/",
        "run": run.strftime("%Y-%m-%dT%HZ"),
        "grid": {"ni": 360, "nj": 181, "lat0": 90, "lon0": 0, "step": 1},
        "vars": ORDER,
        "compression": "deflate",
        "frames": frames,
    }


# ---------- fires ----------


def load_ukraine() -> list[list[tuple[float, float]]]:
    """Ukraine's outline from the site's Natural Earth countries (Crimea included)."""
    data = json.loads(UA_SHAPE.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("countries", data.get("features", []))
    for c in items:
        code = c.get("code") or c.get("iso") or c.get("properties", {}).get("ISO_A2")
        if code == "UA":
            rings = c.get("rings") or []
            return [[(ring[i], ring[i + 1]) for i in range(0, len(ring), 2)] for ring in rings]
    return []


def inside(rings: list[list[tuple[float, float]]], lon: float, lat: float) -> bool:
    hit = False
    for ring in rings:
        n = len(ring)
        j = n - 1
        for i in range(n):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi:
                hit = not hit
            j = i
    return hit


def read_firms(region: str, span: str) -> list[dict]:
    rows: list[dict] = []
    for folder, prefix, label in SATELLITES:
        url = f"{FIRMS}/{folder}/csv/{prefix}_{region}_{span}.csv"
        try:
            text = get(url, timeout=300).decode("utf-8", "replace")
        except RuntimeError as e:
            print(f"  {label}: {e}")
            continue
        part = list(csv.DictReader(io.StringIO(text)))
        print(f"  {label} {region} {span}: {len(part)} detections")
        rows.extend(part)
    return rows


def build_fires(now: dt.datetime) -> dict:
    print("FIRMS fires")
    rows = read_firms("Global", "48h")
    # One point per ~375 m pixel: the newest detection and the strongest fire there.
    cells: dict[tuple[int, int], list] = {}
    for r in rows:
        try:
            lat = float(r["latitude"])
            lon = float(r["longitude"])
            when = dt.datetime.strptime(f"{r['acq_date']} {int(r['acq_time']):04d}", "%Y-%m-%d %H%M").replace(tzinfo=dt.timezone.utc)
            frp = float(r.get("frp") or 0)
        except (KeyError, ValueError):
            continue
        conf = confidence(r)
        if conf == "low":
            continue
        key = (round(lat / 0.0035), round(lon / 0.0035))
        age = max(0, int((now - when).total_seconds() // 60))
        flags = (1 if (r.get("daynight") or "D") == "N" else 0) | (2 if conf == "high" else 0)
        old = cells.get(key)
        if old is None:
            cells[key] = [lat, lon, age, frp, flags]
        else:
            old[2] = min(old[2], age)
            old[3] = max(old[3], frp)
            old[4] |= flags & 2
    pts = np.array(list(cells.values()), dtype=np.float64) if cells else np.zeros((0, 5))
    # Ages are counted from the build time; the site adds the time since the build.
    newest = (now - dt.timedelta(minutes=float(pts[:, 2].min()))).strftime("%Y-%m-%dT%H:%MZ") if len(pts) else None
    order = np.argsort(-pts[:, 2]) if len(pts) else np.zeros(0, dtype=int)  # oldest first, newest drawn on top
    pts = pts[order]
    n = len(pts)
    blob = b"".join(
        [
            pts[:, 0].astype(np.float32).tobytes(),
            pts[:, 1].astype(np.float32).tobytes(),
            np.clip(pts[:, 2], 0, 65535).astype(np.uint16).tobytes(),
            np.clip(np.round(pts[:, 3]), 0, 65535).astype(np.uint16).tobytes(),
            pts[:, 4].astype(np.uint8).tobytes(),
        ]
    )
    (OUT / "fires.bin").write_bytes(zlib.compress(blob, 9))
    print(f"  {n} fire pixels, {len(blob) // 1024} KB")

    # Fires per day in Ukraine, last 7 days (FIRMS Europe files cover it).
    rings = load_ukraine()
    days: dict[str, set] = {}
    for r in read_firms("Europe", "7d"):
        try:
            lat = float(r["latitude"])
            lon = float(r["longitude"])
        except (KeyError, ValueError):
            continue
        if not (44 <= lat <= 52.5 and 22 <= lon <= 40.3) or (rings and not inside(rings, lon, lat)):
            continue
        if confidence(r) == "low":
            continue
        days.setdefault(r["acq_date"], set()).add((round(lat / 0.0035), round(lon / 0.0035)))
    today = now.date()
    ukraine = []
    for k in range(6, -1, -1):
        d = (today - dt.timedelta(days=k)).isoformat()
        ukraine.append({"date": d, "count": len(days.get(d, ()))})
    print(f"  Ukraine, 7 days: {[x['count'] for x in ukraine]}")
    return {
        "source": "NASA FIRMS, near real time: VIIRS 375 m (NOAA-20, NOAA-21, Suomi NPP) and MODIS 1 km (Terra, Aqua)",
        "newest": newest,
        "url": "https://firms.modaps.eosdis.nasa.gov/",
        "file": "fires.bin",
        "compression": "deflate",
        "count": n,
        "hours": 48,
        "ukraine": ukraine,
    }


# ---------- air ----------

SENSOR_COMMUNITY = "https://data.sensor.community/static/v2/data.1h.json"
# US EPA AQI breakpoints (2024): concentration ranges and index ranges.
PM25_BP = [(0.0, 9.0, 0, 50), (9.1, 35.4, 51, 100), (35.5, 55.4, 101, 150), (55.5, 125.4, 151, 200), (125.5, 225.4, 201, 300), (225.5, 325.4, 301, 500)]
PM10_BP = [(0, 54, 0, 50), (55, 154, 51, 100), (155, 254, 101, 150), (255, 354, 151, 200), (355, 424, 201, 300), (425, 604, 301, 500)]


def aqi_from(c: float, table) -> int:
    for lo, hi, ilo, ihi in table:
        if c <= hi:
            return round(ilo + (ihi - ilo) * (max(c, lo) - lo) / (hi - lo))
    return 500


def sensor_community() -> list:
    return json.loads(get(SENSOR_COMMUNITY, timeout=300).decode("utf-8"))


def build_air(now: dt.datetime, rows: list) -> dict:
    print("Sensor.Community air")
    by_place: dict = {}
    for r in rows:
        loc = r.get("location") or {}
        if str(loc.get("indoor", "0")) == "1":
            continue
        try:
            lat = float(loc["latitude"])
            lon = float(loc["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        vals = {}
        for v in r.get("sensordatavalues") or []:
            if v.get("value_type") in ("P1", "P2"):
                try:
                    vals[v["value_type"]] = float(v["value"])
                except (TypeError, ValueError):
                    pass
        pm25 = vals.get("P2")
        pm10 = vals.get("P1")
        # Broken or saturated sensors report impossible values: leave them out.
        if pm25 is None or not (0 <= pm25 < 500) or (pm10 is not None and not (0 <= pm10 < 1000)):
            continue
        key = (round(lat, 3), round(lon, 3))
        by_place[key] = (lat, lon, pm25, pm10, loc.get("country") or "")
    # Low-cost sensors fail in fog or when broken and read hundreds of µg/m³ next to neighbours
    # reading tens. A sensor far above the median of its neighbours within 25 km is dropped.
    places = list(by_place.values())
    cells: dict = {}
    for k, (lat, lon, *_rest) in enumerate(places):
        cells.setdefault((int((lat + 90) * 4), int((lon + 180) * 4)), []).append(k)
    kept = []
    dropped = 0
    for k, (lat, lon, pm25, pm10, cc) in enumerate(places):
        a, b = int((lat + 90) * 4), int((lon + 180) * 4)
        near = []
        for da in (-1, 0, 1):
            for db in (-1, 0, 1):
                for j in cells.get((a + da, b + db), ()):
                    if j == k:
                        continue
                    la, lo = places[j][0], places[j][1]
                    if (la - lat) ** 2 + ((lo - lon) * math.cos(math.radians(lat))) ** 2 < (25 / 111.2) ** 2:
                        near.append(places[j][2])
        if pm25 > 250 or (len(near) >= 3 and pm25 > max(3 * float(np.median(near)), float(np.median(near)) + 60)):
            dropped += 1
            continue
        kept.append(places[k])
    print(f"  dropped {dropped} outliers")
    points = []
    for lat, lon, pm25, pm10, cc in kept:
        aqi = max(aqi_from(pm25, PM25_BP), aqi_from(pm10, PM10_BP) if pm10 is not None else 0)
        points.append([round(lat, 3), round(lon, 3), round(pm25, 1), None if pm10 is None else round(pm10, 1), aqi, cc])
    (OUT / "air.json").write_text(json.dumps({"built": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "p": points}, separators=(",", ":")), encoding="utf-8")
    print(f"  {len(points)} outdoor sensors")
    return {
        "source": "Sensor.Community (open citizen sensors), hourly means; AQI by US EPA 2024 breakpoints",
        "url": "https://sensor.community/",
        "file": "air.json",
        "count": len(points),
    }


# ---------- radiation ----------

BFS = ("https://www.imis.bfs.de/ogc/opendata/ows?service=WFS&version=1.1.0&request=GetFeature"
       "&typeName=opendata:odlinfo_odl_1h_latest&outputFormat=application/json")
STUK = ("https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature"
        "&storedquery_id=stuk::observations::external-radiation::latest::multipointcoverage")
SAFECAST = "https://tt.safecast.org/devices"
RAD_SOURCES = [
    {"id": "bfs", "name": "BfS ODL (Germany)", "url": "https://odlinfo.bfs.de/", "licence": "dl-de/by-2-0", "kind": "official"},
    {"id": "stuk", "name": "STUK (Finland)", "url": "https://en.ilmatieteenlaitos.fi/open-data", "licence": "CC BY 4.0", "kind": "official"},
    {"id": "safecast", "name": "Safecast", "url": "https://safecast.org/", "licence": "CC0", "kind": "volunteer"},
    {"id": "sensor", "name": "Sensor.Community", "url": "https://sensor.community/", "licence": "ODbL", "kind": "volunteer"},
]
# Counts a minute for 1 uSv/h (Cs-137), by tube.
SAFECAST_TUBES = [("lnd_7318u", 334.0), ("lnd_7318c", 334.0), ("lnd_7317", 334.0), ("lnd_7128ec", 108.0), ("lnd_712u", 108.0)]
# MultiGeiger (Sensor.Community): uSv/h per count a second.
SENSOR_TUBES = {"Radiation SBM-20": 1 / 2.47, "Radiation SBM-19": 1 / 9.81888, "Radiation Si22G": 1 / 12.2792}
MAX_AGE_MIN = 48 * 60


def iso_time(text: str) -> dt.datetime | None:
    try:
        return dt.datetime.fromisoformat(text.replace("Z", "+00:00").replace(" ", "T")).astimezone(dt.timezone.utc)
    except (ValueError, AttributeError):
        return None


def rad_bfs() -> list:
    out = []
    for f in json.loads(get(BFS, timeout=180).decode("utf-8"))["features"]:
        p = f["properties"]
        v = p.get("value")
        when = iso_time(p.get("end_measure") or "")
        if p.get("site_status") != 1 or v is None or when is None:
            continue
        lon, lat = f["geometry"]["coordinates"][:2]
        out.append((lat, lon, float(v), when))
    return out


def rad_stuk() -> list:
    text = get(STUK, timeout=180).decode("utf-8")
    pos = re.search(r"<gmlcov:positions>(.*?)</gmlcov:positions>", text, re.S)
    vals = re.search(r"<gml:doubleOrNilReasonTupleList>(.*?)</gml:doubleOrNilReasonTupleList>", text, re.S)
    fields = re.findall(r'<swe:field name="([^"]+)"', text)
    if not pos or not vals or "DR_PT10M_avg" not in fields:
        return []
    p = pos.group(1).split()
    v = vals.group(1).split()
    k = fields.index("DR_PT10M_avg")
    out = []
    for i in range(len(p) // 3):
        try:
            usv = float(v[i * len(fields) + k])
        except (ValueError, IndexError):
            continue
        if not math.isfinite(usv):
            continue
        when = dt.datetime.fromtimestamp(int(p[i * 3 + 2]), dt.timezone.utc)
        out.append((float(p[i * 3]), float(p[i * 3 + 1]), usv, when))
    return out


def rad_safecast() -> list:
    out = []
    for d in json.loads(get(SAFECAST, timeout=180).decode("utf-8")):
        when = iso_time(d.get("when_captured") or "")
        lat, lon = d.get("loc_lat"), d.get("loc_lon")
        if when is None or lat is None or lon is None:
            continue
        for key, per_usv in SAFECAST_TUBES:
            cpm = d.get(key)
            if isinstance(cpm, (int, float)) and cpm > 0:
                out.append((float(lat), float(lon), cpm / per_usv, when))
                break
    return out


def rad_sensor(rows: list) -> list:
    out = {}
    for r in rows:
        name = ((r.get("sensor") or {}).get("sensor_type") or {}).get("name")
        factor = SENSOR_TUBES.get(name)
        loc = r.get("location") or {}
        if factor is None or str(loc.get("indoor", "0")) == "1":
            continue
        cpm = next((v.get("value") for v in r.get("sensordatavalues") or [] if v.get("value_type") == "counts_per_minute"), None)
        when = iso_time((r.get("timestamp") or "") + "Z")
        try:
            lat, lon, cpm = float(loc["latitude"]), float(loc["longitude"]), float(cpm)
        except (KeyError, TypeError, ValueError):
            continue
        if when is None or cpm <= 0:
            continue
        out[(round(lat, 3), round(lon, 3))] = (lat, lon, cpm / 60 * factor, when)
    return list(out.values())


def build_radiation(now: dt.datetime, rows: list | None) -> dict:
    print("Radiation")
    readers = [("bfs", rad_bfs), ("stuk", rad_stuk), ("safecast", rad_safecast)]
    if rows is not None:
        readers.append(("sensor", lambda: rad_sensor(rows)))
    ids = [x["id"] for x in RAD_SOURCES]
    points, used = [], []
    for sid, read in readers:
        try:
            got = read()
        except Exception as e:  # one network down leaves the others
            print(f"  {sid}: {e}")
            continue
        kept = 0
        for lat, lon, usv, when in got:
            age = int((now - when).total_seconds() // 60)
            # Over 48 hours old, a clock in the future, or a value no working probe gives.
            if age > MAX_AGE_MIN or age < -60 or not (0.01 <= usv <= 100):
                continue
            points.append([round(lat, 3), round(lon, 3), round(usv, 3), max(0, age), ids.index(sid)])
            kept += 1
        print(f"  {sid}: {kept} of {len(got)}")
        if kept:
            used.append(sid)
    if not points:
        raise RuntimeError("no radiation readings")
    (OUT / "radiation.json").write_text(
        json.dumps({"built": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": RAD_SOURCES, "p": points}, separators=(",", ":")),
        encoding="utf-8",
    )
    return {"file": "radiation.json", "count": len(points), "sources": used}


# ---------- air quality forecast (CAMS through Open-Meteo) ----------

OPEN_METEO_AQ = "https://air-quality-api.open-meteo.com/v1/air-quality"
AQ_NORTH, AQ_WEST, AQ_STEP, AQ_NI, AQ_NJ = 55.0, 20.0, 0.5, 45, 25
AQ_VARS = [("aqi", "us_aqi"), ("pm25", "pm2_5"), ("dust", "dust")]
AQ_MAX_AGE_H = 11
LIVE_SITE = "https://luufus.github.io/Earth-System-Detective-/data/live/"


def aq_byte(name: str, v) -> int:
    if v is None or not math.isfinite(v) or v < 0:
        return 255
    if name == "aqi":
        b = v / 2
    elif name == "pm25":
        b = math.sqrt(v) * 11
    else:
        b = math.sqrt(v) * 5.6
    return int(min(254, round(b)))


def reuse_airq(now: dt.datetime, manifest: dict) -> dict | None:
    """The published forecast, if it is still fresh: from this folder, or else from the live site."""
    def fresh(m: dict | None) -> bool:
        if not m:
            return False
        built = dt.datetime.fromisoformat(m["built"].replace("Z", "+00:00"))
        return (now - built).total_seconds() < AQ_MAX_AGE_H * 3600

    local = manifest.get("airq")
    if fresh(local) and (OUT / local["file"]).exists():
        return local
    try:
        remote = json.loads(get(LIVE_SITE + "manifest.json", tries=2, timeout=30)).get("airq")
        if fresh(remote):
            (OUT / remote["file"]).write_bytes(get(LIVE_SITE + remote["file"], tries=2, timeout=60))
            print("  air forecast: the published one is fresh, reused")
            return remote
    except Exception as e:
        print(f"  air forecast: could not reuse the published one ({e})")
    return None


def build_airq(now: dt.datetime, manifest: dict) -> dict:
    print("Air quality forecast (CAMS Europe via Open-Meteo)")
    kept = reuse_airq(now, manifest)
    if kept:
        return kept
    points = [(AQ_NORTH - j * AQ_STEP, AQ_WEST + i * AQ_STEP) for j in range(AQ_NJ) for i in range(AQ_NI)]
    hourly = [None] * len(points)
    times: list[str] | None = None
    batch = 75
    for start in range(0, len(points), batch):
        chunk = points[start : start + batch]
        query = urllib.parse.urlencode({
            "latitude": ",".join(f"{lat:.2f}" for lat, _ in chunk),
            "longitude": ",".join(f"{lon:.2f}" for _, lon in chunk),
            "hourly": ",".join(v for _, v in AQ_VARS),
            "domains": "cams_europe",
            "forecast_days": 4,
            "timezone": "GMT",
        })
        data = json.loads(get(f"{OPEN_METEO_AQ}?{query}", tries=5, timeout=120))
        if isinstance(data, dict):
            data = [data]
        for k, d in enumerate(data):
            hourly[start + k] = d["hourly"]
            times = times or d["hourly"]["time"]
        # Each location may count as a call: stay well under 600 calls a minute.
        time.sleep(9)
    assert times is not None
    # Every third hour from the last full 3-hour step before now.
    first = now.replace(minute=0, second=0, microsecond=0) - dt.timedelta(hours=now.hour % 3)
    keep = [k for k, t in enumerate(times) if k % 3 == 0 and dt.datetime.fromisoformat(t).replace(tzinfo=dt.timezone.utc) >= first]
    size = AQ_NI * AQ_NJ
    out = np.full((len(keep), len(AQ_VARS), size), 255, dtype=np.uint8)
    for f, k in enumerate(keep):
        for vi, (name, key) in enumerate(AQ_VARS):
            for p, h in enumerate(hourly):
                out[f, vi, p] = aq_byte(name, h[key][k])
    (OUT / "airq.bin").write_bytes(zlib.compress(out.tobytes(), 9))
    filled = float((out[:, 0] != 255).mean())
    print(f"  {len(keep)} frames, {size} cells, {filled:.0%} with values")
    return {
        "source": "CAMS European air quality forecasts (Copernicus Atmosphere Monitoring Service), via Open-Meteo",
        "url": "https://open-meteo.com/en/docs/air-quality-api",
        "licence": "CC BY 4.0",
        "built": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "file": "airq.bin",
        "compression": "deflate",
        "grid": {"north": AQ_NORTH, "west": AQ_WEST, "step": AQ_STEP, "ni": AQ_NI, "nj": AQ_NJ},
        "vars": [name for name, _ in AQ_VARS],
        "times": [times[k] + ":00Z" if len(times[k]) == 16 else times[k] for k in keep],
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-gfs", action="store_true", help="skip the weather forecast")
    ap.add_argument("--no-fires", action="store_true", help="skip the fires")
    ap.add_argument("--no-air", action="store_true", help="skip the air sensors")
    ap.add_argument("--no-airq", action="store_true", help="skip the air quality forecast")
    ap.add_argument("--no-rad", action="store_true", help="skip the radiation stations")
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    now = dt.datetime.now(dt.timezone.utc)
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    failures = []
    if not args.no_gfs:
        try:
            manifest["weather"] = build_weather(now)
        except Exception as e:  # keep the last good forecast
            failures.append(f"weather: {e}")
    if not args.no_fires:
        try:
            manifest["fires"] = build_fires(now)
        except Exception as e:
            failures.append(f"fires: {e}")
    rows = None
    if not args.no_air or not args.no_rad:
        try:
            rows = sensor_community()
        except Exception as e:
            failures.append(f"Sensor.Community: {e}")
    if not args.no_air and rows is not None:
        try:
            manifest["air"] = build_air(now, rows)
        except Exception as e:
            failures.append(f"air: {e}")
    if not args.no_rad:
        try:
            manifest["radiation"] = build_radiation(now, rows)
        except Exception as e:
            failures.append(f"radiation: {e}")
    if not args.no_airq:
        try:
            manifest["airq"] = build_airq(now, manifest)
        except Exception as e:
            failures.append(f"air forecast: {e}")
    manifest["built"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    for f in failures:
        print("FAILED", f)
    if failures and not manifest.get("weather") and not manifest.get("fires"):
        sys.exit(1)


if __name__ == "__main__":
    main()
