import { useEffect, useState } from 'react';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import SubSeek from '../modules/SubSeek';
import { TAppOptions, TAuth, TSubseek } from '../components/types';

const getNodes = (
  mutationList: MutationRecord[],
  key: 'addedNodes' | 'removedNodes'
) =>
  mutationList.flatMap((record) => Array.from(record[key])) as Element[];

export const useMutation = ({
  auth,
  options,
}: {
  auth?: TAuth;
  options: TAppOptions;
}) => {
  const [seek, setSeek] = useState<TSubseek>();

  useEffect(() => {
    if (!auth || !!seek) {
      return;
    }

    const subseek: TSubseek = new SubSeek(auth, options);

    const addVideoElement = (mutationList: MutationRecord[]) => {
      const vidContainer = getNodes(mutationList, 'addedNodes').find((el) => {
        return el?.querySelector && el.querySelector(VIDEO_PLAYER_SELECTOR);
      });

      if (vidContainer) {
        subseek.videoEl =
          vidContainer.querySelector<HTMLVideoElement>(VIDEO_PLAYER_SELECTOR) ??
          undefined;
        setSeek(subseek);
      }
    };

    const removeVideoElement = (mutationList: MutationRecord[]) => {
      const vidContainer = getNodes(mutationList, 'removedNodes').find((el) => {
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

    mutationObserver.observe(document.getElementById('plex')!, {
      subtree: true,
      childList: true,
    });
  }, [auth]);

  return { seek };
};
