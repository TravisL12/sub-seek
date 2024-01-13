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

export const getUrl = async () => {
  const plexToken = localStorage['myPlexAccessToken'];
  const url = `${PLEX_TV_URL}&X-Plex-Token=${plexToken}`;
  const result = await fetch(url); // calling to PLEX_TV_URL doesn't accept JSON
  const text = await result.text();
  const {
    MediaContainer: { children: devices },
  } = parseXml(text);

  // devices for local and remote sessions can share have the
  // same token. Setup logic to choose the remote session
  // assuming that that session is most likely to work
  const output = devices.map(({ Device }) => {
    const token = Device.accessToken;
    return Device.children
      ? Device.children.map((child) => {
          const serverUrl = child.Connection?.uri;
          return serverUrl ? { token, serverUrl } : null;
        })
      : null;
  });

  const server = output.flat().find((o) => o?.token === plexToken);
  return server;
};
