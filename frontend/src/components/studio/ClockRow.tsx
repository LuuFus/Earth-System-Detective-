// The row under a player's title: play / pause, the speed, a slider over the hours and the time.

import type { useClock } from '../../hooks/useClock';
import { JellySlider } from '../ui/JellySlider';
import { Icon } from './Icon';

type Props = {
  clock: ReturnType<typeof useClock>;
  length: number;
  /** Text of an hour for the slider, its ticks and the time on the right. */
  format: (hours: number) => string;
  formatTick: (hours: number) => string;
  majors: number[];
  /** Under the time on the right (a time zone, "day 3 of 26"). */
  sub?: string;
  disabled?: boolean;
  labels: { play: string; pause: string; speed: string };
  className?: string;
};

export function ClockRow({ clock, length, format, formatTick, majors, sub, disabled, labels, className = 'smoke-player' }: Props) {
  return (
    <div className={`${className}__row`}>
      <button type="button" className="play-btn" aria-label={clock.playing ? labels.pause : labels.play} disabled={disabled} onClick={clock.toggle}>
        <Icon name={clock.playing ? 'pause' : 'play'} />
      </button>
      <button type="button" className="speed-btn" aria-label={`${labels.speed}: ${clock.speed}×`} onClick={clock.nextSpeed}>
        {clock.speed}×
      </button>
      <JellySlider
        className={`${className}__slider`}
        min={0}
        max={length}
        step={1}
        value={Math.round(clock.hours)}
        onChange={clock.seek}
        label={format(clock.hours)}
        format={format}
        formatTick={formatTick}
        majors={majors}
      />
      <div className={`${className}__date`}>
        <strong>{format(clock.hours)}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
