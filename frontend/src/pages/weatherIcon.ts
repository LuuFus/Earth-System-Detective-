import type { IconName } from '../components/studio/Icon';

/** WMO weather code (Open-Meteo) to an icon; clear skies show the moon at night. */
export function weatherIcon(code: number, day = true): IconName {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 51) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloud';
  if (code === 1 || code === 2) return day ? 'partly' : 'cloud';
  return day ? 'sun' : 'moon';
}
