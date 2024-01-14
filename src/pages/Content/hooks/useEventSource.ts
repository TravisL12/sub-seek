import { useEffect } from 'react';
import { TSubseek } from '../components/types';

export const useEventSource = (
  subseek: TSubseek,
  eventCallbacks: { [key: string]: (event: any) => void }
) => {
  useEffect(() => {
    const eventSource: EventSource = subseek.getEvents();
    eventSource.addEventListener('playing', eventCallbacks.playing);
  }, [subseek]);
};
