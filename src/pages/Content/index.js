import Api from './Api';
import { getUrl } from './modules/helpers';

console.log('I am the SubSeek content file');

class SubSeek {
  constructor(token, serverUrl) {
    this.api = new Api(token, serverUrl);
  }

  async getSubtitles() {
    const resp = await this.api.currentlyWatching(); // this doesn't work everywhere. Use the API!
    const streams = resp.children[0].Media.children[0].Part.children;

    const subStream = streams.find(({ Stream }) => {
      return (
        (Stream.format === 'srt' || Stream.codec === 'srt') && !!Stream.key
      );
    });

    /**
     * if it doesn't have a subtitle file use GET `/library/metadata/subtitles/<file id>`
     * to do a search.
     */

    console.log(streams, 'seek streams');
    if (subStream?.Stream) {
      console.log(subStream, 'seek subStream');
      this.api.getSubFile(subStream.Stream.key).then((sub) => {
        console.log(sub, 'seek SUB FILE?????');
      });
    }
  }

  async getSession() {
    const resp = await this.api.getSession();
    console.log(resp, 'seek session');
  }

  async getSections() {
    const resp = await this.api.getSections();
    console.log(resp, 'seek sections');
  }
}

const start = async () => {
  const { token, serverUrl } = await getUrl();
  const seek = new SubSeek(token, serverUrl);
  seek.getSubtitles();
};

setTimeout(() => {
  console.log('seek START!');
  start();
}, 5 * 1000);
