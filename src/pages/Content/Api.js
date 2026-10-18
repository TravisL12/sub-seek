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

  getSubFile(subKey) {
    const url = this.buildRequest(subKey);
    return fetchData({ url, isJson: false });
  }

  setPartSubtitleStream(partKey, extra) {
    const url = this.buildRequest(`${ENDPOINTS.parts}/${partKey}`);
    return fetchData({ url: url + extra, isJson: false, httpMethod: 'PUT' });
  }

  resetSubFile(partKey) {
    return this.setPartSubtitleStream(partKey, '&subtitleStreamID=0');
  }

  restoreSubFile(partKey, streamId) {
    return this.setPartSubtitleStream(
      partKey,
      `&subtitleStreamID=${streamId}&allParts=1`
    );
  }

  putSubFile(subtitle, id) {
    const { key, codec, languageCode: language, providerTitle } = subtitle;
    const extra = `&key=${key}&hearingImpaired=0&forced=0&language=${language}&providerTitle=${providerTitle}&codec=${codec}`;
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${id}/subtitles`);
    return fetchData({ url: url + extra, isJson: false, httpMethod: 'PUT' });
  }

  searchSubFiles(id) {
    const extra = '&language=en&hearingImpaired=0&forced=0';
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${id}/subtitles`);
    return fetchData({ url: url + extra });
  }

  beginEventSource() {
    const filters = 'activity,playing';
    const url = this.buildRequest(ENDPOINTS.eventSource, filters);
    return new EventSource(url);
  }

  async getMetadata(keyId) {
    const url = this.buildRequest(`${ENDPOINTS.metadata}/${keyId}`);
    const resp = await fetchData({ url });
    return resp.MediaContainer.Metadata[0];
  }
}

export default Api;
