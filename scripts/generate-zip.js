import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const zip = new JSZip();

const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  'public',
  'bun.lock',
  'package-lock.json',
  '.DS_Store'
];

function addDirectoryToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (excludePatterns.includes(item)) continue;
    
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder);
    } else if (stat.isFile()) {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

async function buildZip() {
  console.log('Generating ZIP archive of all project source code...');
  addDirectoryToZip(rootDir, zip);

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const outputPath = path.join(publicDir, 'smc-vega-trading-system.zip');
  fs.writeFileSync(outputPath, zipBuffer);
  console.log(`✅ ZIP successfully generated at: ${outputPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
}

buildZip().catch(err => {
  console.error('Error generating zip:', err);
  process.exit(1);
});
