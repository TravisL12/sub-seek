import { PLEX_TV_URL } from '../constants';

export const formatTimestamp = (timestamp) => {
  return /^\d{1,2}:\d{1,2}:\d{1,2}/i.exec(timestamp);
};

export const wait = (num) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, num * 1000);
  });
};

export const fetchData = async ({ url, isJson = true, httpMethod = 'GET' }) => {
  if (isJson) {
    return await (
      await fetch(url, {
        method: httpMethod,
        headers: { accept: 'application/json' },
      })
    ).json();
  }

  return await (await fetch(url, { method: httpMethod })).text();
};

const pingServer = ({ serverUrl, clientIdentifier, token }) => {
  const url = `${serverUrl}/connections?X-Plex-Client-Identifier=${clientIdentifier}&X-Plex-Token=${token}`;
  return fetch(url).then(() => {
    return serverUrl;
  });
};

export const getServerUrl = async (server, clientIdentifier) => {
  const connectionHealth = server.connections.map((connection) => {
    if (!connection?.uri) {
      return null;
    }
    return pingServer({
      serverUrl: connection.uri,
      token: server.token,
      clientIdentifier,
    });
  });

  const serverUrl = await Promise.race(connectionHealth.filter((x) => x));
  return serverUrl;
};

export const getServers = async (clientIdentifier) => {
  const plexToken = localStorage['myPlexAccessToken'];
  const url = `${PLEX_TV_URL}&X-Plex-Token=${plexToken}&X-Plex-Client-Identifier=${clientIdentifier}`;
  const result = await fetch(url, { headers: { accept: 'application/json' } }); // calling to PLEX_TV_URL doesn't accept JSON
  const devices = await result.json();

  return devices.map((device) => ({
    token: device.accessToken,
    remoteClientIdentifier: device.clientIdentifier,
    connections: device.connections || [],
  }));
};
