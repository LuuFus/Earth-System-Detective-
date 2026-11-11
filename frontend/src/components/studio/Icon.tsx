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
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
