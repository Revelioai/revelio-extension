// generate-manifest.ts
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { manifest } from './src/manifest'; // Adjust the path as per your project structure

const manifestOutputPath = './dist/manifest.json';

// Ensure the dist directory exists
if (!existsSync(path.dirname(manifestOutputPath))) {
  mkdirSync(path.dirname(manifestOutputPath), { recursive: true });
}

writeFileSync(manifestOutputPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Manifest generated successfully!');
