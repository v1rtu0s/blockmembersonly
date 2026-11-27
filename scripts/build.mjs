import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const unpackedDir = path.join(distDir, 'unpacked');

const INCLUDE_FILES = [
  'manifest.json',
  'src/background.js',
  'src/content.css',
  'src/content.js',
  'src/popup.html',
  'src/popup.css',
  'src/popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

async function build() {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  const version = manifest.version;

  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(unpackedDir, { recursive: true });

  const zip = new JSZip();

  for (const relPath of INCLUDE_FILES) {
    const srcPath = path.join(rootDir, relPath);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing required extension file: ${relPath}`);
    }

    const destPath = path.join(unpackedDir, relPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);

    const fileData = fs.readFileSync(srcPath);
    zip.file(relPath, fileData);
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const versionedName = `clearfeed-youtube-members-hider-v${version}.zip`;
  const latestName = 'clearfeed-youtube-members-hider.zip';

  fs.writeFileSync(path.join(distDir, versionedName), zipBuffer);
  fs.writeFileSync(path.join(distDir, latestName), zipBuffer);

  const kb = (zipBuffer.length / 1024).toFixed(1);
  console.log(`Built dist/${versionedName} (${kb} KB, ${INCLUDE_FILES.length} files)`);
  console.log(`Built dist/${latestName}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
