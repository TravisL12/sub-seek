// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

const webpack = require('webpack');
const config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

webpack(config, function (err, stats) {
  // `err` only covers fatal webpack failures; a compilation error (a broken
  // import, a type error) lands on `stats` instead. Exiting non-zero keeps
  // `yarn package` from zipping up a stale build/
  if (err) {
    console.error(err.stack || err);
    process.exit(1);
  }

  if (stats.hasErrors()) {
    console.error(
      stats.toString({ all: false, errors: true, errorDetails: true })
    );
    process.exit(1);
  }

  console.log(stats.toString({ all: false, warnings: true, assets: true }));
});
