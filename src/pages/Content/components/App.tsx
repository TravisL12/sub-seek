import React, { useEffect, useState } from 'react';

import { getUrl } from '../modules/helpers';
import SubSeek from '../modules/SubSeek';
import { TAuth, TSubseek } from './types';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import ContentApp from './ContentApp';

const App = () => {
  const [auth, setAuth] = useState<TAuth>();
  const [seek, setSeek] = useState<TSubseek>();

  useEffect(() => {
    const fetchAuth = async () => {
      const { token, serverUrl } = await getUrl();
      setAuth({ token, serverUrl });
    };
    fetchAuth();
  }, []);

  useEffect(() => {
    if (!auth || !!seek) {
      return;
    }

    const mutationObserver = new MutationObserver((mutationList) => {
      const subseek: TSubseek = new SubSeek(auth.token, auth.serverUrl);
      const all: any[] = mutationList
        .map((listItem) => Array.from(listItem.addedNodes))
        .flat();

      const vidContainer = all.find((el) => {
        return el.querySelector(VIDEO_PLAYER_SELECTOR);
      });

      if (vidContainer && subseek && !subseek.videoEl) {
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

  return seek?.videoEl ? <ContentApp subseek={seek} /> : null;
};

export default App;
