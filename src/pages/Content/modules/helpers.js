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

export const parseXml = (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parse = (xml) => {
    const acc = {};
    if (!acc[xml.nodeName]) {
      acc[xml.nodeName] = {};
    }

    const attributes = xml.getAttributeNames();
    if (attributes) {
      Array.from(attributes).forEach((attrName) => {
        acc[xml.nodeName][attrName] = xml.getAttribute(attrName);
      });
    }

    const children = xml.children || [];
    if (children.length > 0) {
      acc[xml.nodeName].children = Array.from(children).map((child) => {
        return parse(child);
      });
    }

    return acc;
  };

  const output = parse(doc.documentElement);

  return output;
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

const pingServer = async ({ serverUrl, clientIdentifier, token }) => {
  const url = `${serverUrl}/connections?X-Plex-Client-Identifier=${clientIdentifier}&X-Plex-Token=${token}`;
  const resp = await fetch(url);
  const text = await resp.text();
  const result = parseXml(text);
  return !!result;
};

export const getDevice = async () => {
  const plexToken = localStorage['myPlexAccessToken'];
  const clientIdentifier = localStorage['clientID'];
  const url = `${PLEX_TV_URL}&X-Plex-Token=${plexToken}&X-Plex-Client-Identifier=${clientIdentifier}`;
  const result = await fetch(url, { headers: { accept: 'application/json' } }); // calling to PLEX_TV_URL doesn't accept JSON
  const devices = await result.json();

  const connections = devices
    .map((device) => {
      const token = device.accessToken;
      const isMatchedToken = plexToken === token;
      return isMatchedToken || !device.connections ? device.connections : [];
    })
    .flat()
    .reverse(); // reverse to do the external IPs first

  let server;
  for (let i = 0; i < connections.length; i++) {
    try {
      const o = connections[i];
      const s = await pingServer({
        serverUrl: o.uri,
        token: plexToken,
        clientIdentifier,
      });
      if (s) {
        server = o;
        break;
      }
    } catch (err) {
      console.log('subseek server fetch fail', err);
      continue;
    }
  }

  return {
    serverUrl: server.uri,
    token: plexToken,
    clientIdentifier,
  };
};
