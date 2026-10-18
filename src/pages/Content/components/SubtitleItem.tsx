import React from 'react';
import { escapeRegExp, formatTimestamp } from '../modules/helpers';
import { TSubtitle } from './types';

// Wraps each case-insensitive match of `query` in <mark>
const highlightMatches = (text: string, query: string) => {
  if (!query) {
    return text;
  }

  // Splitting on a capture group puts the matches at the odd indices
  return text
    .split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
    .map((part, idx) => (idx % 2 ? <mark key={idx}>{part}</mark> : part));
};

const SubtitleItem = ({
  subtitle,
  query,
  isCurrent,
  isCursor,
  onSeek,
}: {
  subtitle: TSubtitle;
  query: string;
  isCurrent: boolean;
  isCursor: boolean;
  onSeek: () => void;
}) => {
  return (
    <div
      ref={subtitle.ref}
      className={`subtitle-item ${isCurrent ? 'current' : ''} ${
        isCursor ? 'cursor' : ''
      }`}
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
      <p className="subtitle-item--text">
        {highlightMatches(subtitle.text, query)}
      </p>
    </div>
  );
};

export default SubtitleItem;
