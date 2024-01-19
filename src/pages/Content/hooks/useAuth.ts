import { useEffect, useState } from 'react';
import { getServers, getServerUrl } from '../modules/helpers';
import { TAuth, TServerDevice } from '../components/types';

/*
1. Fetch server (getServers) with local token
2. Check the server clientIdentifier for what is in the URL hash
3. Ping each connection in a matched server to see what is fastest
4. Set the auth with the URI and token from that server
*/

export const useAuth = () => {
  const [servers, setServers] = useState<TServerDevice[]>();
  const [auth, setAuth] = useState<TAuth>();
  const clientIdentifier = localStorage['clientID'];

  useEffect(() => {
    const popCb = () => {
      getAuth(servers);
    };
    window.addEventListener('hashchange', popCb);
    return () => {
      window.removeEventListener('hashchange', popCb);
    };
  }, [servers]);

  const getAuth = async (serverDevices: any) => {
    const currentServer = serverDevices.find((device: any) => {
      return location.hash.includes(device.remoteClientIdentifier);
    });

    if (currentServer) {
      const { token } = currentServer;
      const serverUrl = await getServerUrl(currentServer, clientIdentifier);
      console.log('---- Subseek AUTH ----', {
        token,
        serverUrl,
        clientIdentifier,
      });
      setAuth({ token, serverUrl, clientIdentifier });
    }
  };

  useEffect(() => {
    const fetchServers = async () => {
      const serverDevices = await getServers(clientIdentifier);
      setServers(serverDevices);
      getAuth(serverDevices);
    };
    fetchServers();
  }, []);

  return { auth };
};
