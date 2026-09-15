import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf-8'));
const version = manifest.version || pkg.version || '1.0.0';

const releaseDir = path.resolve('release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const zipName = `Web2MD-FeedAI-v${version}.zip`;
const zipPath = path.join(releaseDir, zipName);

console.log(`📦 Packaging Chrome Web Store release: ${zipName}...`);

try {
  if (process.platform === 'win32') {
    // Windows PowerShell Compress-Archive
    const distItems = path.resolve('dist', '*');
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${distItems}' -DestinationPath '${zipPath}' -Force"`, {
      stdio: 'inherit'
    });
  } else {
    // Unix zip command
    execSync(`cd dist && zip -r "${zipPath}" ./*`, { stdio: 'inherit' });
  }

  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log(`✅ Successfully generated extension package!`);
    console.log(`📁 File: ${zipPath}`);
    console.log(`📊 Size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    throw new Error('Package file was not created');
  }
} catch (err) {
  console.error('❌ Failed to package extension:', err);
  process.exit(1);
}
