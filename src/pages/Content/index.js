import Api from './Api';
import { getUrl } from './modules/helpers';

class SubSeek {
  constructor(token, serverUrl) {
    this.api = new Api(token, serverUrl);
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
      setTimeout(() => {
        console.log('subseek REFETCH!');
        this.getSubtitles(); // call function again to load the subtitles
      }, 3 * 1000);
      return;
    }

    if (subStream) {
      const subText = await this.api.getSubFile(subStream.key);
      console.log(subText.slice(0, 100), 'subseek sub text truncated');
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

const start = async () => {
  const { token, serverUrl } = await getUrl();
  const seek = new SubSeek(token, serverUrl);
  seek.getSubtitles();
};

setTimeout(() => {
  console.log('subseek START!');
  start();
}, 5 * 1000);
