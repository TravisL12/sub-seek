import React, { useEffect, useState } from 'react';
import SubtitleItem from './SubtitleItem';
import { TSubseek, TSubtitle } from './types';

const ContentApp = ({ subseek }: { subseek: TSubseek }) => {
  const [subtitles, setSubtitles] = useState<TSubtitle[]>();
  const [filterSubs, setFiltersubs] = useState<TSubtitle[]>();
  const [searchValue, setSearchValue] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>();

  useEffect(() => {
    const getSubs = async () => {
      const subs = await subseek.getSubtitles();
      setSubtitles(subs);
      setFiltersubs(subs);
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
    setSelectedSub(undefined);
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
            isSelected={selectedSub === sub.id}
            seekTo={(time: number) => {
              subseek.videoEl.currentTime = time;
              setSelectedSub(sub.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentApp;
