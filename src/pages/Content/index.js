import { getUrl } from './modules/helpers';

console.log('I am the SubSeek content file');

const plexToken = localStorage['myPlexAccessToken'];
getUrl(plexToken);
