// Zips the contents of the build directory (not the directory itself) into
// zip/sub-seek-<version>.zip, which is what the Chrome Web Store expects:
// manifest.json must sit at the archive root.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDir = path.join(root, 'build');
const zipDir = path.join(root, 'zip');

const { name } = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(buildDir, 'manifest.json'), 'utf8')
);
const zipPath = path.join(zipDir, `${name}-${manifest.version}.zip`);

fs.mkdirSync(zipDir, { recursive: true });
fs.rmSync(zipPath, { force: true });

// -x excludes macOS cruft that Finder's "Compress" would otherwise bundle in.
// Running from inside buildDir keeps paths relative, so there is no top-level
// folder in the archive.
execFileSync(
  'zip',
  ['-r', '-X', zipPath, '.', '-x', '.DS_Store', '__MACOSX/*', '*.zip'],
  { cwd: buildDir, stdio: 'inherit' }
);

console.log(`\nPackaged ${path.relative(root, zipPath)}`);
console.log(execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8' }));
