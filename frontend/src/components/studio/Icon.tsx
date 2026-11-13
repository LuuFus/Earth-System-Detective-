// One line-icon set for the studio: 20 px grid, 1.4 px strokes, no fills.

const PATHS: Record<string, string> = {
  layers: 'M10 3 2.5 7 10 11l7.5-4L10 3Zm-7.5 7L10 14l7.5-4M2.5 13 10 17l7.5-4',
  cases: 'M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm3.6 8.6 4.4 4.4',
  analysis: 'M3 16.5h14M5 13l3.5-4 3 2.5L16 6',
  glossary: 'M4 4.5c2-1 4.3-1 6 .5v11c-1.7-1.5-4-1.5-6-.5v-11Zm12 0c-2-1-4.3-1-6 .5v11c1.7-1.5 4-1.5 6-.5v-11Z',
  share: 'M8 5H5v10h10v-3M11 4h5v5M16 4l-7 7',
  play: 'M6.5 4.5v11l9-5.5-9-5.5Z',
  pause: 'M6.5 4.5h2.5v11H6.5zM11 4.5h2.5v11H11z',
  close: 'm5 5 10 10M15 5 5 15',
  pin: 'M10 17s5-5 5-9a5 5 0 0 0-10 0c0 4 5 9 5 9Zm0-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  info: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-8v5m0-7.5v.5',
  download: 'M10 3.5v9m-4-4 4 4 4-4M4 16h12',
  plus: 'M10 4v12M4 10h12',
  copy: 'M7 7h9v9H7zM4 13V4h9',
  split: 'M10 3v14M3.5 6.5h4v7h-4zM12.5 6.5h4v7h-4z',
  weather: 'M6 12.5h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.4 6.6 3 3 0 0 0 6 12.5Zm4.5 0-2 3h3l-2 3',
  sun: 'M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4',
  partly: 'M7.5 3v1.2M3.6 4.6l.9.9M2.5 8.5h1.2M10.6 5.6A3.2 3.2 0 0 0 4.7 8.8M7.5 16.5h7a3 3 0 0 0 .3-6A4.2 4.2 0 0 0 7 11.2a2.7 2.7 0 0 0 .5 5.3Z',
  cloud: 'M6 15.5h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.4 9.6 3 3 0 0 0 6 15.5Z',
  rain: 'M6 12.5h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.4 6.6 3 3 0 0 0 6 12.5ZM7 14.5l-1 2.5M10.5 14.5l-1 2.5M14 14.5l-1 2.5',
  snow: 'M6 12.5h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.4 6.6 3 3 0 0 0 6 12.5ZM7 15.2v.6M10.5 15.2v.6M14 15.2v.6M8.7 17.6v.6M12.2 17.6v.6',
  fog: 'M4 7.5h12M3 10.5h14M5 13.5h10',
  storm: 'M6 12.5h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.4 6.6 3 3 0 0 0 6 12.5Zm4.5 0-2 3h3l-2 3',
  expand: 'M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4',
  link: 'M8.5 11.5 11.5 8.5M9 6l1.5-1.5a3 3 0 0 1 4.2 4.2L13 10.4M11 14l-1.5 1.5a3 3 0 0 1-4.2-4.2L7 9.6',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
