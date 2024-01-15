import { useEffect, useState } from 'react';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import SubSeek from '../modules/SubSeek';
import { TAuth, TSubseek } from '../components/types';

export const useMutation = ({
  auth,
  options,
}: {
  auth?: TAuth;
  options: any;
}) => {
  const [seek, setSeek] = useState<TSubseek>();

  useEffect(() => {
    if (!auth || !!seek) {
      return;
    }

    const subseek: TSubseek = new SubSeek(auth, options);

    const addVideoElement = (mutationList: any) => {
      const allAdded: any[] = mutationList
        .map((listItem: any) => Array.from(listItem.addedNodes))
        .flat();

      const vidContainer = allAdded.find((el) => {
        return el?.querySelector && el.querySelector(VIDEO_PLAYER_SELECTOR);
      });

      if (vidContainer) {
        subseek.videoEl = vidContainer.querySelector(VIDEO_PLAYER_SELECTOR);
        setSeek(subseek);
      }
    };

    const removeVideoElement = (mutationList: any) => {
      const allRemoved: any[] = mutationList
        .map((listItem: any) => Array.from(listItem.removedNodes))
        .flat();

      const vidContainer = allRemoved.find((el) => {
        return el?.tagName && el.tagName === 'VIDEO';
      });

      if (vidContainer) {
        subseek.videoEl = undefined;
        setSeek(subseek);
      }
    };

    const mutationObserver = new MutationObserver((mutationList) => {
      addVideoElement(mutationList);
      removeVideoElement(mutationList);
    });

    // @ts-ignore
    mutationObserver.observe(document.getElementById('plex'), {
      subtree: true,
      childList: true,
    });
  }, [auth]);

  return { seek };
};
