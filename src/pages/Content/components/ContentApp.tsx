import React, { useEffect, useState } from 'react';

import SubtitleItem from './SubtitleItem';
import { TSubseek, TSubtitle } from './types';

const ContentApp = ({ subseek }: { subseek: TSubseek }) => {
  const [subtitles, setSubtitles] = useState<TSubtitle[]>();
  const [filterSubs, setFiltersubs] = useState<TSubtitle[]>();
  const [searchValue, setSearchValue] = useState('');
  const [selectedSub, setSelectedSub] = useState<TSubtitle>();

  useEffect(() => {
    if (!searchValue && selectedSub?.ref?.current) {
      selectedSub.ref.current.scrollIntoView({
        behavior: 'instant',
        block: 'center',
      });
      setTimeout(() => {
        setSelectedSub(undefined);
      }, 3 * 1000);
    }
  }, [searchValue]);

  useEffect(() => {
    const getSubs = async () => {
      const subs = await subseek.getSubtitles();
      const subsWithRef = subs.map((sub) => ({
        ...sub,
        ref: React.createRef(),
      }));
      setSubtitles(subsWithRef);
      setFiltersubs(subsWithRef);
    };
    getSubs();
  }, [subseek]);

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

  const seekTo = (time: number, sub: TSubtitle) => {
    if (!subseek?.videoEl) {
      return;
    }

    subseek.videoEl.currentTime = time;
    subseek.videoEl.play();
    // @ts-ignore
    // document.querySelector('button[aria-label="Expand Player"]').click();
    setSelectedSub(sub);
    sub?.ref?.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="Content-App">
      <div className="media-title">
        <h1>SubSeek</h1>
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

export default ContentApp;
