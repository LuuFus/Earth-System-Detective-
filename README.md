# Earth-System-Detective-
3 студєнта які приймають участь в хакатоні від Noosphere

---

**Earth System Detective** is our project for the NASA Space Apps Challenge 2026,
challenge [Earth System Trend Detective](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/):
a 3D Earth where you pick a NASA variable and see what is changing, where, by how
much, and whether the change is statistically significant.

## What is here

- **Home page**: one screen of NASA footage (sunrise over Earth from the ISS, PACE
  assembly and launch, the ISS at night), the headline and a button into the globe.
  Ukrainian and English.
- **3D Earth** (`/explore`): rotate and zoom down to about 380 km with sharp NASA
  GIBS imagery, country search, borders and country names, and a surface
  temperature layer from NASA GISTEMP v4 (1880-2025) with three modes: one year,
  the difference between two years (for example 2025 minus 1960), and the trend
  per cell (Theil-Sen slope with the Mann-Kendall significance test).

## Run it

```bash
cd frontend
npm install
npm run dev
```

The browser opens by itself. Details, the data pipeline and the code map are in
[`frontend/README.md`](frontend/README.md); the visual system is in
[`DESIGN.md`](DESIGN.md).

## Repository layout

| Path | What |
|---|---|
| `frontend/` | React + TypeScript + Vite app, Three.js globe |
| `data-pipeline/` | Python scripts that turn NASA datasets into files for the app |
| `DESIGN.md` | Colours, type and components |

Data and media: NASA GISS (GISTEMP v4), NASA GIBS, NASA Image and Video Library,
NASA JSC Crew Earth Observations. This is not an official NASA website, and NASA
does not endorse the project.
