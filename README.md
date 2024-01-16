![SubSeekLogo](https://github.com/TravisL12/sub-seek/assets/2141322/7b503732-feed-43da-8d1b-ecca16c058ab)

# Plex SubSeek

A Chrome Extension for finding a part of the movie by searching the subtitles, then jump to that part of the movie.

### Features

- Maintains displayed subtitles if selected
- Allows choosing different subtitle file if the subtitles aren't matching. And saves the new selection.
- Loads the subtitles automatically

### Logo Design

https://www.fontspace.com/category/blade-runner

### Development

This has been built using the [chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react)! It has made it very easy to bootstrap a typescript based Chrome Extension using Manifest version 3. But there are a few snafu's.

The use of the development command (`yarn start`) causes issues with SockJS and most pages during development doing this crashes. So instead you must use `yarn build` and reload the extension in Chrome every time changes are made. It's not ideal but that's what you have to do.
