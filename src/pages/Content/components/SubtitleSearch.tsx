import React, { useEffect, useState } from 'react';
import { useEventSource } from '../hooks/useEventSource';

import SubtitleItem from './SubtitleItem';
import { TSubseek, TSubtitle } from './types';

const SubtitleSearch = ({ subseek }: { subseek: TSubseek }) => {
  const [isClosed, setIsClosed] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [subtitles, setSubtitles] = useState<TSubtitle[]>();
  const [filterSubs, setFiltersubs] = useState<TSubtitle[]>();
  const [selectedSub, setSelectedSub] = useState<TSubtitle>();
  const [playing, setPlaying] = useState<any>();

  useEffect(() => {
    if (!searchValue && selectedSub?.ref?.current) {
      scrollToSub(selectedSub, 'instant');
      setSelectedSub(undefined);
    }
  }, [searchValue]);

  useEffect(() => {
    if (!playing?.key) {
      return;
    }

    const getSubs = async () => {
      const subs = await subseek.getSubtitles(playing.key);
      const subsWithRef = subs.map((sub) => ({
        ...sub,
        ref: React.createRef(),
      }));
      setSubtitles(subsWithRef);
      setFiltersubs(subsWithRef);
    };
    getSubs();
  }, [playing?.key]);

  useEffect(() => {
    if (playing?.state === 'paused') {
      setIsClosed(true);
    }
  }, [playing?.state]);

  const playingEvent = (event: any) => {
    try {
      const playing = JSON.parse(event.data)?.PlaySessionStateNotification;
      const isClient =
        playing.clientIdentifier === subseek.auth.clientIdentifier;

      if (isClient) {
        console.log(`subseek playing event:`, JSON.parse(event.data));
        setPlaying(playing);
      }
    } catch (err) {
      console.log('subseek play event error', err);
    }
  };

  useEventSource(subseek, {
    playing: playingEvent,
  });

  const filterSubtitles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const subs = subtitles?.filter((sub) => {
      return sub.text.toLowerCase().includes(value.toLowerCase());
    });
    setSearchValue(value);
    setFiltersubs(subs);
  };

  const resetSearch = () => {
    setSearchValue('');
    setFiltersubs(subtitles);
  };

  const scrollToSub = (subtitle: TSubtitle, behavior: string = 'smooth') => {
    subtitle.ref?.current.scrollIntoView({
      behavior,
      block: 'center',
    });
  };

  const selectSubAtCurrentTime = () => {
    if (!subseek.videoEl) {
      return;
    }

    const currentTime = subseek.videoEl.currentTime;
    const nearestSub = filterSubs?.find((sub) => {
      return sub.startSeconds > currentTime;
    });

    if (nearestSub) {
      scrollToSub(nearestSub);
      setSelectedSub(nearestSub);
    }
  };

  const openSeekPanel = () => {
    selectSubAtCurrentTime();
    setIsClosed(false);
  };

  const closeSeekPanel = () => {
    setSelectedSub(undefined);
    setIsClosed(true);
  };

  const seekTo = (time: number, sub: TSubtitle) => {
    if (!subseek?.videoEl) {
      return;
    }

    subseek.videoEl.currentTime = time;
    subseek.videoEl.play();
    // @ts-ignore
    // auto expand
    // document.querySelector('button[aria-label="Expand Player"]').click();
    setSelectedSub(sub);
    scrollToSub(sub);
  };

  return (
    <div className={`Content-App ${isClosed ? 'sub-seek-closed' : ''}`}>
      <div className="media-title">
        <div className="title">
          <h1 onClick={openSeekPanel}>SubSeek</h1>
          <button onClick={closeSeekPanel}>Close</button>
        </div>
        <div className="clear-btn">
          <input
            placeholder="Search subtitles"
            type="text"
            value={searchValue}
            onChange={filterSubtitles}
          />
          <button disabled={!searchValue} onClick={resetSearch}>
            Clear
          </button>
        </div>
      </div>
      <div className="subtitle-container">
        {filterSubs?.map((sub) => (
          <SubtitleItem
            subtitle={sub}
            isSelected={selectedSub?.id === sub.id}
            seekTo={(time: number) => {
              seekTo(time, sub);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SubtitleSearch;
