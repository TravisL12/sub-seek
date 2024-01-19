import React, { useEffect, useState } from 'react';
import { SUBTITLE_INDICES } from '../constants';
import { useEventSource } from '../hooks/useEventSource';
import { useToggleSidebar } from '../hooks/useToggleSidebar';
import { setLocalChrome } from '../modules/storageHelpers';
import SubseekLogo from '../../../assets/img/SubSeekLogo.png';

import SubtitleItem from './SubtitleItem';
import { TSubseek, TSubtitle } from './types';

const SubtitleSearch = ({ subseek }: { subseek: TSubseek }) => {
  const [searchValue, setSearchValue] = useState('');
  const [subtitles, setSubtitles] = useState<TSubtitle[]>();
  const [filterSubs, setFiltersubs] = useState<TSubtitle[]>();
  const [selectedSub, setSelectedSub] = useState<TSubtitle>();
  const [playing, setPlaying] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [subtitleResults, setSubtitleResults] =
    useState<TSubseek['subtitleResults']>();

  useEffect(() => {
    if (subseek?.currentMedia) {
      setIsLoading(false);
      resetSearch();
    }
  }, [subseek?.currentMedia]);

  useEffect(() => {
    if (!searchValue && selectedSub?.ref?.current) {
      scrollToSub(selectedSub, 'instant');
      setSelectedSub(undefined);
    }
  }, [searchValue]);

  const getSubtitles = async (isNewChoice?: boolean) => {
    setIsLoading(true);
    const subs = await subseek.getSubtitles(
      playing.ratingKey,
      undefined,
      isNewChoice
    );
    const subsWithRef = subs.map((sub) => ({
      ...sub,
      ref: React.createRef(),
    }));
    setSubtitleResults(subseek.subtitleResults);
    setSubtitles(subsWithRef);
    setFiltersubs(subsWithRef);
  };

  useEffect(() => {
    if (!playing?.ratingKey) {
      return;
    }
    getSubtitles();
  }, [playing?.ratingKey]);

  useEffect(() => {
    if (playing?.state === 'paused' || !subseek.videoEl) {
      closeSubSeek();
    }
  }, [playing?.state, subseek?.videoEl]);

  const { closeSubSeek, isClosed } = useToggleSidebar({
    setSelectedSub,
  });

  useEffect(() => {
    if (!isClosed) {
      selectSubAtCurrentTime();
    }
  }, [isClosed]);

  const playingEvent = (event: any) => {
    try {
      const playing = JSON.parse(event.data)?.PlaySessionStateNotification;
      const isClient =
        playing.clientIdentifier === subseek.auth.clientIdentifier;

      if (isClient) {
        setPlaying(playing);
      }
    } catch (err) {
      console.log('subseek play event error', err);
    }
  };

  useEventSource(subseek, {
    playing: playingEvent,
    activity: (event) => {
      console.log('subseek activity data', JSON.parse(event.data));
    },
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

  const seekTo = (time: number, sub: TSubtitle) => {
    if (!subseek?.videoEl) {
      return;
    }

    subseek.videoEl.currentTime = time;
    subseek.videoEl.play();
    setSelectedSub(sub);
    scrollToSub(sub);
  };

  const render = () => (
    <div className={`Content-App ${isClosed ? 'sub-seek-closed' : ''}`}>
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
              <p
                className="title--text"
                title={subseek?.currentMedia?.title || 'SubSeek'}
              >
                {subseek?.currentMedia?.title || 'SubSeek'}
              </p>
              <div>
                <button onClick={selectSubAtCurrentTime}>Go to Current</button>
              </div>
            </div>
          </div>
          <div className="title--buttons">
            <button onClick={closeSubSeek}>Close</button>
          </div>
        </div>
        <div className="flex flex--between" style={{ gap: '20px' }}>
          <div className="search--input">
            <div style={{ width: '100%' }}>
              <label>Search</label>
              <input
                placeholder="Search subtitles"
                type="text"
                value={searchValue}
                onChange={filterSubtitles}
                disabled={isLoading}
              />
            </div>
            {!!searchValue && (
              <div className="flex align-end">
                <button onClick={resetSearch}>Clear</button>
              </div>
            )}
          </div>
          <div className="search--select">
            {subtitleResults?.[playing.ratingKey] && (
              <div>
                <label>Change Subtitle</label>
                <select
                  disabled={isLoading}
                  value={+subseek.subtitleResultIndices[playing.ratingKey]}
                  onChange={(event) => {
                    subseek.subtitleResultIndices[playing.ratingKey] =
                      +event.target.value;
                    setLocalChrome({
                      [SUBTITLE_INDICES]: subseek.subtitleResultIndices,
                    });
                    getSubtitles(true);
                  }}
                >
                  {subtitleResults[playing.ratingKey].map((result, idx) => {
                    return (
                      <option value={idx}>
                        {result.title || result.displayTitle}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={`subtitle-container ${
          isLoading ? 'justify-center align-center' : ''
        }`}
      >
        {isLoading ? (
          <div className="flex justify-center">
            <h1>Loading</h1>
          </div>
        ) : (
          filterSubs?.map((sub) => (
            <SubtitleItem
              subtitle={sub}
              isSelected={selectedSub?.id === sub.id}
              seekTo={(time: number) => {
                seekTo(time, sub);
              }}
            />
          ))
        )}
      </div>
      <div className="footer">
        <img src={chrome.runtime.getURL(SubseekLogo)} />
      </div>
    </div>
  );

  return subseek?.videoEl ? render() : null;
};

export default SubtitleSearch;
