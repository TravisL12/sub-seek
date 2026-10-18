import { useEffect, useRef, useState } from 'react';
import { TSubtitle } from '../components/types';
import { SEEK_LEAD_IN_SECONDS } from '../constants';

// Last line that has started by `time`. Subtitles are sorted by start time
const findSubAt = (subtitles: TSubtitle[], time: number) => {
  let low = 0;
  let high = subtitles.length - 1;
  let found: TSubtitle | undefined;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (subtitles[mid].startSeconds <= time) {
      found = subtitles[mid];
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return found;
};

// Tracks the line being spoken as the video plays
export const usePlaybackSub = (
  videoEl: HTMLVideoElement | undefined,
  subtitles: TSubtitle[] | undefined
) => {
  const [currentSubId, setCurrentSubId] = useState<string>();
  // A line the user seeked to. Seeking starts a little early, so keep this line
  // highlighted through the lead-in instead of flashing the previous one
  const pinnedSubRef = useRef<TSubtitle>();

  useEffect(() => {
    if (!videoEl || !subtitles?.length) {
      return;
    }

    const update = () => {
      const time = videoEl.currentTime;
      const pinned = pinnedSubRef.current;
      if (
        pinned &&
        time < pinned.startSeconds &&
        time >= pinned.startSeconds - SEEK_LEAD_IN_SECONDS - 1
      ) {
        setCurrentSubId(pinned.id);
        return;
      }

      pinnedSubRef.current = undefined;
      setCurrentSubId(findSubAt(subtitles, time)?.id);
    };

    update();
    videoEl.addEventListener('timeupdate', update);
    videoEl.addEventListener('seeked', update);
    return () => {
      videoEl.removeEventListener('timeupdate', update);
      videoEl.removeEventListener('seeked', update);
    };
  }, [videoEl, subtitles]);

  const pinSub = (sub: TSubtitle) => {
    pinnedSubRef.current = sub;
    setCurrentSubId(sub.id);
  };

  return { currentSubId, pinSub };
};
