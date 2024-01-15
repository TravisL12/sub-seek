import srtParser2 from 'srt-parser-2';

import { wait } from './helpers';
import Api from '../Api';
import { SRT_CODEC, SUBTITLE_INDICES } from '../constants';

class SubSeek {
  constructor(auth, options) {
    console.table('---- Subseek AUTH ----', auth);
    this.api = new Api(auth);
    this.auth = auth;
    this.parser = new srtParser2();
    this.videoEl;
    this.subtitleResults;
    this.subtitleResultIndices = options[SUBTITLE_INDICES] || {};
  }

  getEvents() {
    return this.api.beginEventSource();
  }

  async getMetadata(keyId) {
    const resp = await this.api.getMetadata(keyId);
    return resp;
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
            return (format === SRT_CODEC || codec === SRT_CODEC) && selected;
          });

    let subStream = streams.find(({ format, codec, key }) => {
      return (format === SRT_CODEC || codec === SRT_CODEC) && !!key;
    });

    const subtitleSearchResults = await this.api.searchSubFiles(keyId);
    this.subtitleResults = {
      [keyId]: subtitleSearchResults.MediaContainer.Stream,
    };

    if (!subStream || isNewChoice) {
      const resultIdx =
        this.subtitleResultIndices[keyId] !== undefined
          ? this.subtitleResultIndices[keyId]
          : 0;
      subStream = this.subtitleResults[keyId][resultIdx];
      await this.api.putSubFile(subStream, keyId);
      await wait(1);
      return this.getSubtitles(keyId, prevSelectedSub ?? 'none'); // call function again to load the subtitles
    } else {
      const subtitleText = await this.api.getSubFile(subStream.key);
      this.resetOrRestoreSubtitles(part, prevSelectedSub);
      console.log(resp, 'subseek metadata');
      console.log('subseek SUBTITLES LOADED!', subStream);
      return this.parser.fromSrt(subtitleText);
    }
  }
}

export default SubSeek;
