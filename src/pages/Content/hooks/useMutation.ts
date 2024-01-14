import { useEffect, useState } from 'react';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import SubSeek from '../modules/SubSeek';
import { TAuth, TSubseek } from '../components/types';

export const useMutation = (auth?: TAuth) => {
  const [seek, setSeek] = useState<TSubseek>();

  useEffect(() => {
    if (!auth || !!seek) {
      return;
    }

    const subseek: TSubseek = new SubSeek(auth);

    const mutationObserver = new MutationObserver((mutationList) => {
      const all: any[] = mutationList
        .map((listItem) => Array.from(listItem.addedNodes))
        .flat();

      const vidContainer = all.find((el) => {
        return el?.querySelector && el.querySelector(VIDEO_PLAYER_SELECTOR);
      });

      if (vidContainer) {
        subseek.videoEl = vidContainer.querySelector(VIDEO_PLAYER_SELECTOR);
        setSeek(subseek);
      }
    });

    // @ts-ignore
    mutationObserver.observe(document.getElementById('plex'), {
      subtree: true,
      childList: true,
    });
  }, [auth]);

  return { seek };
};
