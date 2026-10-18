import srtParser2 from 'srt-parser-2';

import { wait } from './helpers';
import { setLocalChrome } from './storageHelpers';
import Api from '../Api';
import {
  DOWNLOAD_POLL_ATTEMPTS,
  SRT_CODEC,
  SUBTITLE_INDICES,
  SUBTITLE_STREAM_KEYS,
} from '../constants';

const isSrt = ({ format, codec }) =>
  format === SRT_CODEC || codec === SRT_CODEC;

// Only SRT streams with a key (sidecar or downloaded files) can be fetched as text
const isKeyedSrt = (stream) => isSrt(stream) && !!stream.key;

const getPart = (media) => media.Media[0].Part[0];

class SubSeek {
  constructor(auth, options) {
    this.api = new Api(auth);
    this.auth = auth;
    this.parser = new srtParser2();
    this.videoEl = undefined;
    this.subtitleResults = undefined;
    this.currentMedia = undefined;
    this.subtitleResultIndices = options[SUBTITLE_INDICES] || {};
    // The stream key of the file loaded for each item, so a reload shows the same file
    // instead of whichever SRT Plex lists first
    this.subtitleStreamKeys = options[SUBTITLE_STREAM_KEYS] || {};
    // Bumped on each load so a slower, older load can't overwrite a newer one
    this.requestCount = 0;
  }

  getEvents() {
    return this.api.beginEventSource();
  }

  getMetadata(keyId) {
    return this.api.getMetadata(keyId);
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

  saveStreamKey(keyId, streamKey) {
    this.subtitleStreamKeys[keyId] = streamKey;
    setLocalChrome({ [SUBTITLE_STREAM_KEYS]: this.subtitleStreamKeys });
  }

  findExistingStream(keyId, streams) {
    const savedKey = this.subtitleStreamKeys[keyId];
    return (
      (savedKey && streams.find((stream) => stream.key === savedKey)) ||
      streams.find(isKeyedSrt)
    );
  }

  // Plex downloads the file after the PUT returns, so poll until it shows up as a new
  // stream. Plex also selects the file it downloads, which covers a re-pick of a file
  // that already exists and so doesn't get a new key
  async downloadSubtitle(keyId, result, knownKeys, prevSelectedSub) {
    await this.api.putSubFile(result, keyId);

    for (let attempt = 1; attempt <= DOWNLOAD_POLL_ATTEMPTS; attempt++) {
      await wait(1);
      const media = await this.getMetadata(keyId);
      const streams = getPart(media).Stream;
      const isLastTry = attempt === DOWNLOAD_POLL_ATTEMPTS;
      const subStream =
        streams.find(
          (stream) => isKeyedSrt(stream) && !knownKeys.has(stream.key)
        ) ||
        streams.find(
          (stream) =>
            isKeyedSrt(stream) &&
            stream.selected &&
            (isLastTry || stream.id !== prevSelectedSub?.id)
        );
      if (subStream) {
        return subStream;
      }
    }

    throw new Error('Subtitle download did not finish');
  }

  async getSubtitles(keyId, isNewChoice = false) {
    const requestId = ++this.requestCount;
    const media = await this.getMetadata(keyId);
    const part = getPart(media);
    const streams = part.Stream;
    const prevSelectedSub = streams.find(
      (stream) => isSrt(stream) && stream.selected
    );

    const subtitleSearchResults = await this.api.searchSubFiles(keyId);
    const results = subtitleSearchResults.MediaContainer.Stream ?? [];
    this.subtitleResults = { ...this.subtitleResults, [keyId]: results };

    let subStream = isNewChoice
      ? undefined
      : this.findExistingStream(keyId, streams);

    if (!subStream) {
      // The saved choice can point past the end when the search results change
      const result =
        results[this.subtitleResultIndices[keyId] ?? 0] ?? results[0];
      if (!result) {
        throw new Error('No subtitle search results');
      }
      const knownKeys = new Set(
        streams.filter(isKeyedSrt).map(({ key }) => key)
      );
      subStream = await this.downloadSubtitle(
        keyId,
        result,
        knownKeys,
        prevSelectedSub
      );
    }

    const subtitleText = await this.api.getSubFile(subStream.key);
    this.resetOrRestoreSubtitles(part, prevSelectedSub);
    if (requestId !== this.requestCount) {
      return undefined;
    }

    this.saveStreamKey(keyId, subStream.key);
    this.currentMedia = media;
    return this.parser.fromSrt(subtitleText);
  }
}

export default SubSeek;
