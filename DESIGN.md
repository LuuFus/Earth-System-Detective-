# Design: Earth System Detective

**Revision 2026-11-19 ("mix").** The poster style (square chips, uppercase serif, navy glass)
was replaced: layout after Google Earth, surfaces and motion after Design Bookmark's Motion
Studies. Source of truth for values: `frontend/src/styles/tokens.css`; the shell lives in
`frontend/src/styles/ui.css`, content styles (charts, methods, cases) in `site.css`.

## Structure

- **Home (`/`)**: full-bleed NASA footage, words bottom left: a live-data eyebrow, the headline
  "Жива Земля", one paragraph, the main pill into the globe and three glass pills (weather map,
  fires, Ukraine). Top bar: wordmark left; Sources and language right.
- **3D Earth (`/explore`)**: the globe fills the screen. Top left: round back button and the
  search pill; top right: 2D map pill and language. Left: the tool column (Layers, Fires,
  Ukraine, Weather | Analysis, Cases, Glossary, Share). Bottom left: the map-style button (a
  thumbnail of the current style). Bottom right: home and zoom buttons. Panels open beside the
  column; the analysis drawer on the right; the timeline floats at the bottom.
- **Weather map (`/weather`)**: dark OpenStreetMap, the GFS field with wind lines, the layer
  list on the right (as Windy), the forecast timeline at the bottom, a point forecast card.

## Colour

| Token | Value | Role |
|---|---|---|
| `--color-void` | `#04060b` | Space, page background |
| `--surface-1` | `#15171c` | Panels and cards |
| `--surface-2` | `#1f2228` | Rows, fields, buttons inside panels |
| `--surface-3` | `#2a2e36` | Hover, tracks |
| `--surface-glass` | `#15171c` at 86% + 16px blur | Floating controls over the globe |
| `--text-1/2/3` | `#f4f6f9`, 76%, `#9198a4` | Text |
| `--inverse` / `--on-inverse` | `#f4f6f9` / `#0b0d12` | Primary pills, slider thumbs, the active tool |
| `--accent` | `#8ab4f8` | Switches on, focus rings, links, the analysis toggle |
| `--color-series-a/b` | `#f3bd6e` / `#8fbcff` | Region A and B; warm and cool in the stat card |

Data colours: AQI bands `--aqi-1..6` (EPA), front line `--color-front-*` (occupied red,
liberated blue, unknown grey), fires ramp white-hot to red, weather scales in `data/live.ts`.

Rules: no strokes around boxes (a hairline `--line` only separates groups); floating controls
carry `--shadow-float`; panels are solid; no uppercase labels; one primary (inverse) action per
view.

## Type

Inter everywhere in the interface (600 for titles and numbers, 500 for buttons, 400 for text),
sentence case. Headline: Inter 600, `clamp(40px, 5.6vw, 88px)`, tracking -0.035em. Source Serif
italic stays only for sea and river names on the map and for formulas.

## Shape

Radii: 8 (keys), 12 (rows), 20 (small panels), 24 (sheets), pills 999. Inner radius = outer
minus the padding between them. Buttons: 44px round or pill over the globe, 32–40px inside
panels.

## Motion

Springs from Design Bookmark's `tokens.css`, same stiffness and damping, through one
requestAnimationFrame loop (`src/motion/spring.ts`, a port of `motion.js`):

- **Jelly slider** (`components/ui/JellySlider.tsx`): map year, the shutter's left year, the fire
  story day, the front-line version, the forecast hour. `--slider-follow 900 50`,
  `--slider-bubble 420 22`, `--slider-release 300 14`, glide `420 34`, goo blur 8.
- **Stat card** (`components/ui/StatCard.tsx`): top of the analysis drawer; points `200 17`
  staggered 30 ms, number and chip `160 22`, pill `380 30`.
- **Tool column highlight**: `--nav-lead 560 34` on the edge facing the move, `--nav-trail
  220 21` on the other, so it stretches.
- Panels slide 12px and fade in with `cubic-bezier(.22, 1, .36, 1)`. Reduced motion: springs are
  critically damped and CSS animations are off.

## Globe

- Styles: Satellite (Blue Marble, Landsat close up) or Relief (Blue Marble shaded relief with
  bathymetry; ASTER 30 m hill shading close up). Lighting: even, the real Sun now (night side
  with NASA Black Marble city lights and a faint warm terminator), or night everywhere.
- Point layers draw without a depth test, culled at the horizon. Fires: a white-hot flash,
  orange and red embers, a dark burn scar that stays (stories); live fires by age (48 h).
  Stations: a coloured disc with a dark ring.
- Wind: white lines on a 2D canvas over the globe, more opaque for stronger wind (as Windy).

## Imagery and credits

Real NASA footage and imagery only; the NASA insignia are never used. Every source is listed in
the Sources dialog on the home page, which also says the site was made with Claude.
