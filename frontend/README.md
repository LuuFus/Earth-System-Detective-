# Earth System Detective: frontend

NASA Space Apps Challenge 2026 project for the **Earth System Trend Detective**
challenge. React + TypeScript + Vite, Three.js for the globe.
The visual system lives in [`../DESIGN.md`](../DESIGN.md).

## Run

```bash
npm install
npm run dev        # opens the browser by itself (port 5173, or 5174 if 5173 is busy)
npm run build      # type-check + production build into dist/
```

An internet connection is required: video streams from NASA servers
(images.nasa.gov, eol.jsc.nasa.gov) and the Earth imagery from NASA GIBS. The
climate data ships with the site (`public/data/gistemp`, 2.4 MB).

## What the 3D Earth does (`/explore`)

- **Rotate and zoom**: drag, mouse wheel or pinch, down to about 380 km above
  the surface. Below a certain height the globe asks NASA GIBS for a sharp
  image of just the visible area (Blue Marble, 500 m per pixel).
- **Find a country**: the search box flies the camera there. Names come from the
  browser in Ukrainian or English (`Intl.DisplayNames`), so any spelling works.
- **Borders and names**: international boundaries (US Department of State) and
  coastlines from NASA GIBS, country names drawn by the app in the site language.
- **Surface temperature, NASA GISTEMP v4** (anomalies against 1951-1980, 2-degree
  cells, 1880-2025):
  - *Year*: the anomaly of one year.
  - *Compare*: the difference between two years, for example 2025 minus 1960.
  - *Trend*: per-cell Theil-Sen slope in degrees per decade over a chosen period,
    with the Mann-Kendall test; cells with p of 0.05 or more are hatched. Runs in a
    Web Worker (`src/workers/trend.worker.ts`).
  - Hover or tap the globe to read the value of a cell; the legend shows the
    global mean for the same choice.

## Updating the climate data

```bash
python data-pipeline/build_gistemp.py            # from the repository root
python data-pipeline/build_gistemp.py --refresh  # fetch the newest GISTEMP file
```

The script downloads `gistemp1200_GHCNv4_ERSSTv5.nc.gz` (about 26 MB) from NASA
GISS into `data-pipeline/cache/` (git-ignored), averages each cell into calendar
years (at least 9 valid months) and writes `public/data/gistemp/annual.bin` and
`meta.json`. Needs Python with numpy and scipy.

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
