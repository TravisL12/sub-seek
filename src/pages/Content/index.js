import Api from './Api';
import srtParser2 from 'srt-parser-2';
import { getUrl, wait } from './modules/helpers';
import { VIDEO_PLAYER_SELECTOR } from './constants';

class SubSeek {
  constructor(token, serverUrl, vidEl) {
    this.api = new Api(token, serverUrl);
    this.videoEl = vidEl;
    this.parser = new srtParser2();
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
      this.getSubtitles(); // call function again to load the subtitles
      return;
    }

    if (subStream) {
      const subtitleText = await this.api.getSubFile(subStream.key);
      this.subtitles = this.parseSubtitles(subtitleText);
    }
  }

  async parseSubtitles(subtitleText) {
    const parsed = this.parser.fromSrt(subtitleText);

    if (!this.videoEl) {
      this.videoEl = this.getVideoElement();
    }
    await wait(5);
    if (this.videoEl) {
      console.log(parsed[100], 'subseek NEW TIME TEMPORARY');
      this.videoEl.currentTime = parsed[100].startSeconds;
    }
  }

  async getSession() {
    const resp = await this.api.getSession();
    console.log(resp, 'subseek session');
  }

  async getSections() {
    const resp = await this.api.getSections();
    console.log(resp, 'subseek sections');
  }
}

const start = async (vidEl) => {
  console.log('subseek START!', vidEl);
  const { token, serverUrl } = await getUrl();
  const seek = new SubSeek(token, serverUrl, vidEl);
  seek.getSubtitles();
};

const setupObserver = () => {
  const mutationObserver = new MutationObserver((mutationList) => {
    const all = mutationList
      .map((listItem) => Array.from(listItem.addedNodes))
      .flat();

    const vidContainer = all.find((el) => {
      return el.querySelector(VIDEO_PLAYER_SELECTOR);
    });

    if (vidContainer) {
      const vidEl = vidContainer.querySelector(VIDEO_PLAYER_SELECTOR);
      start(vidEl);
    }
  });
  mutationObserver.observe(document.getElementById('plex'), {
    subtree: true,
    childList: true,
  });
};

setupObserver();
