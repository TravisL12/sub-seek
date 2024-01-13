import React from 'react';
import { TSubtitle } from './types';

const formatTimestamp = (timestamp: string) => {
  return /^\d{1,2}:\d{1,2}:\d{1,2}/i.exec(timestamp);
};

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
    <div className={`subtitle-item ${isSelected ? 'selected' : ''}`}>
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
