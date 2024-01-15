import srtParser2 from 'srt-parser-2';

import { wait } from './helpers';
import Api from '../Api';

class SubSeek {
  constructor(auth) {
    console.table('---- subseek AUTH ----', auth);
    this.api = new Api(auth);
    this.auth = auth;
    this.parser = new srtParser2();
    this.videoEl;
    this.subtitleResults;
    this.subtitleResultIdx = 0;
  }

  getEvents() {
    return this.api.beginEventSource();
  }

  async resetOrRestoreSubtitles(part, prevSelectedSub) {
    if (part.id && !prevSelectedSub) {
      await this.api.resetSubFile(part.id);
    }

    // if a sub file was selected initially, reselect it
    if (prevSelectedSub?.id) {
      this.api.restoreSubFile(part.id, prevSelectedSub.id);
    }
  }

  async getSubtitles(keyId, prevSub, isNewChoice = false) {
    const media = await this.getMetadata(keyId);
    const part = media.Media[0].Part[0];
    const streams = part.Stream;

    const prevSelectedSub =
      prevSub === 'none'
        ? undefined
        : prevSub ||
          streams.find(({ format, codec, selected }) => {
            return (format === 'srt' || codec === 'srt') && selected;
          });

    let subStream = streams.find(({ format, codec, key }) => {
      return (format === 'srt' || codec === 'srt') && !!key;
    });

    const subtitleSearchResults = await this.api.searchSubFiles(keyId);
    this.subtitleResults = {
      [keyId]: subtitleSearchResults.MediaContainer.Stream,
    };

    if (!subStream || isNewChoice) {
      subStream = this.subtitleResults[keyId][this.subtitleResultIdx];
      await this.api.putSubFile(subStream, keyId);
      await wait(1);
      return this.getSubtitles(keyId, prevSelectedSub ?? 'none'); // call function again to load the subtitles
    } else {
      const subtitleText = await this.api.getSubFile(subStream.key);
      this.resetOrRestoreSubtitles(part, prevSelectedSub);
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
}

export default SubSeek;
