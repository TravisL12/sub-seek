import { ENDPOINTS } from './constants';
import { fetchData } from './modules/helpers';

class Api {
  constructor(auth) {
    const { token, serverUrl, clientIdentifier } = auth;
    this.token = token;
    this.serverUrl = serverUrl;
    this.clientIdentifier = clientIdentifier;
  }

  buildRequest(endpoint, filters) {
    let base = `${this.serverUrl}${endpoint}?X-Plex-Token=${this.token}`;
    if (filters) {
      base += `&filters=${filters}`;
    }
    return base;
  }

  async getSubFile(subKey) {
    const url = this.buildRequest(subKey);
    const resp = await fetchData({ url, isJson: false });
    return resp;
  }

  async resetSubFile(partKey) {
    const url = this.buildRequest(`${ENDPOINTS.parts}/${partKey}`);
    const resp = await fetchData({
      url: url + '&subtitleStreamID=0',
      isJson: false,
      httpMethod: 'PUT',
    });
    return resp;
  }

  async restoreSubFile(partKey, streamId) {
    const url = this.buildRequest(`${ENDPOINTS.parts}/${partKey}`);
    const resp = await fetchData({
      url: url + `&subtitleStreamID=${streamId}&allParts=1`,
      isJson: false,
      httpMethod: 'PUT',
    });
    return resp;
  }

  async putSubFile(subtitle, id) {
    const { key, codec, languageCode: language, providerTitle } = subtitle;
    const extra = `&key=${key}&hearingImpaired=0&forced=0&language=${language}&providerTitle=${providerTitle}&codec=${codec}`;
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${id}/subtitles`);
    const resp = await fetchData({
      url: `${url + extra}`,
      isJson: false,
      httpMethod: 'PUT',
    });
    return resp;
  }

  async searchSubFiles(id) {
    const extra = '&language=en&hearingImpaired=0&forced=0';
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${id}/subtitles`);
    const resp = await fetchData({ url: `${url + extra}` });
    return resp;
  }

  beginEventSource() {
    const filters = 'activity,playing';
    const url = this.buildRequest(ENDPOINTS.eventSource, filters);
    const eventSource = new EventSource(url);
    return eventSource;
  }

  async getMetadata(keyId) {
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${keyId}`);
    const resp = await fetchData({ url });
    return resp.MediaContainer.Metadata[0];
  }
}

export default Api;
