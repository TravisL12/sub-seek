import { ENDPOINTS } from './constants';
import { fetchData } from './modules/helpers';

class Api {
  constructor(token, serverUrl) {
    this.token = token;
    this.serverUrl = serverUrl;
  }

  buildRequest(endpoint) {
    return `${this.serverUrl}${endpoint}?X-Plex-Token=${this.token}`;
  }

  async currentlyWatching() {
    // fetch from the URL
    const query = location.hash.split('?')[1];
    const params = Object.fromEntries(new URLSearchParams(query));
    if (params.key) {
      const url = this.buildRequest(params.key);
      const resp = await fetchData(url);
      return resp.MediaContainer.children[0].Video;
    }
  }

  async getSession() {
    const url = this.buildRequest(ENDPOINTS.session);
    const resp = await fetchData(url);
    return resp;
  }
}

export default Api;
