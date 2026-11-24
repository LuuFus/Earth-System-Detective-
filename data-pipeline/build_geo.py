"""Build the map reference layers for the globe from Natural Earth (public domain).

Downloads (into data-pipeline/cache/naturalearth/) the Natural Earth vector layers
published at github.com/nvkelso/natural-earth-vector and writes

  frontend/public/data/geo/countries.json  country outlines for comparing two countries
  frontend/public/data/geo/labels.json     capitals, oceans and seas, rivers (lines and names)
  frontend/public/data/geo/borders.json    land borders and coastlines drawn on the globe
  frontend/public/data/geo/cities.json     cities of 100 000 people and more, every Ukrainian city
                                           Natural Earth has, and every capital: names, population,
                                           built-up area, for the Cities layer, search and comparisons

Every name is given in Ukrainian and English. Natural Earth has Ukrainian names for
countries, capitals and seas; river names are translated below (only the rivers listed
there get a label, every river line is drawn).

Natural Earth draws Crimea as part of Russia in its default view. Ukraine's borders are
internationally recognised (UN General Assembly resolution 68/262), so the Crimea polygon
is moved to Ukraine here, as the US Department of State boundaries draw it. The border
lines follow Natural Earth's Ukrainian point of view (FCLASS_UA): the line across the
Perekop isthmus is an internal boundary there and is not drawn, the Kerch Strait is.

Usage (from the repository root):
    python data-pipeline/build_geo.py
"""

from __future__ import annotations

import datetime as dt
import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data-pipeline" / "cache" / "naturalearth"
OUT = ROOT / "frontend" / "public" / "data" / "geo"
BASE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
LAYERS = {
    "countries": "ne_50m_admin_0_countries",
    "places": "ne_50m_populated_places",
    "marine": "ne_10m_geography_marine_polys",
    "rivers": "ne_10m_rivers_lake_centerlines",
    "borders": "ne_50m_admin_0_boundary_lines_land",
    "coast": "ne_50m_coastline",
    "cities": "ne_10m_populated_places",
}

# Cities renamed since Natural Earth took their names, and spellings Ukraine uses in English.
CITY_NAMES = {
    "Kirovohrad": ("Кропивницький", "Kropyvnytskyi"),
    "Illichivsk": ("Чорноморськ", "Chornomorsk"),
    "Odessa": ("Одеса", "Odesa"),
    "Zaporizhzhya": ("Запоріжжя", "Zaporizhzhia"),
    "Mykolayiv": ("Миколаїв", "Mykolaiv"),
    "Khmelnytskyy": ("Хмельницький", "Khmelnytskyi"),
    "Vinnytsya": ("Вінниця", "Vinnytsia"),
    "Uzhgorod": ("Ужгород", "Uzhhorod"),
    "Kamyanets-Podilskyy": ("Кам'янець-Подільський", "Kamianets-Podilskyi"),
    "Izmayil": ("Ізмаїл", "Izmail"),
    "Kupyansk": ("Куп'янськ", "Kupiansk"),
    "Makiyivka": ("Макіївка", "Makiivka"),
    "Chernobyl": ("Чорнобиль", "Chornobyl"),
    "Simferopol": ("Сімферополь", "Simferopol"),
    "Sevastapol": ("Севастополь", "Sevastopol"),
    "Sevastopol": ("Севастополь", "Sevastopol"),
    "Kerch": ("Керч", "Kerch"),
}
CRIMEA = (44.3, 46.3, 32.4, 36.7)  # s, n, w, e

# Rivers: Natural Earth English name -> Ukrainian name. Several spellings of one river map
# to the same Ukrainian name and get one label.
RIVERS_UK = {
    "Amazonas": "Амазонка", "Lena": "Лена", "Mississippi": "Міссісіпі", "Missouri": "Міссурі",
    "Nile": "Ніл", "White Nile": "Білий Ніл", "Blue Nile": "Блакитний Ніл", "Yangtze": "Янцзи",
    "Ucayali": "Укаялі", "Kagera": "Кагера", "Angara": "Ангара", "Brahmaputra": "Брахмапутра",
    "Congo": "Конго", "Danube": "Дунай", "Irtysh": "Іртиш", "Ertis": "Іртиш", "Lualaba": "Луалаба",
    "Mackenzie": "Маккензі", "Mekong": "Меконг", "Ob": "Об", "Paraná": "Парана", "Peace": "Піс-Рівер",
    "Selenga": "Селенга", "Slave": "Слейв", "St. Lawrence": "Святого Лаврентія", "Amur": "Амур",
    "Columbia": "Колумбія", "Darling": "Дарлінг", "Euphrates": "Євфрат", "Al Furat": "Євфрат",
    "Firat": "Євфрат", "Ganges": "Ганг", "Huang": "Хуанхе", "Yellow": "Хуанхе", "Indus": "Інд",
    "Kasai": "Касаї", "Madeira": "Мадейра", "Murray": "Муррей", "Negro": "Ріу-Негру", "Niger": "Нігер",
    "Ohio": "Огайо", "Orinoco": "Оріноко", "Ubangi": "Убангі", "Volga": "Волга", "Yukon": "Юкон",
    "Zambezi": "Замбезі", "Shatt al Arab": "Шатт-ель-Араб", "Niagara": "Ніагара", "Mamoré": "Маморе",
    "Guaporé": "Гуапоре", "Shire": "Шире", "Aldan": "Алдан", "Araguaia": "Арагуая",
    "Arkansas": "Арканзас", "Benue": "Бенуе", "Bénoué": "Бенуе", "Dnieper": "Дніпро", "Dnepre": "Дніпро",
    "Irrawaddy": "Іраваді", "Kolyma": "Колима", "Magdalena": "Магдалена", "Nelson": "Нельсон",
    "Oder": "Одра", "Orange": "Оранжева", "Pechora": "Печора", "Rhine": "Рейн", "Rhein": "Рейн",
    "Rio Grande": "Ріо-Гранде", "Salween": "Салуїн", "Saskatchewan": "Саскачеван", "Seine": "Сена",
    "Severnaya Dvina": "Північна Двіна", "Tigris": "Тигр", "Dicle": "Тигр", "Tocantins": "Токантінс",
    "Ural": "Урал", "Vaal": "Вааль", "Yenisey": "Єнісей", "São  Francisco": "Сан-Франсиску",
    "São Francisco": "Сан-Франсиску", "Sénégal": "Сенегал", "Xi": "Січзян", "Paranaíba": "Паранаїба",
    "Neuquén": "Неукен", "Amu  Darya": "Амудар'я", "Amu Darya": "Амудар'я", "Athabasca": "Атабаска",
    "Colorado": "Колорадо", "Ebro": "Ебро", "Elbe": "Ельба", "Fraser": "Фрейзер",
    "Indigirka": "Індигірка", "Loire": "Луара", "Neva": "Нева", "Nizhnyaya Tunguska": "Нижня Тунгуска",
    "Syr  Darya": "Сирдар'я", "Syr Darya": "Сирдар'я", "Tagus": "Тахо", "Tajo": "Тахо",
    "Tapajós": "Тапажос", "Tennessee": "Теннессі", "Tobol": "Тобол", "Vistula": "Вісла",
    "Volta": "Вольта", "Xingu": "Шінгу", "Zapadnaya Dvina": "Західна Двіна", "Marañón": "Мараньйон",
    "Godävari": "Годаварі", "Panj": "Пяндж", "Naryn": "Нарин", "Vychegda": "Вичегда",
    "Sacramento": "Сакраменто", "Japurá": "Япура", "Caquetá": "Какета", "Black Volta": "Чорна Вольта",
    "Dniester": "Дністер", "Don": "Дон", "Kama": "Кама", "Po": "По", "Rhône": "Рона", "Thames": "Темза",
    "Tisa": "Тиса", "Garonne": "Гаронна", "Duero": "Дуеро", "Drau": "Драва", "Hudson": "Гудзон",
    "Potomac": "Потомак", "Limpopo": "Лімпопо", "Okavango": "Окаванго", "Uruguay": "Уругвай",
    "Pilcomayo": "Пількомайо", "Jordan": "Йордан", "Tarim": "Тарим", "Sungari": "Сунгарі",
    "Liao": "Ляохе", "Krishna": "Крішна", "Narmada": "Нармада", "Yamuna": "Ямуна", "Sutlej": "Сатледж",
    "Chenab": "Чинаб", "Helmand": "Гільменд", "Vilyuy": "Вілюй", "Khatanga": "Хатанга", "Taz": "Таз",
    "Anadyr’": "Анадир", "Kamchatka": "Камчатка", "Olenëk": "Оленьок", "Churchill": "Черчилл",
    "Ottawa": "Оттава", "Brazos": "Брасос", "Kuskokwim": "Кускоквім", "Gila": "Гіла", "Meta": "Мета",
    "Purús": "Пурус", "Chari": "Шарі", "Jubba": "Джубба", "Omo": "Омо", "Atbara": "Атбара",
    "Kafue": "Кафуе", "Ruvuma": "Рувума", "Kemijoki": "Кемійокі", "Vuoksi": "Вуокса",
    "Suez Canal": "Суецький канал", "Panama Canal": "Панамський канал", "Waikato": "Вайкато",
    # Ukraine and its neighbours: drawn and named even when Natural Earth ranks them small.
    "Pripyat": "Прип'ять", "Donets": "Сіверський Донець", "Southern Bug": "Південний Буг",
    "Prut": "Прут", "Seym": "Сейм", "Bug": "Західний Буг", "Desna": "Десна", "Psel": "Псел",
    "Vorskla": "Ворскла", "Inhulets": "Інгулець", "Ingulets": "Інгулець", "Sula": "Сула",
    "Horyn": "Горинь", "Sluch": "Случ", "Teteriv": "Тетерів", "Ros": "Рось", "Siret": "Серет",
}
# Rivers drawn whatever their rank (the Ukrainian ones above are small on a world map).
LOCAL_RIVERS = {
    "Pripyat", "Donets", "Southern Bug", "Prut", "Seym", "Bug", "Desna", "Psel", "Vorskla",
    "Inhulets", "Ingulets", "Sula", "Horyn", "Sluch", "Teteriv", "Ros", "Siret",
}
# Ocean labels sit where they read best on a globe rather than at the polygon centre.
OCEAN_LABELS = {
    "North Atlantic Ocean": (32.0, -42.0),
    "South Atlantic Ocean": (-22.0, -14.0),
    "North Pacific Ocean": (28.0, -150.0),
    "South Pacific Ocean": (-28.0, -125.0),
    "INDIAN OCEAN": (-22.0, 78.0),
    "Arctic Ocean": (82.0, 20.0),
    "SOUTHERN OCEAN": (-62.0, 40.0),
}
# Seas whose Natural Earth Ukrainian name lacks the word for the kind of water body.
SEAS_UK = {
    "Gulf of Alaska": "Затока Аляска", "Banda Sea": "Море Банда", "James Bay": "Затока Джеймс",
    "Gulf of Carpentaria": "Затока Карпентарія", "Gulf of Maine": "Затока Мен", "Bismarck Sea": "Море Бісмарка",
    "San Jorge Gulf": "Затока Сан-Хорхе", "Gulf of Kutch": "Затока Кач", "Ungava Bay": "Затока Унгава",
    "Bohai Sea": "Бохайське море", "Bay of Campeche": "Затока Кампече", "Melville Bay": "Затока Мелвілл",
    "Gulf of Sidra": "Затока Сидра", "Bay of Plenty": "Затока Пленті",
}
# Smaller seas (rank 5) that are still worth naming.
SEAS_RANK5 = {
    "Sea of Azov", "Gulf of Riga", "Bosporus", "Kattegat", "Sea of Crete", "Ligurian Sea", "East Siberian Sea",
    "Bass Strait", "Torres Strait", "La Pérouse Strait", "Lincoln Sea", "Gulf of Sidra",
}
CRIMEA_BOX = (32.0, 44.0, 37.0, 46.5)  # w, s, e, n: a Russian polygon wholly inside is Crimea


def fetch(name: str) -> dict:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{name}.geojson"
    if not path.exists():
        with urllib.request.urlopen(BASE_URL + f"{name}.geojson", timeout=120) as r:
            path.write_bytes(r.read())
    return json.loads(path.read_text(encoding="utf-8"))


def perpendicular(p, a, b) -> float:
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


def simplify(points: list, tolerance: float) -> list:
    """Ramer-Douglas-Peucker, iterative."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        best, index = 0.0, -1
        for k in range(i + 1, j):
            d = perpendicular(points[k], points[i], points[j])
            if d > best:
                best, index = d, k
        if index >= 0 and best > tolerance:
            keep[index] = True
            stack.append((i, index))
            stack.append((index, j))
    return [p for p, k in zip(points, keep) if k]


def flat(points: list) -> list:
    """[[lon, lat], ...] -> [lon, lat, lon, lat, ...] rounded to 0.01 degree."""
    out: list = []
    for lon, lat, *_ in points:
        out += [round(lon, 2), round(lat, 2)]
    return out


def ring_area_km2(ring: list) -> float:
    lat0 = sum(p[1] for p in ring) / len(ring)
    k = math.cos(math.radians(lat0)) * 111.32
    s = 0.0
    for (x1, y1, *_), (x2, y2, *_) in zip(ring, ring[1:] + ring[:1]):
        s += (x1 * k) * (y2 * 110.57) - (x2 * k) * (y1 * 110.57)
    return abs(s) / 2


def polygons(geometry: dict) -> list:
    return [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]


def inside(lon: float, lat: float, rings: list) -> bool:
    c = False
    for r in rings:
        j = len(r) - 1
        for i in range(len(r)):
            xi, yi = r[i][0], r[i][1]
            xj, yj = r[j][0], r[j][1]
            if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
                c = not c
            j = i
    return c


def edge_distance(lon: float, lat: float, rings: list) -> float:
    k = math.cos(math.radians(lat))
    best = float("inf")
    for r in rings:
        for a, b in zip(r, r[1:] + r[:1]):
            best = min(best, perpendicular((lon * k, lat), (a[0] * k, a[1]), (b[0] * k, b[1])))
    return best


def label_point(geometry: dict) -> tuple[float, float]:
    """Roughly the point of a sea furthest from its shores (searched on a grid)."""
    largest = max(polygons(geometry), key=lambda p: ring_area_km2(p[0]))
    rings = [simplify([tuple(p[:2]) for p in r], 0.05) for r in largest]
    rings = [r for r in rings if len(r) >= 3]
    lons = [p[0] for p in rings[0]]
    lats = [p[1] for p in rings[0]]
    best, where = -1.0, (sum(lats) / len(lats), sum(lons) / len(lons))
    steps = 24
    for i in range(steps + 1):
        lat = min(lats) + (max(lats) - min(lats)) * i / steps
        for j in range(steps + 1):
            lon = min(lons) + (max(lons) - min(lons)) * j / steps
            if inside(lon, lat, rings):
                d = edge_distance(lon, lat, rings)
                if d > best:
                    best, where = d, (lat, lon)
    return where


def build_countries() -> list:
    features = fetch(LAYERS["countries"])["features"]
    by_code: dict[str, dict] = {}
    crimea: list = []
    for f in features:
        p = f["properties"]
        code = p["ISO_A2"] if p["ISO_A2"] != "-99" else p["ISO_A2_EH"]
        if code == "-99":
            continue
        # Natural Earth writes Taiwan as CN-TW; ISO 3166-1 (and every browser) knows it as TW.
        code = code.split("-")[-1]
        polys = polygons(f["geometry"])
        if code == "RU":
            w, s, e, n = CRIMEA_BOX
            keep = []
            for poly in polys:
                lons = [q[0] for q in poly[0]]
                lats = [q[1] for q in poly[0]]
                if min(lons) > w and max(lons) < e and min(lats) > s and max(lats) < n:
                    crimea.append(poly)
                else:
                    keep.append(poly)
            polys = keep
        entry = by_code.setdefault(
            code,
            {"code": code, "uk": p["NAME_UK"] or p["NAME_EN"], "en": p["NAME_EN"], "label": [round(p["LABEL_Y"], 2), round(p["LABEL_X"], 2)], "polys": []},
        )
        entry["polys"] += polys
    if len(crimea) != 1:
        raise SystemExit(f"expected one Crimea polygon in Russia, found {len(crimea)}")
    by_code["UA"]["polys"] += crimea

    out = []
    for c in by_code.values():
        rings = []
        area = 0.0
        w = s = 999.0
        e = n = -999.0
        for poly in c["polys"]:
            for k, ring in enumerate(poly):
                pts = [tuple(q[:2]) for q in ring[:-1]]
                if k == 0:
                    area += ring_area_km2(pts)
                small = simplify(pts, 0.03)
                if len(small) < 4:
                    small = pts
                if len(small) < 3:
                    continue
                rings.append(flat(small))
                for lon, lat in small:
                    w, e, s, n = min(w, lon), max(e, lon), min(s, lat), max(n, lat)
        out.append({
            "code": c["code"], "uk": c["uk"], "en": c["en"], "label": c["label"],
            "box": [round(s, 2), round(w, 2), round(n, 2), round(e, 2)], "area": round(area), "rings": rings,
        })
    out.sort(key=lambda c: c["code"])
    return out


def build_capitals() -> list:
    out = []
    for f in fetch(LAYERS["places"])["features"]:
        p = f["properties"]
        if p["ADM0CAP"] != 1:
            continue
        out.append({
            "uk": p["NAME_UK"] or p["NAME_EN"] or p["NAME"], "en": p["NAME_EN"] or p["NAME"],
            "lat": round(p["LATITUDE"], 3), "lon": round(p["LONGITUDE"], 3),
            "code": p["ISO_A2"], "rank": p["SCALERANK"],
        })
    out.sort(key=lambda c: (c["rank"], c["en"]))
    return out


def build_cities() -> list:
    """[uk, en, lat, lon, ISO code, population, built-up area km², rank, capital]."""
    out = []
    for f in fetch(LAYERS["cities"])["features"]:
        p = f["properties"]
        pop = int(p.get("POP_MAX") or 0)
        code = p.get("ISO_A2") or ""
        lat, lon = p["LATITUDE"], p["LONGITUDE"]
        s, n, w, e = CRIMEA
        if code in ("RU", "-99") and s <= lat <= n and w <= lon <= e:
            code = "UA"
        cap = 1 if p.get("ADM0CAP") == 1 else 0
        if not (pop >= 100_000 or code == "UA" or cap):
            continue
        if code == "-99" or not code:
            code = ""
        uk, en = CITY_NAMES.get(p["NAME"], (p.get("NAME_UK") or p.get("NAME_EN") or p["NAME"], p.get("NAME_EN") or p["NAME"]))
        area = p.get("MAX_AREAKM") or p.get("MIN_AREAKM") or 0
        out.append([uk, en, round(lat, 3), round(lon, 3), code, pop, int(area), int(p.get("SCALERANK") or 10), cap])
    out.sort(key=lambda c: -c[5])
    return out


def build_seas() -> list:
    out = []
    for f in fetch(LAYERS["marine"])["features"]:
        p = f["properties"]
        if not p.get("name_uk") or not p.get("name"):
            continue
        kind = p["featurecla"]
        en = p["name_en"] or p["name"].title()
        if kind not in {"ocean", "sea", "gulf", "bay", "strait", "channel", "sound", "lagoon"}:
            continue
        if p["scalerank"] > 4 and en not in SEAS_RANK5:
            continue
        lat, lon = OCEAN_LABELS.get(p["name"]) or label_point(f["geometry"])
        out.append({
            "uk": SEAS_UK.get(en, p["name_uk"]), "en": en, "lat": round(lat, 2), "lon": round(lon, 2),
            "kind": kind, "rank": p["scalerank"],
        })
    out.sort(key=lambda s: s["rank"])
    return out


def build_rivers() -> dict:
    lines = []
    best: dict[str, dict] = {}
    for f in fetch(LAYERS["rivers"])["features"]:
        p = f["properties"]
        name = (p.get("name_en") or p.get("name") or "").strip()
        rank = p["scalerank"]
        known = name in RIVERS_UK
        if not (rank <= 5 or (rank <= 6 and known) or name in LOCAL_RIVERS):
            continue
        g = f["geometry"]
        parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        for part in parts:
            pts = simplify([tuple(q[:2]) for q in part], 0.04)
            if len(pts) < 2:
                continue
            lines.append(flat(pts))
            if not known:
                continue
            length = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
            uk = RIVERS_UK[name]
            if uk not in best or length > best[uk]["length"]:
                mid = pts[len(pts) // 2]
                best[uk] = {"length": length, "uk": uk, "en": name.replace("  ", " "), "lat": round(mid[1], 2), "lon": round(mid[0], 2), "rank": rank}
            else:
                best[uk]["rank"] = min(best[uk]["rank"], rank)
    labels = sorted(({k: v for k, v in b.items() if k != "length"} for b in best.values()), key=lambda r: r["rank"])
    return {"lines": lines, "labels": labels}


def build_borders() -> dict:
    """Land borders as Ukraine sees them (solid: international, faint: disputed), and coastlines."""
    land: list = []
    disputed: list = []
    for f in fetch(LAYERS["borders"])["features"]:
        p = f["properties"]
        kind = p.get("FCLASS_UA") or p.get("FEATURECLA") or ""
        if kind in {"Unrecognized", "Admin-1 boundary"}:
            continue
        g = f["geometry"]
        parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        target = land if kind.startswith("International") else disputed
        for part in parts:
            pts = simplify([tuple(q[:2]) for q in part], 0.01)
            if len(pts) >= 2:
                target.append(flat(pts))
    coast: list = []
    for f in fetch(LAYERS["coast"])["features"]:
        g = f["geometry"]
        parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        for part in parts:
            pts = simplify([tuple(q[:2]) for q in part], 0.02)
            if len(pts) >= 2:
                coast.append(flat(pts))
    return {"land": land, "disputed": disputed, "coast": coast}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    source = "Natural Earth (naturalearthdata.com), public domain; Crimea drawn as part of Ukraine"
    built = dt.date.today().isoformat()
    countries = build_countries()
    (OUT / "countries.json").write_text(
        json.dumps({"source": source, "built": built, "countries": countries}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    labels = {"source": source, "built": built, "capitals": build_capitals(), "seas": build_seas(), "rivers": build_rivers()}
    (OUT / "labels.json").write_text(json.dumps(labels, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    cities = build_cities()
    (OUT / "cities.json").write_text(
        json.dumps({"source": "Natural Earth populated places 10m (naturalearthdata.com), public domain: POP_MAX, MAX_AREAKM",
                    "built": built, "fields": ["uk", "en", "lat", "lon", "code", "pop", "areaKm2", "rank", "capital"], "cities": cities},
                   ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(len(cities), "cities")
    borders = {"source": source, "built": built, **build_borders()}
    (OUT / "borders.json").write_text(json.dumps(borders, separators=(",", ":")), encoding="utf-8")
    print(len(borders["land"]), "border lines,", len(borders["disputed"]), "disputed,", len(borders["coast"]), "coast lines")
    for name in ("countries.json", "labels.json", "borders.json", "cities.json"):
        print(name, (OUT / name).stat().st_size // 1024, "KB")
    print(len(countries), "countries,", len(labels["capitals"]), "capitals,", len(labels["seas"]), "seas,",
          len(labels["rivers"]["lines"]), "river lines,", len(labels["rivers"]["labels"]), "river names")


if __name__ == "__main__":
    main()
