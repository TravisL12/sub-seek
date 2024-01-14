import srtParser2 from 'srt-parser-2';

import { wait } from './helpers';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import Api from '../Api';

class SubSeek {
  constructor(auth) {
    console.table('---- subseek AUTH ----', auth);
    this.api = new Api(auth);
    this.auth = auth;
    this.parser = new srtParser2();
    this.videoEl;
  }

  getVideoElement() {
    return document.querySelector(VIDEO_PLAYER_SELECTOR);
  }

  getEvents() {
    return this.api.beginEventSource();
  }

  async getSubtitles(keyId) {
    const media = await this.api.getMetadata(keyId); // this doesn't work everywhere. Use the API!
    const streams = media.Media[0].Part[0].Stream;
    let subStream = streams.find((stream) => {
      return (
        (stream.format === 'srt' || stream.codec === 'srt') && !!stream.key
      );
    });

    if (!subStream) {
      const results = await this.api.searchSubFiles(keyId);
      subStream = results.MediaContainer.Stream[0];
      await this.api.putSubFile(subStream, keyId);
      await wait(3);
      console.log('subseek REFETCH!');
      return this.getSubtitles(keyId); // call function again to load the subtitles
    } else {
      const subtitleText = await this.api.getSubFile(subStream.key);
      console.log('subseek SUBTITLES LOADED!', subStream);
      return this.parser.fromSrt(subtitleText);
    }
  }

  async getMetadata(keyId) {
    const resp = await this.api.getMetadata(keyId);
    console.log(resp, 'subseek metadata');
    return resp;
  }

  async getSessions() {
    const resp = await this.api.getSessions();
    console.log(resp, 'subseek session');
    return resp;
  }

  async getSections() {
    const resp = await this.api.getSections();
    console.log(resp, 'subseek sections');
    return resp;
  }
}

export default SubSeek;
