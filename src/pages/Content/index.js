import { ENDPOINTS } from './constants';
import { fetchData, getUrl } from './modules/helpers';

console.log('I am the SubSeek content file');

class SubSeek {
  constructor(token, serverUrl) {
    this.token = token;
    this.serverUrl = serverUrl;
  }

  buildRequest(endpoint) {
    return `${this.serverUrl}${endpoint}?X-Plex-Token=${this.token}`;
  }

  currentlyWatching() {
    const query = location.hash.split('?')[1];
    const params = Object.fromEntries(new URLSearchParams(query));
    console.log(params, 'seek params');
  }

  async getSession() {
    const url = this.buildRequest(ENDPOINTS.session);
    const resp = await fetchData(url);
    console.log(resp, 'seek session object');
  }
}

const start = async () => {
  const plexToken = localStorage['myPlexAccessToken'];
  const { token, serverUrl } = await getUrl(plexToken);
  const seek = new SubSeek(token, serverUrl);
  seek.getSession();
  seek.currentlyWatching();
};

setTimeout(() => {
  console.log('seek START!');
  start();
}, 5 * 1000);
