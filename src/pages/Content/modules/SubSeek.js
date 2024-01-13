import srtParser2 from 'srt-parser-2';

import { wait } from './helpers';
import { VIDEO_PLAYER_SELECTOR } from '../constants';
import Api from '../Api';

class SubSeek {
  constructor(token, serverUrl) {
    console.log('subseek -------');
    console.log('subseek token', token);
    console.log('subseek serverUrl', serverUrl);
    console.log('subseek -------');
    this.api = new Api(token, serverUrl);
    this.parser = new srtParser2();
    this.videoEl;
  }

  getVideoElement() {
    return document.querySelector(VIDEO_PLAYER_SELECTOR);
  }

  async getSubtitles() {
    // NEED BETTER WAY TO GET MEDIA ID
    // this.api.beginEventSource();
    const { mediaId, media } = await this.api.currentlyWatching(); // this doesn't work everywhere. Use the API!
    const streams = media.Media[0].Part[0].Stream;
    let subStream = streams.find((stream) => {
      return (
        (stream.format === 'srt' || stream.codec === 'srt') && !!stream.key
      );
    });

    if (!subStream) {
      const results = await this.api.searchSubFiles(mediaId);
      subStream = results.MediaContainer.Stream[0];
      await this.api.putSubFile(subStream, mediaId);
      await wait(3);
      console.log('subseek REFETCH!');
      return this.getSubtitles(); // call function again to load the subtitles
    } else {
      const subtitleText = await this.api.getSubFile(subStream.key);
      return this.parser.fromSrt(subtitleText);
    }
  }

  async getSession() {
    const resp = await this.api.getSession();
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
