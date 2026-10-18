import React, { useEffect, useRef, useState } from 'react';
import { SEEK_LEAD_IN_SECONDS, SUBTITLE_INDICES } from '../constants';
import { useEventSource } from '../hooks/useEventSource';
import { useToggleSidebar } from '../hooks/useToggleSidebar';
import { usePlexButton } from '../hooks/usePlexButton';
import { usePlaybackSub } from '../hooks/usePlaybackSub';
import { setLocalChrome } from '../modules/storageHelpers';
import SubseekLogo from '../../../assets/img/SubSeekLogo.png';

import SubtitleItem from './SubtitleItem';
import {
  TPlaySessionState,
  TSubseek,
  TSubtitle,
  TSubtitleResult,
} from './types';

const normalizeWords = (value: string) =>
  value
    .replace(/\.srt$/i, '')
    .split(/[\s._\-()[\]]+/)
    .filter(Boolean);

// Builds a short picker label like "English · SDH · BluRay x264 SPARKS". Result titles
// are release file names, so the movie title and year are dropped from the front to
// leave the part that tells the options apart
const formatSubtitleResult = (
  result: TSubtitleResult,
  mediaTitle: string,
  showProvider: boolean
) => {
  const fileName = result.title || result.displayTitle || '';
  const titleWords = normalizeWords(mediaTitle.toLowerCase());
  const words = normalizeWords(fileName);
  let start = 0;
  while (
    start < words.length &&
    (words[start].toLowerCase() === titleWords[start] ||
      /^(19|20)\d\d$/.test(words[start]))
  ) {
    start++;
  }

  return [
    result.language || result.languageCode?.toUpperCase(),
    result.hearingImpaired && 'SDH',
    result.forced && 'Forced',
    showProvider && result.providerTitle,
    words.slice(start).join(' '),
  ]
    .filter(Boolean)
    .join(' · ');
};

const CurrentIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="5" />
    <circle cx="8" cy="8" r="1.5" className="filled" />
    <path d="M8 0v3M8 13v3M0 8h3M13 8h3" />
  </svg>
);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const SubtitleSearch = ({ subseek }: { subseek: TSubseek }) => {
  const [searchValue, setSearchValue] = useState('');
  const [subtitles, setSubtitles] = useState<TSubtitle[]>();
  const [filterSubs, setFiltersubs] = useState<TSubtitle[]>();
  const [nowPlaying, setNowPlaying] = useState<TPlaySessionState>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [subtitleResults, setSubtitleResults] =
    useState<TSubseek['subtitleResults']>();
  // Row highlighted by arrow-key navigation from the search box
  const [cursorId, setCursorId] = useState<string>();
  // Whether the list auto-scrolls with playback. Scrolling by hand turns it off
  const [isFollowing, setIsFollowing] = useState(true);
  // Bumped to force a scroll to the current line even when nothing else changed
  const [scrollRequest, setScrollRequest] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { currentSubId, pinSub } = usePlaybackSub(subseek.videoEl, subtitles);

  const { closeSubSeek, openSubSeek, isClosed } = useToggleSidebar({
    setSelectedSub: setCursorId,
  });

  usePlexButton({ isClosed, openSubSeek, closeSubSeek });

  useEffect(() => {
    if (subseek?.currentMedia) {
      setIsLoading(false);
      resetSearch();
    }
  }, [subseek?.currentMedia]);

  const getSubtitles = async (isNewChoice?: boolean) => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const subs = await subseek.getSubtitles(
        nowPlaying!.ratingKey,
        isNewChoice
      );
      if (!subs) {
        return;
      }
      const subsWithRef = subs.map((sub) => ({
        ...sub,
        text: sub.text.replace(/<\/?\S>/gi, ''),
        ref: React.createRef<HTMLDivElement>(),
      }));
      setSubtitleResults(subseek.subtitleResults);
      setSubtitles(subsWithRef);
      setFiltersubs(subsWithRef);
    } catch (err) {
      console.log('subseek subtitle load error', err);
      setLoadError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!nowPlaying?.ratingKey) {
      return;
    }
    getSubtitles();
  }, [nowPlaying?.ratingKey]);

  // Pausing keeps the sidebar open so lines can be looked up mid-scene
  useEffect(() => {
    if (nowPlaying?.state === 'stopped' || !subseek.videoEl) {
      closeSubSeek();
    }
  }, [nowPlaying?.state, subseek?.videoEl]);

  useEffect(() => {
    if (!isClosed) {
      goToCurrent();
    }
  }, [isClosed]);

  // Runs after the list renders, so the current row's ref is attached
  useEffect(() => {
    if (!isFollowing || searchValue || isClosed) {
      return;
    }
    const currentSub = subtitles?.find(({ id }) => id === currentSubId);
    scrollToSub(currentSub, 'center');
  }, [currentSubId, isFollowing, searchValue, isClosed, scrollRequest]);

  // "/" focuses the search box, like most sites with search
  useEffect(() => {
    if (isClosed) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isClosed]);

  const playingEvent = (event: MessageEvent) => {
    try {
      const playing: TPlaySessionState = JSON.parse(event.data)
        ?.PlaySessionStateNotification;
      const isClient =
        playing.clientIdentifier === subseek.auth.clientIdentifier;

      if (isClient) {
        setNowPlaying(playing);
      }
    } catch (err) {
      console.log('subseek play event error', err);
    }
  };

  useEventSource(subseek, { playing: playingEvent });

  const filterSubtitles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const subs = subtitles?.filter((sub) => {
      return sub.text.toLowerCase().includes(value.toLowerCase());
    });
    setSearchValue(value);
    setFiltersubs(subs);
    setCursorId(undefined);
    if (!value) {
      setIsFollowing(true);
    }
  };

  const resetSearch = () => {
    setSearchValue('');
    setFiltersubs(subtitles);
    setCursorId(undefined);
    setIsFollowing(true);
  };

  const scrollToSub = (
    subtitle: TSubtitle | undefined,
    block: ScrollLogicalPosition
  ) => {
    subtitle?.ref?.current?.scrollIntoView({ behavior: 'smooth', block });
  };

  const goToCurrent = () => {
    if (searchValue) {
      resetSearch();
    }
    setCursorId(undefined);
    setIsFollowing(true);
    setScrollRequest((count) => count + 1);
  };

  const seekTo = (sub: TSubtitle) => {
    if (!subseek?.videoEl) {
      return;
    }

    subseek.videoEl.currentTime = Math.max(
      0,
      sub.startSeconds - SEEK_LEAD_IN_SECONDS
    );
    subseek.videoEl.play();
    pinSub(sub);
    setCursorId(sub.id);
    setIsFollowing(true);
  };

  const stopFollowing = () => {
    if (isFollowing) {
      setIsFollowing(false);
    }
  };

  const moveCursor = (step: number) => {
    if (!filterSubs?.length) {
      return;
    }
    const cursorIdx = filterSubs.findIndex(({ id }) => id === cursorId);
    // Without a cursor, start from the current line when browsing the full list
    const fromIdx =
      cursorIdx >= 0
        ? cursorIdx
        : searchValue
        ? -1
        : filterSubs.findIndex(({ id }) => id === currentSubId);
    const nextIdx = Math.min(
      filterSubs.length - 1,
      Math.max(0, fromIdx + step)
    );
    const nextSub = filterSubs[nextIdx];
    setCursorId(nextSub.id);
    stopFollowing();
    scrollToSub(nextSub, 'nearest');
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveCursor(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      const sub =
        filterSubs?.find(({ id }) => id === cursorId) ??
        (searchValue ? filterSubs?.[0] : undefined);
      if (sub) {
        seekTo(sub);
      }
    } else if (event.key === 'Escape') {
      if (searchValue) {
        goToCurrent();
      } else {
        searchInputRef.current?.blur();
      }
    }
  };

  // Keeps typing in the sidebar from reaching Plex's keyboard shortcuts
  const stopKeyPropagation = (event: React.KeyboardEvent) => {
    event.stopPropagation();
  };

  const title = subseek?.currentMedia?.title || 'SubSeek';
  const results = nowPlaying && subtitleResults?.[nowPlaying.ratingKey];
  const selectedResultIdx = nowPlaying
    ? +(subseek.subtitleResultIndices[nowPlaying.ratingKey] ?? 0)
    : 0;
  const showProvider =
    new Set(results?.map(({ providerTitle }) => providerTitle)).size > 1;
  const matchCount = filterSubs?.length ?? 0;

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="list-state">
          <div className="spinner" />
          <p>Loading subtitles…</p>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="list-state">
          <p>Couldn't load subtitles for this title.</p>
          <button className="ghost-btn" onClick={() => getSubtitles()}>
            Try again
          </button>
        </div>
      );
    }
    if (!subtitles?.length) {
      return (
        <div className="list-state">
          <p>No subtitle lines found for this title.</p>
        </div>
      );
    }
    if (!matchCount) {
      return (
        <div className="list-state">
          <p>No lines match “{searchValue}”.</p>
        </div>
      );
    }

    return filterSubs?.map((sub) => (
      <SubtitleItem
        key={sub.id}
        subtitle={sub}
        query={searchValue}
        isCurrent={currentSubId === sub.id}
        isCursor={cursorId === sub.id}
        onSeek={() => seekTo(sub)}
      />
    ));
  };

  const render = () => (
    <div
      className={`Content-App ${isClosed ? 'sub-seek-closed' : ''}`}
      onKeyDown={stopKeyPropagation}
      onKeyUp={stopKeyPropagation}
      onKeyPress={stopKeyPropagation}
    >
      <div className="media-title">
        <div className="title">
          <div className="flex">
            <div style={{ height: '100px' }}>
              {subseek?.currentMedia?.thumb && (
                <img
                  src={`${subseek?.api.buildRequest(
                    subseek?.currentMedia?.thumb
                  )}`}
                />
              )}
            </div>
            <div className="flex column" style={{ marginLeft: '20px' }}>
              <p className="title--text" title={title}>
                {title}
              </p>
              <div>
                <button className="ghost-btn" onClick={goToCurrent}>
                  Go to current
                </button>
              </div>
            </div>
          </div>
          <div className="title--buttons">
            <button
              className="icon-btn"
              onClick={closeSubSeek}
              aria-label="Close SubSeek"
              title="Close"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex between" style={{ gap: '20px' }}>
          <div className="search--input">
            <div className="field-label">
              <label htmlFor="subseek-search">Search</label>
              {!!searchValue && (
                <span className="match-count">
                  {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                </span>
              )}
            </div>
            <div className="input-wrap">
              <input
                id="subseek-search"
                ref={searchInputRef}
                placeholder="Search subtitles   ( / )"
                type="text"
                value={searchValue}
                onChange={filterSubtitles}
                onKeyDown={onSearchKeyDown}
                disabled={isLoading}
                autoComplete="off"
              />
              {!!searchValue && (
                <button
                  className="clear-btn"
                  onClick={goToCurrent}
                  aria-label="Clear search"
                  title="Clear (Esc)"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="search--select">
            {nowPlaying && results && (
              <>
                <div className="field-label">
                  <label htmlFor="subseek-subtitle">Subtitle</label>
                </div>
                <select
                  id="subseek-subtitle"
                  disabled={isLoading}
                  value={selectedResultIdx}
                  title={
                    results[selectedResultIdx]?.title ||
                    results[selectedResultIdx]?.displayTitle
                  }
                  onChange={(event) => {
                    subseek.subtitleResultIndices[nowPlaying.ratingKey] =
                      +event.target.value;
                    setLocalChrome({
                      [SUBTITLE_INDICES]: subseek.subtitleResultIndices,
                    });
                    getSubtitles(true);
                  }}
                >
                  {results.map((result, idx) => (
                    <option
                      key={idx}
                      value={idx}
                      title={result.title || result.displayTitle}
                    >
                      {formatSubtitleResult(result, title, showProvider)}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="subtitle-list">
        <div
          className="subtitle-container"
          onWheel={stopFollowing}
          onTouchMove={stopFollowing}
          onMouseDown={(event) => {
            // A press on the container itself (not a row) is a scrollbar drag
            if (event.target === event.currentTarget) {
              stopFollowing();
            }
          }}
        >
          {renderList()}
        </div>
        {!isFollowing && !searchValue && !isLoading && !!subtitles?.length && (
          <button className="jump-to-now" onClick={goToCurrent}>
            <CurrentIcon />
            Jump to now
          </button>
        )}
      </div>
      <div className="footer">
        <img src={chrome.runtime.getURL(SubseekLogo)} alt="SubSeek" />
      </div>
    </div>
  );

  return subseek?.videoEl ? render() : null;
};

export default SubtitleSearch;
