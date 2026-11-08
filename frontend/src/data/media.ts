// All media is streamed from NASA servers (images.nasa.gov and GIBS); nothing is bundled.
// NASA media is generally not subject to copyright in the US; the hero carries a credit line.

const VIDEO_BASE = 'https://images-assets.nasa.gov/video';

/** NASA library renditions: small 640px, medium 1280px, large 1920px. */
export type Rendition = 'small' | 'medium' | 'large';
const ORDER: Rendition[] = ['small', 'medium', 'large'];

export function nasaVideo(id: string, rendition: Rendition = 'medium'): string {
  return `${VIDEO_BASE}/${encodeURIComponent(id)}/${encodeURIComponent(id)}~${rendition}.mp4`;
}

export type Box = { s: number; w: number; n: number; e: number };

/** A NASA GIBS map for a lat/lon box (CORS-enabled WMS, EPSG:4326, axis order lat,lon). */
export function gibsBox(layer: string, box: Box, width: number, height: number, format: 'image/jpeg' | 'image/png'): string {
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.3.0',
    LAYERS: layer,
    STYLES: '',
    CRS: 'EPSG:4326',
    BBOX: [box.s, box.w, box.n, box.e].map((v) => v.toFixed(4)).join(','),
    WIDTH: String(Math.round(width)),
    HEIGHT: String(Math.round(height)),
    FORMAT: format,
    TRANSPARENT: format === 'image/png' ? 'TRUE' : 'FALSE',
  });
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params}`;
}

/** The whole Earth as one equirectangular map. */
export function gibsGlobal(layer: string, width: number, format: 'image/jpeg' | 'image/png' = 'image/jpeg'): string {
  return gibsBox(layer, { s: -90, w: -180, n: 90, e: 180 }, width, width / 2, format);
}

/** GIBS renders WMS maps on request: 2048px arrives in about 2 s, 4096px in about 8 s,
 * so the globe loads the small map first and swaps in the sharp one when it lands.
 * Closer in, Globe.tsx asks GIBS for the visible box only (Blue Marble, 500 m per pixel). */
export const earthDayMaps = [gibsGlobal('BlueMarble_NextGeneration', 2048), gibsGlobal('BlueMarble_NextGeneration', 4096)];

/** Still shown at once and behind every clip: the Sun rising over the Earth's horizon, ISS, 22 February 2022. */
export const filmPoster = 'https://images-assets.nasa.gov/image/iss066e152099/iss066e152099~large.jpg';

const EARTH_VIEWS = 'jsc2021m000138_4K_Earth_Views_Extended_Cut_for_Earth_Day_ 2021_210422-4KMP4';
const CREW_VIDEOS = 'https://eol.jsc.nasa.gov/BeyondThePhotography/CrewEarthObservationsVideos/videos';

/** Background film. `start` and `end` are seconds into the NASA source; each clip avoids burned-in titles. */
export type Clip = {
  key: string;
  src: (rendition: Rendition) => string;
  start: number;
  end: number;
  /** Playback speed; below 1 stretches a short time-lapse. */
  rate?: number;
};

/** A NASA library clip; `best` caps the rendition for sources that have no 1080p file. */
const library =
  (id: string, best: Rendition = 'large') =>
  (wanted: Rendition) =>
    nasaVideo(id, ORDER[Math.min(ORDER.indexOf(wanted), ORDER.indexOf(best))]);

export const filmClips: Clip[] = [
  // The Sun at the Earth's limb, photographed from the ISS over China, 13 April 2012 (NASA JSC crew Earth observations).
  {
    key: 'sun',
    src: () => `${CREW_VIDEOS}/sunsetchina_iss_20120413/sunsetchina_iss_20120413HD_web.mp4`,
    start: 3.8,
    end: 11.2,
    rate: 0.65,
  },
  // Earth from the ISS, the limb against black space (4K Earth Views, NASA JSC, 2021).
  { key: 'earth', src: library(EARTH_VIEWS), start: 556, end: 568 },
  // PACE observatory integration in the Goddard clean room (titles sit at 24, 40, 80 and 124 s).
  { key: 'assembly', src: library('PACE-Mission-Build-Timelapse'), start: 45, end: 57 },
  // PACE lifts off from Cape Canaveral, 8 February 2024.
  {
    key: 'launch',
    src: library('KSC-20240208-MH-AJN01-0001-SpaceX_PACE_Isolated_Launch_and_Landing_Broll_String-M4428'),
    start: 156,
    end: 168,
  },
  // Night time-lapse from the ISS: city lights and airglow on the limb (NASA GSFC, GOLD mission).
  { key: 'night', src: library('GSFC_20180124_m12825_ISS_Airglow', 'medium'), start: 0.5, end: 22 },
];
