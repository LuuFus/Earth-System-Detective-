"""Fire stories: how big fires spread and died out, day by day, from NASA FIRMS archives.

Source: NASA FIRMS yearly country archives, VIIRS 375 m on Suomi NPP (public, no key):
  https://firms.modaps.eosdis.nasa.gov/data/country/viirs-snpp/<year>/viirs-snpp_<year>_<Country>.csv

Kept: type 0 (vegetation fires, including fires started by shelling), nominal or high confidence,
inside the story's box and dates. One point per 375 m pixel per day.

Output (read by the site):
  frontend/public/data/fires/stories.json     list of stories with their box, dates and counts
  frontend/public/data/fires/stories/<id>.bin  uint16 arrays one after another: latitude and
      longitude scaled over the story box (0..65535), hours since the story start, fire power MW

Usage (from the repository root):
    python data-pipeline/build_fire_stories.py
    python data-pipeline/build_fire_stories.py --only chornobyl-2020
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import sys
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache" / "fires"
OUT = ROOT / "frontend" / "public" / "data" / "fires"
URL = "https://firms.modaps.eosdis.nasa.gov/data/country/viirs-snpp/{y}/viirs-snpp_{y}_{c}.csv"
AGENT = "EarthSystemDetective/1.0 (open-source educational site)"

STORIES = [
    {
        "id": "chornobyl-2020",
        "country": "Ukraine",
        "box": {"w": 28.9, "s": 50.75, "e": 30.75, "n": 51.65},
        "start": "2020-04-03",
        "end": "2020-04-28",
        "camera": {"lat": 51.2, "lon": 29.85, "distance": 1.045},
        "title": {"uk": "Чорнобильська зона, квітень 2020", "en": "Chornobyl Exclusion Zone, April 2020"},
        "text": {
            "uk": "4 квітня 2020 року в зоні відчуження загорілася суха трава. Вітер розніс вогонь лісами Полісся, і він горів понад два тижні, підійшовши на кілька кілометрів до ЧАЕС. Дим накрив Київ, і місто кілька днів мало одне з найбрудніших повітря у світі.",
            "en": "On 4 April 2020 dry grass caught fire in the Exclusion Zone. Wind carried the fire through the Polissia forests; it burned for more than two weeks and came within a few kilometres of the Chornobyl plant. The smoke reached Kyiv, which for several days had some of the dirtiest air in the world.",
        },
    },
    {
        "id": "luhansk-2020",
        "country": "Ukraine",
        "box": {"w": 37.9, "s": 48.35, "e": 40.3, "n": 49.85},
        "start": "2020-09-26",
        "end": "2020-10-14",
        "camera": {"lat": 49.0, "lon": 39.1, "distance": 1.07},
        "title": {"uk": "Луганщина, вересень-жовтень 2020", "en": "Luhansk region, September-October 2020"},
        "text": {
            "uk": "Наприкінці вересня 2020 року за сильного вітру й посухи на Луганщині спалахнули ліси й поля вздовж Сіверського Дінця. Вогонь знищив сотні будинків; гасити його заважали міни біля лінії розмежування.",
            "en": "At the end of September 2020, in strong wind and drought, forests and fields along the Siverskyi Donets in the Luhansk region caught fire. Hundreds of houses burned; mines near the contact line made the fire hard to fight.",
        },
    },
    {
        "id": "front-2022",
        "country": "Ukraine",
        "box": {"w": 30.4, "s": 45.9, "e": 40.3, "n": 50.6},
        "start": "2022-02-24",
        "end": "2022-11-30",
        "camera": {"lat": 47.9, "lon": 35.6, "distance": 1.22},
        "title": {"uk": "Вогонь війни: південь і схід, 2022", "en": "Fires of war: south and east, 2022"},
        "text": {
            "uk": "Від початку повномасштабного вторгнення супутники бачать пожежі вздовж фронту: від обстрілів горять поля, ліси й села. Подивіться, як смуга вогню рухається разом із лінією фронту, а восени 2022 року зміщується після звільнення Харківщини й Херсона.",
            "en": "Since the full-scale invasion began, satellites have seen fires along the front: shelling sets fields, forests and villages alight. Watch the band of fire move with the front line, and shift in autumn 2022 after the liberation of the Kharkiv region and Kherson.",
        },
    },
    {
        "id": "evia-2021",
        "country": "Greece",
        "box": {"w": 22.7, "s": 37.75, "e": 24.35, "n": 39.15},
        "start": "2021-07-29",
        "end": "2021-08-20",
        "camera": {"lat": 38.55, "lon": 23.5, "distance": 1.06},
        "title": {"uk": "Евбея й Аттика, Греція, серпень 2021", "en": "Evia and Attica, Greece, August 2021"},
        "text": {
            "uk": "Під час найсильнішої за десятиліття спеки в Греції пожежі знищили ліси на півночі острова Евбея й підступили до передмість Афін. Людей евакуйовували з пляжів поромами.",
            "en": "During Greece's worst heatwave in decades, fires destroyed the forests of northern Evia and reached the suburbs of Athens. People were evacuated from beaches by ferry.",
        },
    },
    {
        "id": "turkey-2021",
        "country": "Turkey",
        "box": {"w": 27.3, "s": 36.2, "e": 32.7, "n": 37.6},
        "start": "2021-07-27",
        "end": "2021-08-14",
        "camera": {"lat": 36.9, "lon": 30.0, "distance": 1.1},
        "title": {"uk": "Середземноморське узбережжя Туреччини, 2021", "en": "Turkey's Mediterranean coast, 2021"},
        "text": {
            "uk": "Наприкінці липня 2021 року майже одночасно спалахнули пожежі від Манавгата до Мармариса. Вогонь дійшов до курортів і електростанції в Миласі.",
            "en": "At the end of July 2021 fires broke out almost at once from Manavgat to Marmaris. The fire reached resorts and the power plant at Milas.",
        },
    },
    {
        "id": "fields-2018",
        "country": "Ukraine",
        "box": {"w": 22.1, "s": 44.3, "e": 40.3, "n": 52.4},
        "start": "2018-03-25",
        "end": "2018-04-30",
        "camera": {"lat": 48.6, "lon": 31.3, "distance": 1.55},
        "title": {"uk": "Паління полів, Україна, квітень 2018", "en": "Field burning, Ukraine, April 2018"},
        "text": {
            "uk": "Щовесни перед сівбою в Україні палять стерню й суху траву. 9 квітня 2018 року VIIRS нарахував у країні 552 осередки вогню. Подивіться, як вогнищ на полях стає дедалі більше, коли сходить сніг і висихає земля.",
            "en": "Every spring before sowing, stubble and dry grass are burned in Ukraine. On 9 April 2018 VIIRS counted 552 hotspots in the country. Watch the field fires multiply as the snow melts and the ground dries.",
        },
    },
    {
        "id": "la-2025",
        "country": "United_States",
        "box": {"w": -118.85, "s": 33.95, "e": -117.9, "n": 34.42},
        "start": "2025-01-07",
        "end": "2025-01-31",
        "camera": {"lat": 34.15, "lon": -118.35, "distance": 1.03},
        "title": {"uk": "Лос-Анджелес, січень 2025", "en": "Los Angeles, January 2025"},
        "text": {
            "uk": "7 січня 2025 року ураганний вітер Санта-Ана розніс дві пожежі — Палісейдс на заході міста й Ітон в Альтадіні — просто в житлові квартали. Згоріли понад 16 тисяч будинків, загинула 31 людина; локалізували вогонь лише 31 січня.",
            "en": "On 7 January 2025 hurricane-force Santa Ana winds drove two fires — Palisades in the west of the city and Eaton in Altadena — straight into neighbourhoods. Over 16,000 buildings burned and 31 people died; the fires were contained only on 31 January.",
        },
    },
    {
        "id": "quebec-2023",
        "country": "Canada",
        "box": {"w": -80.0, "s": 47.5, "e": -71.5, "n": 53.6},
        "start": "2023-05-30",
        "end": "2023-07-12",
        "camera": {"lat": 50.4, "lon": -75.8, "distance": 1.25},
        "title": {"uk": "Квебек, Канада, червень 2023", "en": "Quebec, Canada, June 2023"},
        "text": {
            "uk": "У червні 2023 року блискавки за кілька днів запалили сотні пожеж у лісах Квебеку. Це був найбільший за площею сезон пожеж в історії Канади; дим дійшов до Нью-Йорка та Європи.",
            "en": "In June 2023 lightning lit hundreds of fires in Quebec's forests within a few days. It was the largest fire season by area in Canada's history; the smoke reached New York and Europe.",
        },
    },
]


def archive(country: str, year: int) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"viirs-snpp_{year}_{country}.csv"
    if not path.exists():
        url = URL.format(y=year, c=country)
        print(f"  downloading {url}")
        req = urllib.request.Request(url, headers={"User-Agent": AGENT})
        tmp = path.with_suffix(".part")
        with urllib.request.urlopen(req, timeout=600) as r, open(tmp, "wb") as f:
            while chunk := r.read(1 << 20):
                f.write(chunk)
        tmp.replace(path)
    return path


def build(story: dict) -> dict:
    start = dt.datetime.fromisoformat(story["start"]).replace(tzinfo=dt.timezone.utc)
    end = dt.datetime.fromisoformat(story["end"]).replace(tzinfo=dt.timezone.utc) + dt.timedelta(days=1)
    b = story["box"]
    years = range(start.year, end.year + 1)
    cells: dict[tuple, list] = {}
    for y in years:
        with open(archive(story["country"], y), newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                if r.get("type", "0") != "0" or (r.get("confidence") or "").lower() in ("l", "low"):
                    continue
                lat = float(r["latitude"])
                lon = float(r["longitude"])
                if not (b["s"] <= lat <= b["n"] and b["w"] <= lon <= b["e"]):
                    continue
                when = dt.datetime.strptime(f"{r['acq_date']} {int(r['acq_time']):04d}", "%Y-%m-%d %H%M").replace(tzinfo=dt.timezone.utc)
                if not (start <= when < end):
                    continue
                hours = (when - start).total_seconds() / 3600
                key = (int(hours // 24), round(lat / 0.0035), round(lon / 0.0035))
                frp = float(r.get("frp") or 0)
                old = cells.get(key)
                if old is None:
                    cells[key] = [lat, lon, hours, frp]
                else:
                    old[2] = min(old[2], hours)
                    old[3] = max(old[3], frp)
    pts = np.array(sorted(cells.values(), key=lambda p: p[2]), dtype=np.float64) if cells else np.zeros((0, 4))
    n = len(pts)
    qlat = np.round((pts[:, 0] - b["s"]) / (b["n"] - b["s"]) * 65535)
    qlon = np.round((pts[:, 1] - b["w"]) / (b["e"] - b["w"]) * 65535)
    blob = b"".join(
        a.astype(np.uint16).tobytes()
        for a in (np.clip(qlat, 0, 65535), np.clip(qlon, 0, 65535), np.clip(np.round(pts[:, 2]), 0, 65535), np.clip(np.round(pts[:, 3]), 0, 65535))
    )
    folder = OUT / "stories"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{story['id']}.bin").write_bytes(blob)
    days = (end - start).days
    per_day = np.bincount((pts[:, 2] // 24).astype(int), minlength=days)[:days].tolist() if n else [0] * days
    print(f"  {story['id']}: {n} fire pixels over {days} days, {len(blob) // 1024} KB")
    meta = {k: story[k] for k in ("id", "box", "start", "camera", "title", "text")}
    meta.update({"days": days, "count": n, "perDay": per_day, "file": f"stories/{story['id']}.bin"})
    return meta


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="build one story by id")
    args = ap.parse_args()
    path = OUT / "stories.json"
    known = {s["id"]: s for s in json.loads(path.read_text(encoding="utf-8"))["stories"]} if path.exists() else {}
    for story in STORIES:
        if args.only and story["id"] != args.only:
            continue
        known[story["id"]] = build(story)
    out = {
        "source": "NASA FIRMS, VIIRS 375 m (Suomi NPP), yearly country archives; type 0, nominal and high confidence",
        "url": "https://firms.modaps.eosdis.nasa.gov/country/",
        "built": dt.date.today().isoformat(),
        "stories": [known[s["id"]] for s in STORIES if s["id"] in known],
    }
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
