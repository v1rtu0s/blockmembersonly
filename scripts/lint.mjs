import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'manifest.json');

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  fail('manifest.json not found at repository root.');
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  fail(`manifest.json is not valid JSON: ${err.message}`);
}

if (manifest.manifest_version !== 3) {
  fail(`Expected manifest_version 3, got ${manifest.manifest_version}`);
}

if (!manifest.name || !manifest.version) {
  fail('manifest.json must include "name" and "version".');
}

if (manifest.description && manifest.description.length > 132) {
  fail(`manifest.json description exceeds Chrome Web Store 132-char limit (${manifest.description.length} chars).`);
}

// Collect all file paths referenced by manifest.json
const referencedPaths = new Set();

if (manifest.icons) {
  Object.values(manifest.icons).forEach((p) => referencedPaths.add(p));
}
if (manifest.action?.default_popup) {
  referencedPaths.add(manifest.action.default_popup);
}
if (manifest.action?.default_icon) {
  if (typeof manifest.action.default_icon === 'string') {
    referencedPaths.add(manifest.action.default_icon);
  } else {
    Object.values(manifest.action.default_icon).forEach((p) => referencedPaths.add(p));
  }
}
if (manifest.background?.service_worker) {
  referencedPaths.add(manifest.background.service_worker);
}
if (Array.isArray(manifest.content_scripts)) {
  for (const cs of manifest.content_scripts) {
    (cs.js || []).forEach((p) => referencedPaths.add(p));
    (cs.css || []).forEach((p) => referencedPaths.add(p));
  }
}

for (const relPath of referencedPaths) {
  const absPath = path.join(rootDir, relPath);
  if (!fs.existsSync(absPath)) {
    fail(`Referenced asset missing: ${relPath}`);
  }
}

// Syntax-check all JavaScript source files
const jsFiles = [
  'src/background.js',
  'src/content.js',
  'src/popup.js',
  'scripts/build.mjs',
  'scripts/lint.mjs',
];

for (const relPath of jsFiles) {
  const absPath = path.join(rootDir, relPath);
  if (!fs.existsSync(absPath)) {
    fail(`Expected script missing: ${relPath}`);
  }
  execFileSync(process.execPath, ['--check', absPath], { stdio: 'inherit' });
}

console.log(`Lint passed: ClearFeed v${manifest.version} (${referencedPaths.size} manifest assets verified)`);
