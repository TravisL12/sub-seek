import { useEffect } from 'react';
import { TSubseek } from '../components/types';

export const useEventSource = (subseek: TSubseek) => {
  const activityEvent = (event: any) => {
    console.log(`subseek activity event:`, JSON.parse(event.data));
  };

  const playingEvent = (event: any) => {
    console.log(`subseek playing event:`, JSON.parse(event.data));
  };

  useEffect(() => {
    subseek.getSessions();
    const eventSource: EventSource = subseek.getEvents();
    eventSource.addEventListener('activity', activityEvent);
    eventSource.addEventListener('playing', playingEvent);
  }, [subseek]);
};
