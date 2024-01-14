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
      <div className="flex between">
        <p className="subtitle-item--timestamp">
          {formatTimestamp(subtitle.startTime)}
        </p>
        <button
          onClick={() => {
            seekTo(subtitle.startSeconds);
          }}
        >
          Seek to scene
        </button>
      </div>
      <p className="subtitle-item--text">{subtitle.text}</p>
    </div>
  );
};

export default SubtitleItem;
