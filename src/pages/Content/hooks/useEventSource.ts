import { useEffect } from 'react';
import { TSubseek } from '../components/types';

export const useEventSource = (
  subseek: TSubseek,
  eventCallbacks: { [key: string]: (event: any) => void }
) => {
  useEffect(() => {
    subseek.getSessions();
    const eventSource: EventSource = subseek.getEvents();
    // eventSource.addEventListener('activity', eventCallbacks.activity);
    eventSource.addEventListener('playing', eventCallbacks.playing);
  }, [subseek]);
};
