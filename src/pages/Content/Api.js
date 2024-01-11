import { ENDPOINTS } from './constants';
import { fetchData } from './modules/helpers';

class Api {
  constructor(token, serverUrl) {
    this.token = token;
    this.serverUrl = serverUrl;
  }

  buildRequest(endpoint, filters) {
    let base = `${this.serverUrl}${endpoint}?X-Plex-Token=${this.token}`;
    if (filters) {
      base += `&filters=${filters}`;
    }
    return base;
  }

  beginEventSource() {
    const filters = 'activity,playing';
    const url = this.buildRequest(ENDPOINTS.eventSource, filters);
    const eventSource = new EventSource(url);

    ['activity', 'ping', 'playing'].forEach((item) => {
      eventSource.addEventListener(item, (event) => {
        console.log(`seek ${item} event:`, JSON.parse(event.data));
      });
    });

    return eventSource;
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

  async getSections() {
    const url = this.buildRequest(ENDPOINTS.sections);
    const resp = await fetchData(url);
    return resp;
  }
}

export default Api;
