# Earth-System-Detective

[Українська](README.md) | **English**

**A living 3D Earth from NASA's open data: what is happening to the planet now, what has changed over
decades, and what is happening in Ukraine.**

**Live site:** https://luufus.github.io/Earth-System-Detective-/ · **Made by:** IT Detectives
(Maksym Semenov and Anastasiia Chupyra)

![Home page: sunrise over Earth from the ISS](docs/screenshots/home.jpg)

## About the project

NASA's and other agencies' satellites measure air and ocean temperature, rain, snow and ice,
vegetation, air pollution, fires and city lights at night every day. The data are open, but scattered
across dozens of archives, formats and services, and hard for most people to reach. **Earth System
Detective** brings them together on an interactive globe and a 2D map that simply open in a browser.

On the site you can:

- **see** the Earth as satellites see it: 20+ NASA data layers, the real Sun and the night side with
  city lights, every fire of the last 48 hours, wind and the weather forecast;
- **check** whether a change is real: the site computes trends straight from NASA data with
  statistical tests (Mann-Kendall and Sen's slope) and says in plain words what changed, by how much,
  and whether it is significant;
- **compare** two countries, two regions or two years;
- **find out** what is happening in Ukraine: air quality, the front line, occupied communities,
  radiation, fires and blackouts after the strikes on the power grid;
- **understand** events: what happened, why, who or what caused it and what can be done;
- **follow your own city**: the weather, the air (measured and forecast by a model), fires nearby, how
  the climate has changed and the advice of the day — on one page;
- **see the war’s toll on the environment**: the Kakhovka dam, burned land along the front, Azovstal,
  Chornobyl and the Zaporizhzhia plant — with images before and after and sources;
- **ask the Earth** in plain words: “Is it getting warmer in Cherkasy?” — and get an answer with
  numbers.

### Why

News about climate and the environment often says "it got worse" without numbers or sources. We
wanted anyone — a pupil, a teacher, a journalist, a volunteer — to be able to open the data
themselves, see what is happening, where and by how much, and tell a real trend from chance. So the
site follows three rules:

1. **Open data only**, with the source named next to every layer, event and number.
2. **Nothing made up.** Where there is no data, the site says so; it names only causes visible in the
   data (wind, rain, fires nearby, the CAMS model).
3. **Numbers with a check.** A trend is shown together with whether it is statistically significant.

### History

The project started at the **NASA Space Apps Challenge 2026** hackathon (challenge
[Earth System Trend Detective](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/),
hosted locally by Noosphere) as a globe of temperature trends. Since then we have kept developing it
for ourselves: fires, Ukraine, weather, air quality, events and a new design.

## Contents

- [3D Earth and layers](#3d-earth-and-layers)
- [The real Sun, night and blackout](#the-real-sun-night-and-blackout)
- [Fires](#fires)
- [Map of Ukraine](#map-of-ukraine)
- [My city](#my-city)
- [The war’s toll on the environment](#the-wars-toll-on-the-environment)
- [Weather forecast](#weather-forecast)
- [Air quality forecast](#air-quality-forecast)
- [Ask the Earth](#ask-the-earth)
- [Trend analysis and comparison](#trend-analysis-and-comparison)
- [Events](#events)
- [Home page and phone](#home-page-and-phone)
- [How it works](#how-it-works)
- [Run it](#run-it)
- [Tests](#tests)
- [Data sources](#data-sources)

The screenshots show the Ukrainian interface; the site switches to English with one button.

## 3D Earth and layers

![3D Earth with the sea temperature layer and the layer shelves](docs/screenshots/layers.jpg)

The main screen (`/explore`) is a Three.js globe with NASA GIBS satellite imagery and relief. On the
left, a tool column: **Layers, Fires, Ukraine, Weather, Analysis, Events, Glossary, Share**; in the
middle, a country or city search and a 3D / 2D switch; at the bottom, a timeline. The panel that slides out on
the left can be **made wider or narrower**: drag its right edge (or use ← → on the keyboard; a button
in its header switches between the usual and a wide panel); the width is remembered.

- **20+ NASA layers on shelves**: temperature (GISTEMP anomaly since 1880, air, land surface, sea),
  water (GPM and MERRA-2 rain, water vapour, humidity, soil moisture, snow, sea ice), air (nitrogen
  dioxide, ozone, carbon monoxide, dust, aerosols, wind), land (NDVI vegetation, land cover, fires),
  people (night lights, population density).
- **Cities** (under "Borders and names", next to the capitals, seas and rivers): over 3,000 cities
  of the world with 100,000 people and more and the cities of Ukraine, with their population; the
  closer you zoom, the more cities. Click a city for a card with its population, built-up area, air,
  radiation and fires nearby. Cities can be found in the search too (smaller ones through the
  Open-Meteo geocoder).
- **Layer hints**: each layer has a scale with numbers and units and an explanation of the colours;
  the pointer shows the value at a place in words.
- **Year player**: "From" — the year to play from to the latest; the bottom bar folds away.
- **Glossary**: over 40 terms in four sections (trends and statistics, data from space, air, fires and
  war) with search. Each has a plain-words definition, the **formula** (Mann-Kendall, Sen's slope, AQI,
  NDVI, optical depth…), **how to read the numbers** (thresholds, units, WHO guidelines), a worked
  example and where it appears on the site.
- **Zoom to street level**: close up the globe loads a sharper image of the visible area, and gaps
  between satellite passes are filled from neighbouring values, so layers do not break into "pixels".
- **Borders and names**: country borders (Crimea as part of Ukraine), capitals, seas, rivers.

![The NO₂ value under the pointer, local time and the temperature now](docs/screenshots/readout.jpg)

**Under the pointer**, anywhere on Earth: the place, the temperature now (NOAA GFS), wind, local time,
the value of the layer that is on, fires and air quality nearby, and the nearest event.

## The real Sun, night and blackout

![The real Sun: the day-night line and city lights on the night side](docs/screenshots/night.jpg)

Three lighting styles: **even**, **the real Sun now** (the night side with NASA Black Marble city
lights) and **the whole planet at night**.

![Blackout: Ukraine at night before and after the strikes on the power grid](docs/screenshots/blackout.jpg)

**Blackout**: Ukraine at night on 3 October 2021 and on 25 November 2022 (after massive strikes on the
power grid) under a before/after slider.

## Fires

![Every fire of the last 48 hours: Africa in the dry season](docs/screenshots/fires.jpg)

- **Fires now**: every detection of the last 48 hours from NASA FIRMS — VIIRS (NOAA-20, NOAA-21,
  Suomi NPP satellites, 375 m) and MODIS (Terra, Aqua, 1 km). The colour shows how many hours ago the
  fire was seen. Updated every hour; NASA publishes detections about 1–3 hours after the overpass.
- **Two fire layers and how they differ**: the Fires layer is the archive of one chosen day of the
  chosen year (it steps day by day and works with the comparison shutter); Fires of the last 48 hours
  is what the satellites see now. So the live points are always newer; while years are compared they
  are hidden. The archive reads NASA GIBS vector tiles of three satellites at once: Suomi NPP stopped
  sending fires in 2026, so newer days come from NOAA-20 and NOAA-21.
- **Ukraine over 7 days**: the number of fires and a chart by day.
- **Big fires day by day**: Los Angeles (January 2025), Quebec (2023), the front (2022), Evia and
  Turkey (2021), the Chornobyl zone and Luhansk region (2020), spring field burning in Ukraine (April
  2018), and the war: the oil depot near Vasylkiv (February 2022), the Azot plant in Sievierodonetsk
  (June 2022), the ports of Odesa and Chornomorsk (July 2023), the mass attack on Kyiv (June 2025).
  The fire points come from the NASA FIRMS archives of two satellites (Suomi NPP and NOAA-20). You
  see fire flare up, smoulder and leave a burn scar.
- **Where most fire burns now**: the strongest clusters of fire in the world over 48 hours
  (volcanoes left out), with the count of the last day against the day before. Click one and the
  site works out where the smoke goes with the NOAA GFS wind forecast (if the fires keep burning as
  now), the fire weather of 3 days (the Fosberg index, FFWI, from the Open-Meteo forecast of
  temperature, humidity and wind) and whether the air in the towns around will get worse (the CAMS
  model forecast).
- **Smoke and wind**: a button in a story zooms in on the few days when the smoke mattered most:
  puffs of smoke from every fire carried by the real wind of those hours (the ERA5 reanalysis), wind
  arrows only near the fire, and circles with the air quality in the towns around (the CAMS model)
  that turn red as the smoke arrives. Alongside: what happened, why, what it led to (including the
  town with the worst air) and what to do; war scenes (the front, strikes) have their own advice. The
  smoke is drawn on the graphics card (Three.js): thousands of soft puffs in one call, on the 3D Earth
  and on the 2D map (a MapLibre custom layer).

![The Chornobyl zone fire, April 2020](docs/screenshots/fire-story.jpg)

## Map of Ukraine

![Map of Ukraine: air quality, fires, the front line](docs/screenshots/ukraine-map.jpg)

A separate 2D map (`/map?mode=ukraine`, MapLibre): Ukraine highlighted, its neighbours dimmed (zoomed
out to the world the dimming fades). Map styles: relief, satellite, OpenStreetMap.

- **Air quality**: the AQI (US EPA scale) inside each bubble, coloured from "clean" to "hazardous".
  Data from SaveEcoBot, Sensor.Community open sensors and, with a token, the World Air Quality Index
  (WAQI). Readings older than 3 hours are drawn faded.
- **Station card** in plain words: "Unhealthy air — harmful for everyone", **what we advise against**
  (running, airing the home, burning leaves…), **what helps** (an FFP2 respirator, an air purifier) and
  **why the air may be like this** (smoke from burning grass and stoves, road dust, exhaust). Pinned, it
  also shows the district, the main pollutant, PM2.5, PM10, NO₂, O₃, SO₂ and CO sub-indices, and what the
  data show nearby: fires, still air, rain, humidity, dust and gases from the Copernicus CAMS model.
- **Occupied territory and the DeepState front line**; **occupied communities** from the official list
  of Ukraine's Ministry of Development; **fires** from NASA FIRMS.
- **Fires of the last 48 hours**: dots by age and power from afar, flames close up. Click a fire:
  when a satellite saw it, how strong it is, the town nearby, whether its hromada is in the official
  list of war or occupied territories, and **Where will the smoke go**: the plume with the NOAA GFS
  wind forecast for a day and the towns it may reach (how far depends on the fire's power).
- **Cities**: dots with names you can click, and a city search with its card.
- **Strikes with fires, and their smoke**: marks of documented strikes after which satellites saw
  fire, and their list in the panel. Click one and the Smoke and wind scene opens right on the map:
  where the wind took the smoke, what the air was like in the towns, why it happened, what it led to
  and what to do. During a scene the live layers (air, radiation, fires of 48 hours) step aside, so
  today is not mixed up with the past.
- **Background radiation at stations around the world**: Ukraine from SaveEcoBot; Germany and Finland
  from the national networks BfS and STUK; elsewhere volunteers' counters of Safecast and
  Sensor.Community (less precise, the card says so). Each tag is a station with its number in µSv/h
  and a colour for the level (low, ordinary, raised, high). Air and radiation take turns so the
  markers do not cover each other. The station card explains in plain words what the number means, what it adds up to
  in a year and what to do. The same on the 3D Earth, in My city and in Ask the Earth ("What is the
  radiation in Kyiv?").
- **Occupation timeline since 2022** (on the map and on the 3D Earth): a week-by-week player from the
  line before 24 February 2022 to today. The weeks dissolve smoothly into each other; what was captured
  in the last 4 weeks glows amber, what was liberated blue. Above the slider: the date, the occupied
  area (≈ km² and % of Ukraine), what was captured and liberated that week, and a chart of the area
  with key dates (the north, Kharkiv, Kherson, Bakhmut, Avdiivka); click the chart to jump to a date.
- The **weather forecast** can go over the map.

![Station card: the main pollutant and what is nearby](docs/screenshots/air-card.jpg)

## My city

![My city: Cherkasy — the weather, advice of the day, air, fires and climate](docs/screenshots/city.jpg)

The `/city` page: choose a town by name or with “Where am I”, and one screen has what matters today.
**Pin** the city and it shows on the home page with its temperature and AQI (kept in this browser
only).

- **Now** and the **weather** for 24 hours and 7 days (Open-Meteo).
- **Air**: the AQI of the nearest station (SaveEcoBot, Sensor.Community, WAQI; with when it was
  measured) and the CAMS model now, over the last day and 3 days ahead.
- **Advice of the day**: the best time to air the rooms, whether to go for a walk or a run, strong sun
  (UV) and desert dust — with the reasons from the data. Advice, not medical guidance.
- **Fires nearby**: NASA FIRMS detections within 50 km over 48 hours.
- **How the climate has changed**: the yearly temperature since 1981 (NASA POWER) with Sen’s slope and
  the Mann-Kendall test, e.g. “+2.5 °C since 1981, a significant trend”.

## The war’s toll on the environment

![The war’s toll on the environment: the damage in numbers](docs/screenshots/war.jpg)

The `/war` section — four stories of what the war does to Ukraine’s nature:

- **The Kakhovka dam** — Landsat images (NASA Earth Observatory) before and after with a slider: the
  reservoir, the flood on the Dnipro, the irrigation canals of the south;
- **Burned land along the front** — forests, mines, emissions from landscape fires;
- **Mariupol, Azovstal and the Sea of Azov** — industrial pollution, warnings that were never
  confirmed, and fake photos;
- **Chornobyl and the Zaporizhzhia plant** — occupation, the drone strike on the confinement arch, the
  plant’s power losses.

Each has what happened, **what it means for Ukraine and for the world**, photos under free licences
with their authors (no photos of the dead or wounded), and videos with their channels named (IAEA,
EBRD, EPRS, AP, UATV) that load from YouTube without cookies only when played. At the top, **the
damage in numbers**: environmental damage, war emissions, forests, mined land, protected areas, the
Kakhovka reservoir — each with its date and a link to the primary source.

![The Kakhovka dam: before and after with a slider](docs/screenshots/war-kakhovka.jpg)

## Weather forecast

![Weather forecast: animated wind over Europe](docs/screenshots/weather-wind.jpg)

A map in the spirit of Windy (`/map?mode=weather`): the American **NOAA GFS** model's forecast 72
hours ahead in 3-hour steps.

- Layers: animated **wind** lines, **gusts**, **temperature**, **rain and snow**, **cloud** and the
  RainViewer **precipitation radar** for the last two hours.
- **Forecast player**: the wind flows smoothly between steps and the colour layer cross-fades.
- **Forecast at a point**: click anywhere for hourly temperature and rain and the strongest wind
  (Open-Meteo).
- On the 3D Earth, the Weather section gives a 7-day forecast anywhere, the tornado probability from
  the NOAA Storm Prediction Center (US only: there is no other official data) and "how often it
  happens here" for rain, heat, frost or strong wind in 1981–2000 versus 2006–2025.

![Temperature forecast and the forecast at a point](docs/screenshots/weather-temp.jpg)

## Air quality forecast

![The CAMS model's PM2.5 forecast over Ukraine](docs/screenshots/air-forecast.jpg)

The weather map has an **“Air · model forecast”** group: the AQI, fine particles PM2.5 and desert dust
from the Copernicus CAMS model over Ukraine and its neighbours, 3 days ahead in 3-hour steps. The
player shows smoke and dust moving, with the wind lines and station cards of the same moment. It is
labelled honestly as **a model, not measurements**; the bubbles on the map of Ukraine are station
measurements.

## Ask the Earth

![Ask the Earth: “Is it getting warmer in Cherkasy?”](docs/screenshots/ask.jpg)

The **Ask the Earth** button at the top of every page: type a question in plain words — “Is it getting
warmer in Cherkasy?”, “What is the air like in Kyiv now?”, “Are there fires near Kharkiv?”, “What is
the weather tomorrow in Odesa?” — and the site finds the place, works out the answer from the data and
links to the globe, map or city page.

No AI yet: the site reads the topic (temperature, rain, snow, air, radiation, fires, weather, ice, war) and the
place (a country by name, a town via Open-Meteo search, undoing Ukrainian case endings). The answer is
computed with the same methods as the analysis (Sen’s slope, Mann-Kendall). Claude can be connected
here later to understand any question.

## Trend analysis and comparison

![Analysis: air temperature in Ukraine, the 1960–2025 trend](docs/screenshots/trends.jpg)

Pick a country, a region or a point (region A), and the Analysis panel shows the data series and
checks it for a trend.

- **Mann-Kendall test**: whether the change is statistically significant (a reliability traffic
  light); the seasonal version for months and days.
- **Sen's (Theil-Sen) slope**: how fast the change goes, with a confidence interval.
- **Chart views**: years, months, days (daily NASA POWER data) and the seasonal cycle; the chart
  zooms, pans, goes full screen and saves as an image or CSV.
- **Comparison**: add region B — two countries or regions on one chart, and which changes faster.
  Countries are outlined on the globe, and the numbers are computed inside their borders only.
- **All about the places**: two cities (or two points) side by side by everything the site can
  measure: population, area and density; industrial areas and factories from OpenStreetMap; green
  and vegetation (NDVI), summer surface heat (NASA MODIS); fires nearby, air quality and radiation
  now; mean temperature, rain and height. Green is better for people, red worse; each row says where
  its number comes from.
- **"How it is computed"**: for each method, a plain explanation, the formula and the same
  computation on your data (S, Var(S), Z, p, slope, interval).
- **GISTEMP layer**: the temperature anomaly for a year, the difference between two years and the
  trend in each 2°×2° cell since 1880; non-significant cells are hatched.
- The same region opens in NASA Worldview, Giovanni, Earthdata Search and CUAHSI services
  (HydroShare, HydroClient).

![Comparison: Ukraine and Poland on one chart](docs/screenshots/compare.jpg)

## Events

![The list of events with photos](docs/screenshots/events.jpg)

Events visible from space: fires, deforestation, droughts, floods, melting ice, volcanoes, air
pollution, heat, war. On the globe they are markers by category; the Events section has two tabs:
**News** (every event, newest first, filtered by "Ukraine", "Fires", "Water and drought"…) and
**Investigations**. Each news item gives **when** (the exact date or span, e.g. "7–31 January 2025"),
**where**, what happened, the **main causes**, the **consequences** with numbers, what can be done,
Wikimedia Commons photos (authors and licences given) and sources. Buttons on the card show the event
on the globe **for those very days**: NASA FIRMS fire points day by day, a layer on the exact date
(rain, NO₂, an image) or a before/after comparison (the 2021 and 2022 blackout).

![An event card: the drying of the Aral Sea](docs/screenshots/event.jpg)

## Home page and phone

![The About section on the home page: a screenshot and a description of each part](docs/screenshots/about.jpg)

Home: NASA footage (sunrise over Earth from the ISS, Earth by day and by night, the PACE launch),
buttons into the 3D Earth, weather, fires and Ukraine, and below them "About": what the site is, why,
how to start, each part with a screenshot, how the data update, who it is for and the authors. The
**Sources** button lists every data source. The site works in Ukrainian and English, and on phones.

| Home | Map of Ukraine | 3D Earth |
|---|---|---|
| ![Home on a phone](docs/screenshots/mobile-home.jpg) | ![Map of Ukraine on a phone](docs/screenshots/mobile-map.jpg) | ![3D Earth on a phone](docs/screenshots/mobile-globe.jpg) |

## How it works

**Browser** (`frontend/`): React 19, TypeScript and Vite.

- **Globe**: Three.js with custom shaders — day and night by the real position of the Sun, relief,
  atmosphere. NASA GIBS imagery loads in tiles, with a separate sharp patch for the visible area close
  up.
- **2D map**: MapLibre GL; wind and station bubbles are drawn on their own canvases over the map.
- **Analysis**: statistics in the browser — Mann-Kendall tests (plain and seasonal), the Theil-Sen
  slope with a confidence interval.
- **Web Workers** (with Comlink): forecast frames are painted on a background thread with
  OffscreenCanvas, so the map and globe keep moving during playback (about 45 frames a second).
- Animations: springs from the design system (Jelly slider, Stat card).

**Data** (`data-pipeline/`, Python): some servers do not serve browsers on other sites, so scripts
collect the data and publish it as files.

- `build_live.py` — the NOAA GFS forecast (its own GRIB2 reader, no ecCodes), NASA FIRMS fires (VIIRS
  and MODIS), Sensor.Community sensors with a filter for broken ones (readings many times above their
  neighbours) and the AQI on the US EPA 2024 scale. The data are compressed so the site loads faster.
- The same script fetches the CAMS air quality forecast (Open-Meteo) twice a day on a 0.5° grid
  over Ukraine and its neighbours; in between it reuses the one already published.
- `build_fire_stories.py` — big fires from the FIRMS archives.
- `build_geo.py` — borders, labels and the city list (`cities.json`, Natural Earth).
- `build_live.py` also gathers the background radiation of stations around the world
  (`radiation.json`: BfS, STUK, Safecast, Sensor.Community).
- `build_front_history.py` — the occupation timeline: one DeepState map version a week since April
  2022, only what is occupied inside Ukraine; areas counted on a 0.005° grid, outlines simplified
  (numpy only).
- Other scripts prepare GISTEMP, the ozone hole, NO₂ and MODIS over Ukraine, occupied communities,
  Natural Earth borders and names.

Everything else the browser fetches directly: NASA GIBS and POWER, Open-Meteo and Copernicus CAMS,
SaveEcoBot, WAQI, RainViewer, DeepState, OpenStreetMap Nominatim, Wikimedia Commons.

### How the data update

| What | Source | How often |
|---|---|---|
| Fires, last 48 hours | NASA FIRMS (VIIRS, MODIS) | every hour |
| Weather forecast | NOAA GFS 1° | every hour (new runs every 6 hours) |
| Air quality | SaveEcoBot, Sensor.Community, WAQI | every hour |
| Air quality forecast | Copernicus CAMS via Open-Meteo | twice a day |
| Precipitation radar | RainViewer | every few minutes |
| Front line | DeepState | as soon as a change is published |
| NASA layers and series | GIBS, POWER, GISTEMP | as new months come out |

## Run it

```bash
cd frontend
npm install
npm run dev
```

The browser opens by itself. While `npm run dev` runs, the server refreshes fires and air every hour
(and the GFS forecast once it is over 6 hours old) by running `data-pipeline/build_live.py` (Python
with numpy). By hand: `npm run live`.

**WAQI air quality.** Get a free token at https://aqicn.org/data-platform/token/ and put it in
`frontend/.env.local` (kept out of git):

```bash
VITE_WAQI_TOKEN=your_token
```

For the GitHub Pages site, add the same token as the repository secret `WAQI_TOKEN`
(Settings → Secrets and variables → Actions). Without a token the site uses SaveEcoBot and
Sensor.Community.

Code, data and how to refresh GISTEMP are in [`frontend/README.en.md`](frontend/README.en.md);
colours, type and components in [`DESIGN.md`](DESIGN.md).

## Tests

```bash
cd frontend
npm test            # Vitest: statistics, AQI, advice, question parsing, forecast fields
npm run test:e2e    # Playwright in the installed Chrome: the site in a real browser
npm run screenshots # Playwright: retake the screenshots for this README
```

- **Vitest** checks the Mann-Kendall tests and Sen’s slope against values computed independently in
  SciPy (`frontend/tests/reference/`), and the AQI, station search, advice and question parsing. The
  tests run before every deployment: if something breaks, the site is not updated.
- **Playwright** opens the site in Chrome and checks what broke before: the real Sun from the first
  second, year labels, air bubbles, smooth forecast playback (no frame over 400 ms), the phone layout,
  My city, the war section and Ask the Earth.

## Deployment

Every push to `main`, and an hourly schedule, run GitHub Actions
([`.github/workflows/pages.yml`](.github/workflows/pages.yml)): fresh fires, air and forecast are
collected, the site is built and published to the `gh-pages` branch, which GitHub Pages serves.

## Repository layout

| Path | What |
|---|---|
| `frontend/src/components/` | Globe, map, panels, cards |
| `frontend/src/pages/` | Pages: home, 3D Earth (`Explore`), 2D map (`WeatherMap`) |
| `frontend/src/data/` | Loading and processing data in the browser |
| `frontend/src/analysis/` | Statistics: Mann-Kendall, Sen's slope, data series |
| `frontend/src/workers/` | Background threads: painting forecast fields |
| `frontend/e2e/` | Playwright tests and screenshots |
| `frontend/tests/reference/` | Reference statistics from SciPy |
| `frontend/src/i18n/` | Ukrainian and English text |
| `frontend/public/data/` | Prepared data: GISTEMP, borders, fire stories |
| `data-pipeline/` | Python scripts that collect and prepare data |
| `docs/screenshots/` | Screenshots for this README |
| `DESIGN.md` | Design system: colours, type, components |

## Data sources

NASA GISS (GISTEMP v4), NASA GIBS, NASA POWER (MERRA-2), NASA Ozone Watch, OMI, MODIS, NASA FIRMS,
NASA Black Marble, NASA Image and Video Library, NASA JSC Crew Earth Observations; NOAA GFS; NOAA
Storm Prediction Center; RainViewer; Open-Meteo; Copernicus CAMS via Open-Meteo; DeepState;
SaveEcoBot (air and background radiation); Sensor.Community; World Air Quality Index (WAQI);
NASA Earth Observatory; CEOBS; UNEP; the IAEA (via the World Nuclear Association); Ukraine's State
Environmental Inspectorate, State Forest Resources Agency and State Emergency Service; the Initiative
on GHG Accounting of War; IAEA, EBRD, EPRS, AP and UATV videos on YouTube; Open-Meteo town search
(GeoNames); the list of occupied
communities from Ukraine's Ministry of Development; Natural Earth maps (public domain) and
OpenStreetMap (ODbL); photos from Wikimedia Commons (authors and licences in the event cards).

## Authors

**IT Detectives** — Maksym Semenov and Anastasiia Chupyra. Built with Claude (Anthropic).

This is not an official NASA website, and NASA does not endorse the project.
