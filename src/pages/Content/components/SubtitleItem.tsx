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
  return (
    <div
      ref={subtitle.ref}
      className={`subtitle-item ${isSelected ? 'selected' : ''}`}
    >
      <p className="subtitle-item--timestamp">
        {formatTimestamp(subtitle.startTime)}
      </p>
      <p className="subtitle-item--text">{subtitle.text}</p>
      <button
        onClick={() => {
          seekTo(subtitle.startSeconds);
        }}
      >
        Seek to scene
      </button>
    </div>
  );
};

export default SubtitleItem;
