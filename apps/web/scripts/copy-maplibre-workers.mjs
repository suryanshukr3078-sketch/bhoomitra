import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sourceDist = path.resolve(projectRoot, 'node_modules', 'maplibre-gl', 'dist');
const targetDir = path.resolve(projectRoot, 'public', 'maplibre');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const filesToCopy = ['maplibre-gl-csp-worker.js', 'maplibre-gl.css'];

for (const file of filesToCopy) {
  const src = path.join(sourceDist, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied ' + file + ' to public/maplibre/' + file);
  } else {
    console.warn('Source file not found: ' + src);
  }
}
