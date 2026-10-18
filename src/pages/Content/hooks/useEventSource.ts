import { useEffect } from 'react';
import { TSubseek } from '../components/types';

export const useEventSource = (
  subseek: TSubseek,
  eventCallbacks: { playing: (event: MessageEvent) => void }
) => {
  useEffect(() => {
    const eventSource: EventSource = subseek.getEvents();
    eventSource.addEventListener('playing', eventCallbacks.playing);
  }, [subseek]);
};
