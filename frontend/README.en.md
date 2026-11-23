# Earth System Detective: frontend

[Українська](README.md) | **English**

NASA Space Apps Challenge 2026 project for the **Earth System Trend Detective**
challenge. React + TypeScript + Vite, Three.js for the globe.
The visual system lives in [`../DESIGN.md`](../DESIGN.md).

## Run

```bash
npm install
npm run dev        # opens the browser by itself (port 5173, or 5174 if 5173 is busy)
npm run build      # type-check + production build into dist/
```

The live site is rebuilt from `main` by GitHub Actions and served by GitHub Pages:
https://luufus.github.io/Earth-System-Detective-/ (the build sets `VITE_BASE` to the
repository path; locally the app runs from `/`).

An internet connection is required: video streams from NASA servers
(images.nasa.gov, eol.jsc.nasa.gov) and the Earth imagery from NASA GIBS. The
climate data ships with the site (`public/data/gistemp`, 2.4 MB).

## What the 3D Earth does (`/explore`): the studio

A tool rail on the left: **Layers, Cases, Analysis, Weather, Glossary, Share**. A timeline
with a Play button at the bottom, the analysis drawer on the right.

- **Globe**: rotate, zoom with the wheel or two fingers, down to about 95 km.
  The base map is NASA Blue Marble (500 m) and, up close, the Landsat WELD
  mosaic (30 m, 1998-2000 imagery). NASA GIBS imagery streams in as CDN tiles,
  sharper for the visible area. A new close-up or a new year appears whole,
  once it has loaded (or after 2.5 s), so the globe never shows a mix of scales
  or a bare map. Layers sit on the same sphere as the map, so they do not slide
  up close. A frame is drawn only when something changed.
- **Map**: the "Borders and country names" switch draws crisp vector borders
  (a white line with a dark halo; Ukraine's point of view: no line across the
  Perekop isthmus, a border in the Kerch Strait) and coastlines, and turns on
  capitals (a small dot and a name; when the name has no room the dot stays),
  oceans and seas (italic) and rivers (blue lines and names), each of the last
  three of which can be switched off. Data: Natural Earth (public domain), with
  Crimea as part of Ukraine. Labels appear with camera height, and one that
  would overlap a more important one is hidden or moved aside.
- **Under the pointer**: the coordinates and, from NASA POWER (MERRA-2), the
  temperature, humidity, precipitation and wind at that spot for the month and
  year on the timeline, over the ocean too. One request per 0.5° cell fetches
  every month since 1981, so moving the timeline afterwards needs no request.
- **Leaving a layer**: while a layer is on, a "✕ Plain Earth" button sits at the
  top.
- **Coarse layers without squares**: MERRA-2 (temperature, precipitation, soil
  moisture), AIRS and OMI have 0.25-1° cells. The globe loads the GIBS level
  where a cell is about a pixel and stretches it smoothly; soil moisture is cut
  along the coastline (a Natural Earth land mask). Daily OMI NO₂ and ozone have
  no-data strips between satellite passes and under clouds: they are filled from
  images up to 3 days before and after the date.
- **Layers**: 12 NASA variables, each with a plain definition:
  - *with numbers*: temperature anomaly (GISTEMP, 1880-2025); air temperature,
    precipitation, soil moisture and humidity (NASA POWER, MERRA-2, 1981-2025);
    the Antarctic ozone hole area (NASA Ozone Watch, 1979-2025); and over
    Ukraine, monthly NO₂ (OMI, 2005 to March 2026), vegetation and land surface
    temperature (MODIS, since 2000) and fire counts (NASA FIRMS, VIIRS, since
    2012);
  - *map only for now*: night lights (VIIRS) and true colour. In true colour the
    no-data strips between MODIS Terra orbits are filled from another
    satellite's image of the same day (VIIRS from 2016, MODIS Aqua from 2002).
  - Imagery layers show the official NASA GIBS legend.
- **War in Ukraine**: occupied, partly occupied and active-hostility hromadas from
  the official list of the Ministry for Development of Ukraine (Order No. 376).
- **Analysis**: click a place on the globe (region A), optionally add region B.
  A region can be **a whole country**: type its name under A or B (everyday
  names work too: "USA", "America", "UK", "UAE"...), or switch
  "A click on the globe picks: A country" and click it. The country is outlined
  on the globe in the region's colour, and the numbers come only from inside its
  borders: GISTEMP cells, the NASA POWER grid (up to 4 requests of 10°), or for
  large countries 16 points spread evenly over the territory. So you can compare,
  say, Ukraine and Poland by temperature, rainfall or soil moisture. Under the
  summary there is a plain comparison of the averages ("Average over
  2001-2025: Canada …, the USA …"), and the chart has a colour legend. Land
  surface temperature has MODIS numbers over Ukraine only; when a region lies
  outside it, both regions are computed the same way from the MERRA-2 skin
  temperature (NASA POWER), and the drawer says so.
  The drawer builds the time series and shows:
  - the Theil-Sen slope with its 95% confidence interval;
  - the Mann-Kendall test and the t-test;
  - a light: "significant trend", "a trend, but not significant" or "not enough
    data";
  - the Weatherhead (1998) estimate of years still needed to reach significance;
  - an A-to-B comparison: "N times as fast" or "opposite signs";
  - tiles: change over the period, the record year, the latest year against
    the mean.

  At the top, one plain sentence: what changed, by how much, and whether it is
  reliable ("Kyiv: from 1981 to 2025 it got warmer by about 2.4 °C"). The
  statistical terms are folded under "Details for those who know statistics".

  The **by year** chart carries the trend on for 10 years with the 95% band a
  single year should fall in if the trend goes on. Event marks explain the
  turns ("Pinatubo", "El Niño", "Montreal Protocol", "Invasion"). Click a year
  on the chart and the globe shows that year. The **by month** chart shows the
  last four years, the period mean and the expected next year.

  Chart view: **Years**, **Months** (every month since 1981), **Days** (daily
  NASA POWER data) or **Seasonal cycle**. For months and days the trend is
  checked with the seasonal Mann-Kendall test (Hirsch, Slack and Smith 1982):
  January is compared only with Januaries, so winter and summer do not pose as
  a trend. Daily values are turned into monthly means for the test.

  The chart **stretches and shrinks**: mouse wheel or the + / − buttons, drag
  to move, double click to see it all, and the navigator strip below shows the
  open window (drag the frame or its edges). When values are far enough apart
  each gets a dot, as on a classic data plot. "Full screen" opens the chart over
  the whole page (Esc closes it). Drag the analysis drawer's left edge to resize
  it.

  The **"How it is computed"** tab is written in plain words for school pupils,
  with an everyday example next to each formula: for each method (area mean, Mann-Kendall,
  the seasonal test, Theil-Sen slope, regression and t-test, Weatherhead's
  estimate, the continued trend, the normal, event probability) where it shows
  on screen, plain words, the formula and the same arithmetic on your data (how
  many pairs went up and down, S, Var(S), Z, p and so on). The ⓘ next to the
  verdict opens the test's explanation.

  Region size: point, 250, 500 or 1000 km. Yearly data can be split by season.
  The chart downloads as CSV (years, months or days) and PNG. Under the chart,
  **links to other tools** with the region's coordinates: NASA Worldview,
  Giovanni, Earthdata Search (GLDAS hydrology data), CUAHSI HydroShare and
  HydroClient, and a NASA POWER CSV.
- **Weather**: for any place (a click on the globe, a capital from the list or
  region A/B):
  - a 7-day forecast from Open-Meteo: chance of rain, thunderstorms, gusts
    (a weather-service forecast, not NASA data, and labelled so);
  - **tornado**: the official NOAA Storm Prediction Center probability for today
    and tomorrow (within 40 km) and the severe storm risk for day 3. USA only:
    nobody else publishes official odds, and we do not make them up;
  - "How often it happens here": the share of the month's days with rain, heavy
    rain, heat, frost and strong wind from daily NASA POWER data, 1981-2000
    against 2006-2025, with the Mann-Kendall test on the yearly count of such
    days.
- **Hints on the globe**: zoom in on a place where something notable happened
  (the 2020 Chornobyl zone fires, field burning, Kakhovka, the Aral Sea, Lake
  Chad, Pinatubo, the Amazon in 2019, Canada in 2023, Arctic sea ice) and a red
  map pin appears, its tip on the spot. Its card says what it is and links the
  NASA article and the image of that day in NASA Worldview. Every statement
  comes from those sources.
- **Before/after divider**: "Compare years" on the timeline splits the globe
  with a line; one year on the left, another on the right. Works for GISTEMP
  and every imagery layer; drag the line or move it with the arrow keys.
- **Detective cases**: 10 ready-made investigations, two of them comparisons:
  "the USA and Canada" and "Kyiv and Odesa" (a city on the sea against an
  inland one, as a seasonal cycle). Each flies to the place, turns on the layer
  and computes the trends live:
  - the Arctic;
  - the warming hole off Greenland;
  - the Aral Sea (divider 2000 / 2025);
  - the Kakhovka Reservoir (divider 2022 / 2023);
  - the ozone hole;
  - the Sahel;
  - Ukraine (climate);
  - Ukraine (the war seen from space).
- **Play**: animates the years on the globe, for example 1880 to 2025 for
  GISTEMP, at 1×, 2× or 4×.
- **Share**: the page address always holds the current view (layer, years,
  regions, case, camera); the button copies it.

The statistics are checked against SciPy: the Sen slope, its confidence interval
and the t-test p-value agree to the fifth decimal.

## Updating the climate data

```bash
python data-pipeline/build_gistemp.py            # from the repository root
python data-pipeline/build_gistemp.py --refresh  # fetch the newest GISTEMP file
```

The script downloads `gistemp1200_GHCNv4_ERSSTv5.nc.gz` (about 26 MB) from NASA
GISS into `data-pipeline/cache/` (git-ignored), averages each cell into calendar
years (at least 9 valid months) and writes `public/data/gistemp/annual.bin` and
`meta.json`. Needs Python with numpy and scipy.

Other scripts:

```bash
python data-pipeline/build_ozone.py        # NASA Ozone Watch: ozone hole area by year
python data-pipeline/build_occupation.py   # official list of occupied territories + OSM hromada boundaries
python data-pipeline/build_geo.py          # Natural Earth: country outlines, capitals, seas, rivers
python data-pipeline/build_front_history.py # DeepState: occupied territory weekly since April 2022 (≈ 250 versions, cached in cache/front)
```

`build_geo.py` downloads Natural Earth layers (about 20 MB of GeoJSON from
github.com/nvkelso/natural-earth-vector) into `data-pipeline/cache/naturalearth/`,
simplifies the lines and writes `public/data/geo/countries.json` (about 550 KB:
outlines of 237 countries for comparisons) and `labels.json` (about 170 KB: 200
capitals, 125 seas and oceans, 160 rivers). Ukrainian names of countries,
capitals and seas come from Natural Earth; river names are translated in the
script. Natural Earth draws Crimea as Russian by default; the script moves its
polygon to Ukraine.

`build_occupation.py` reads the three DOCX parts of the official list from
zakon.rada.gov.ua (Order No. 376, current edition), keeps each settlement's status
that has no end date and rolls them up to hromadas. Hromada boundaries come from
OpenStreetMap by KATOTTG code (the `katotth` tag), © OpenStreetMap contributors,
ODbL. Crimea has no hromadas on the ground and Sevastopol is listed whole, so they
are drawn from their districts, which follow the coast rather than the edge of the
territorial sea. The current edition gives 149 occupied hromadas outside Crimea, plus Crimea and
Sevastopol, 24 partly occupied and 60 with active hostilities. For a new edition
pass the new links and date:
`--docx URL URL URL --edition DD.MM.YYYY`.

NASA Earthdata data needs a free Earthdata Login token: copy
`data-pipeline/.env.example` to `data-pipeline/.env` and paste the token there
(not into `.env.example`!). The `.env` file is never committed.

```bash
python data-pipeline/build_no2.py         # OMI NO₂ over Ukraine, monthly since 2005 (~35 min)
python data-pipeline/build_modis.py ndvi  # MODIS vegetation (NDVI), monthly since 2000
python data-pipeline/build_modis.py lst   # MODIS daytime land surface temperature
python data-pipeline/build_fires.py       # NASA FIRMS: fires in Ukraine by month since 2012 (no token needed)
```

`build_no2.py` reads the daily OMNO2d v003 files through NASA's cloud OPeNDAP and
fetches only the box over Ukraine (44-53° N, 22-41° E), about 40 kB a day
instead of 11 MB. For every 0.25° cell it averages the days of a month (at least
3) and writes `public/data/no2/ukraine.bin` and `ukraine.json`. Progress is
cached month by month, so an interrupted run picks up where it stopped. Months
with no files in the NASA archive (OMI after March 2026) stay empty.

`build_modis.py` likewise reads only the box over Ukraine from MOD13C2 and
MOD11C3 and averages the 0.05° pixels into 0.25° cells. `build_fires.py` takes
NASA FIRMS's public yearly archive for Ukraine (VIIRS 375 m) and counts
detections by month; industrial sources (type 2), offshore (type 3) and
low-confidence detections are left out.

A year in these series is the mean of each month's departure from that month's
normal plus the mean normal, with at least 9 months: a missing winter month
(clouds, snow) does not drag the year up or down.

## Where things are

| Path | What |
|---|---|
| `src/pages/Home.tsx` | One-screen home: background film, headline, button into the globe |
| `src/pages/Explore.tsx` | `/explore`: globe, search, layer panel |
| `src/components/HeroFilm.tsx` | Background film: crossfades, buffering logic, pause |
| `src/components/Globe.tsx` | Three.js globe: GIBS maps and close-ups, borders, labels, data layer, fly-to, picking |
| `src/components/ExplorePanel.tsx` | Layer switches, year sliders, legend, value readout |
| `src/components/CountrySearch.tsx` | Country search |
| `src/hooks/useClimateLayer.ts` | Loads GISTEMP, builds the year, difference or trend field |
| `src/data/gistemp.ts` | GISTEMP file format, colour ramp, global statistics |
| `src/data/countries.ts` | Country centroids (Google DSPL table, CC BY 4.0) |
| `src/data/media.ts` | Video clips, GIBS map URLs |
| `src/i18n/strings.ts` | All copy, Ukrainian and English |
| `src/styles/tokens.css` | Colours, fonts, spacing (the only place literal colours live) |
| `src/styles/site.css` | Component styles |

## Changing content

- **Text**: edit both `uk` and `en` in `src/i18n/strings.ts`.
- **A background clip**: edit `filmClips` in `src/data/media.ts`. `start` and `end`
  are seconds into the source video, `rate` slows a short time-lapse. Avoid
  stretches with burned-in titles.
- **Video quality**: 1080p on large screens with a fast connection, 720p
  otherwise, 640px on phones and slow or data-saving connections.

NASA insignia are not used; the credit line states the site is not an official NASA website.
