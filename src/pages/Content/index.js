import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

document.getElementById('plex').style.background = 'red';

function xml2json(xml) {
  try {
    var obj = {};
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i);
        var nodeName = item.nodeName;

        if (typeof obj[nodeName] == 'undefined') {
          obj[nodeName] = xml2json(item);
        } else {
          if (typeof obj[nodeName].push == 'undefined') {
            var old = obj[nodeName];

            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
    console.log(e.message);
  }
}

const getUrl = async (url) => {
  const result = await fetch(url);
  const text = await result.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const devices = doc.querySelectorAll('Device');
  const output = Array.from(devices).map((device) => {
    const token = device.getAttribute('accessToken');
    const connection = device.querySelector('Connection');
    const serverUrl = connection?.getAttribute('uri');
    return { token, serverUrl };
  });

  const server = output.find((o) => o.token === plexToken);
  console.log(server, 'subseek SERVER URL');
  return server;
};

const plexToken = localStorage['myPlexAccessToken'];
getUrl(
  `https://plex.tv/pms/resources?includeHttps=1&X-Plex-Token=${plexToken}`
);
