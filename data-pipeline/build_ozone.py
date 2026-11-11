"""Build the Antarctic ozone hole series from NASA Ozone Watch.

Downloads the annual statistics published by NASA Goddard (TOMS, OMI and OMPS data,
gaps filled from MERRA, MERRA-2 and GEOS FP) and writes

  frontend/public/data/ozone/antarctic.json

with, for every year, the mean ozone hole area (7 September to 13 October, million km2)
and the minimum total ozone (21 September to 16 October, Dobson units).

Usage (from the repository root):
    python data-pipeline/build_ozone.py
"""

from __future__ import annotations

import datetime as dt
import json
import urllib.request
from pathlib import Path

SOURCE_URL = "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.txt"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "public" / "data" / "ozone" / "antarctic.json"


def parse_number(token: str) -> float | None:
    try:
        return float(token)
    except ValueError:
        return None


def main() -> None:
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as response:
        text = response.read().decode("utf-8", "ignore")

    years: list[int] = []
    area: list[float | None] = []
    minimum: list[float | None] = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 2 or not parts[0].isdigit() or len(parts[0]) != 4:
            continue
        years.append(int(parts[0]))
        area.append(parse_number(parts[1]))
        minimum.append(parse_number(parts[2]) if len(parts) > 2 else None)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "source": "NASA Ozone Watch, Goddard Space Flight Center (TOMS, OMI, OMPS; gaps from MERRA, MERRA-2, GEOS FP)",
                "url": "https://ozonewatch.gsfc.nasa.gov/",
                "built": dt.date.today().isoformat(),
                "areaPeriod": "7 September - 13 October mean",
                "minimumPeriod": "21 September - 16 October",
                "years": years,
                "area": area,
                "minimum": minimum,
            },
            indent=1,
        ),
        encoding="utf-8",
    )
    print(f"wrote {OUT} with {len(years)} years ({years[0]}-{years[-1]})")


if __name__ == "__main__":
    main()
