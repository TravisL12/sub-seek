import Api from './Api';
import { getUrl } from './modules/helpers';

console.log('I am the SubSeek content file');

class SubSeek {
  constructor(token, serverUrl) {
    this.api = new Api(token, serverUrl);
  }

  async currentlyWatching() {
    const resp = await this.api.currentlyWatching();
    console.log(resp, 'seek metadata');
  }

  async getSession() {
    const resp = await this.api.getSession();
    console.log(resp, 'seek session');
  }
}

const start = async () => {
  const { token, serverUrl } = await getUrl();
  const seek = new SubSeek(token, serverUrl);
  seek.getSession();
  seek.currentlyWatching();
};

setTimeout(() => {
  console.log('seek START!');
  start();
}, 5 * 1000);
