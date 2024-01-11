export const getUrl = async (plexToken: string) => {
  const url = `https://plex.tv/pms/resources?includeHttps=1&X-Plex-Token=${plexToken}`;
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
