import { PLEX_TV_URL } from '../constants';

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

export const fetchData = async (url) => {
  const resp = await fetch(url);
  const text = await resp.text();
  const output = parseXml(text);
  return output;
};

export const getUrl = async (plexToken) => {
  const url = `${PLEX_TV_URL}&X-Plex-Token=${plexToken}`;
  const result = await fetch(url);
  const text = await result.text();
  const {
    MediaContainer: { children: devices },
  } = parseXml(text);

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
