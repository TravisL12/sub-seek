import Api from './Api';
import { getUrl } from './modules/helpers';

console.log('I am the SubSeek content file');

class SubSeek {
  constructor(token, serverUrl) {
    this.api = new Api(token, serverUrl);
  }

  async currentlyWatching() {
    const eventSource = this.api.beginEventSource();
    setTimeout(() => {
      console.log('seek closing event source!');
      eventSource.close();
    }, 60 * 1000);

    // const resp = await this.api.currentlyWatching();
    // const streams = resp.children[0].Media.children[0].Part.children;
    // console.log(resp, 'seek metadata');
    // console.log(streams, 'seek streams');
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
  seek.getSections();
  seek.currentlyWatching();
};

setTimeout(() => {
  console.log('seek START!');
  start();
}, 5 * 1000);
