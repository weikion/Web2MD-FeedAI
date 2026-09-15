import { build } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

async function runBuild() {
  console.log('🚀 Starting CopyToMD Extension Build...');

  const distDir = resolve('dist');

  // Clean or create dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build SidePanel HTML & assets
  console.log('📦 1/3 Building SidePanel UI...');
  await build({
    root: resolve('src/sidepanel'),
    base: './',
    publicDir: false,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          sidepanel: resolve('src/sidepanel/index.html')
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  });

  if (fs.existsSync(resolve(distDir, 'index.html'))) {
    fs.renameSync(resolve(distDir, 'index.html'), resolve(distDir, 'sidepanel.html'));
  }

  // 2. Build Background Service Worker (ES module)
  console.log('⚙️ 2/3 Building Background Service Worker...');
  await build({
    publicDir: false,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: resolve('src/background/index.js'),
        name: 'background',
        formats: ['es'],
        fileName: () => 'background.js'
      }
    }
  });

  // 3. Build Content Script (IIFE for universal compatibility in web pages)
  console.log('🌐 3/3 Building Content Script...');
  await build({
    publicDir: false,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: resolve('src/content/index.js'),
        name: 'CopyToMDContent',
        formats: ['iife'],
        fileName: () => 'content.js'
      }
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  // 4. Copy static assets: manifest.json, icons, content.css
  console.log('📋 Copying manifest, icons, and stylesheets...');
  fs.copyFileSync(resolve('public/manifest.json'), resolve(distDir, 'manifest.json'));
  fs.copyFileSync(resolve('src/content/content.css'), resolve(distDir, 'content.css'));

  const publicIconsDir = resolve('public/icons');
  const distIconsDir = resolve(distDir, 'icons');
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }

  const iconFiles = fs.readdirSync(publicIconsDir);
  for (const file of iconFiles) {
    fs.copyFileSync(resolve(publicIconsDir, file), resolve(distIconsDir, file));
  }

  console.log('✅ CopyToMD Extension build completed successfully in ./dist !');
}

runBuild().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
