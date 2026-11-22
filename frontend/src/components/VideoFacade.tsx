import { useState } from 'react';
import { Icon } from './studio/Icon';

type Props = { id: string; title: string; channel: string; playLabel: string; note: string; poster?: string };

/**
 * A YouTube video that loads nothing from YouTube until it is asked to play; then the player
 * comes from youtube-nocookie.com, which sets no cookies before playback.
 */
export function VideoFacade({ id, title, channel, playLabel, note, poster }: Props) {
  const [on, setOn] = useState(false);
  return (
    <figure className="video">
      {on ? (
        <iframe
          className="video__frame"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="video__facade"
          style={poster ? { ['--poster' as string]: `url("${poster}")` } : undefined}
          onClick={() => setOn(true)}
          aria-label={`${playLabel}: ${title}`}
        >
          <span className="video__play" aria-hidden="true">
            <Icon name="play" size={26} />
          </span>
          <span className="video__title">{title}</span>
          <span className="video__channel">{channel}</span>
        </button>
      )}
      <figcaption className="note">
        {note}{' '}
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
          YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}
