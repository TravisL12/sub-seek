import React from 'react';
import { formatTimestamp } from '../modules/helpers';
import { TSubtitle } from './types';

const SubtitleItem = ({
  subtitle,
  isSelected,
  seekTo,
}: {
  subtitle: TSubtitle;
  isSelected: boolean;
  seekTo: (time: number) => void;
}) => {
  const onSeek = () => {
    seekTo(subtitle.startSeconds);
  };

  return (
    <div
      ref={subtitle.ref}
      className={`subtitle-item ${isSelected ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      title="Seek to scene"
      onClick={onSeek}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSeek();
        }
      }}
    >
      <p className="subtitle-item--timestamp">
        {formatTimestamp(subtitle.startTime)}
      </p>
      <p className="subtitle-item--text">{subtitle.text}</p>
    </div>
  );
};

export default SubtitleItem;
