# Design: Earth System Detective

The locked visual system for the project. Every page follows it.
Source of truth for values: `frontend/src/styles/tokens.css`.

**Revision 2026-11-08 (space navy).** The team moved from the original sand and
olive editorial palette to a dark space palette, and cut the site down to two
screens. The type voice and the split-chip buttons from the original style
reference stay; colour, layout and imagery below replace it.

## Structure

- **Home (`/`)**: one screen, no scrolling. Full-bleed NASA footage, the headline,
  one sentence, one big button into the globe. Top bar: wordmark left, language
  switch right. A one-line NASA credit and a small pause button at the bottom.
- **3D Earth (`/explore`)**: the globe fills the screen. Floating on top: back
  chip, country search (centre), language switch, and a collapsible "Layers"
  glass panel bottom left (open on desktop, collapsed on phones). Every layer
  starts off, so the first view is just the planet. No satellites.

## Data layer (GISTEMP)

- Diverging ramp, equal steps per arm, light neutral midpoint:
  `#2457b3 #3f7fd0 #94bde8 #ece9e2 #f2a582 #dd5a3c #b3261e` (cold to warm).
  The dark ends are lifted so cold cells stay visible over dark ocean.
- Saturates at plus or minus 4 °C (year, compare) and 0.8 °C per decade (trend);
  the end ticks read "≤" and "≥".
- Non-significant trends (Mann-Kendall p ≥ 0.05) are hatched at 135° in their own
  hue, never hidden. The legend shows the same hatch.
- Cells are drawn square (2°), as NASA draws GISTEMP; no smoothing.
- Country names: Inter, Star, with a soft Void halo; big countries 13px 500,
  the rest 11px.

## Map labels and pins (Natural Earth layers)

- Borders: vector lines from Natural Earth (Ukraine's point of view), a 1.6px
  Star line over a 4px Void halo at 55%; disputed lines 1.2px Star at 55%;
  coastlines 0.9px Star at 45%, hidden very close up where the imagery shows the
  coast better.
- Capitals: a 6px solid Star dot ringed 1.5px in Void, the name to its right in
  Inter 500 11px; when the name collides the dot still shows. Seas: Source Serif italic in Sea label `#b9d8ff`, oceans 14px
  uppercase tracked 0.22em at 85%, big seas 13px, the rest 11px. Rivers: 1.3px
  lines in River `#6fb8ff` at 80% with Source Serif italic names in `#9fd0ff`.
- Labels are ranked (markers and pins, oceans, big countries, big capitals,
  seas, countries, capitals, rivers); one that would overlap a higher one tries
  just below or above its place, otherwise it is hidden.
- Anomaly hints are map pins (by the team's request): Pin `#e5483b` with a
  `#a8291f` edge, a `#dde2ea` eye and a grey ground shadow; the tip sits on the
  place. Countries picked as A or B are outlined in their series colour, 2.4px.

## Colour

| Name | Value | Role |
|---|---|---|
| Void | `#03060f` | Page and space background, scrims and vignettes |
| Navy | `#081229` | Button text on light chips, glass tint |
| Navy 2 | `#0f1d40` | Raised surfaces |
| Navy 3 | `#18295a` | Colour grade multiplied over footage |
| Star | `#eef2fb` | Headline, button chips, active language |
| Star deep | `#d3dcf0` | Lede |
| Haze | `#a9b8da` | Secondary text |
| Sunrise | `#f3bd6e` | The one warm accent: button hover, focus ring |
| Atmosphere | `#7fb0ff` | Globe rim and atmosphere (WebGL only) |

Rules: navy and void carry every surface; Star is the only text colour; Sunrise
appears only on interaction (hover, focus), never as a fill at rest. No
purple-to-blue or cyan gradients; scrims are single-hue void.

## Type

- **Display**: Source Serif 4 Variable (stands in for PP Fragment, which has no
  Cyrillic and is commercial), weight 300, uppercase, line-height 1.0, tracking
  -0.02em, `clamp(44px, 7.4vw, 128px)`, centred, with a soft void text-shadow
  for legibility over footage.
- **Lede**: the same serif, 300, 18 to 22px, line-height 1.4.
- **Labels and buttons**: Inter 500, 14 to 15px, uppercase, tracking 0.02 to
  0.04em.
- **Credit**: Inter 400, 12px, Star at 74%.

## Components

- **Split button** (big CTA): a 56px Star label chip and a separate 56px square
  arrow chip, 4px apart, 2px radius, navy text. Hover turns both Sunrise.
- **Language switch**: a bordered glass group (1px Star at 42%, navy glass,
  12px blur) with a globe icon and two 32px buttons; the active one is filled
  Star with navy text.
- **Glass chips** (back, pause): 44px, same border and glass as the switch.
- **Film**: clips crossfade over 1.4s under a Navy 3 multiply grade, a dark
  radial centre and top and bottom void fades. A NASA still of the Sun rising
  over the horizon shows instantly and whenever a clip is still buffering.

## Imagery

Real NASA footage only, streamed from NASA servers: the Sun at the Earth's limb
(ISS crew Earth observations), Earth from the ISS (4K Earth Views), PACE
assembly time-lapse, PACE launch, the ISS night time-lapse with city lights and
airglow. NASA insignia (the "meatball" and the "worm") are never used; the credit
line says the site is not an official NASA website.

## Do and don't

- Do keep the home page to one screen; anything more goes into `/explore`.
- Do keep 2px radii on chips, no rounded pills, no drop shadows on boxes.
- Don't add captions or scene names over the film.
- Don't use pure black or pure white; use Void and Star.
