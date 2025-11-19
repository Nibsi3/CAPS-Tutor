#!/usr/bin/env node

/**
 * Script to download Fira Code and Inter fonts for self-hosting
 * This avoids CORS errors from Appwrite CDN fonts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(process.cwd(), 'public', 'fonts');

// Ensure fonts directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  // Fira Code fonts (from unpkg CDN - reliable source)
  {
    name: 'FiraCode-Regular.woff2',
    url: 'https://unpkg.com/@fontsource/fira-code@5.0.0/files/fira-code-latin-400-normal.woff2',
  },
  {
    name: 'FiraCode-Medium.woff2',
    url: 'https://unpkg.com/@fontsource/fira-code@5.0.0/files/fira-code-latin-500-normal.woff2',
  },
  {
    name: 'FiraCode-SemiBold.woff2',
    url: 'https://unpkg.com/@fontsource/fira-code@5.0.0/files/fira-code-latin-600-normal.woff2',
  },
  {
    name: 'FiraCode-Bold.woff2',
    url: 'https://unpkg.com/@fontsource/fira-code@5.0.0/files/fira-code-latin-700-normal.woff2',
  },
  // Inter fonts
  {
    name: 'Inter-Regular.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.woff2',
  },
  {
    name: 'Inter-Medium.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Medium.woff2',
  },
  {
    name: 'Inter-SemiBold.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-SemiBold.woff2',
  },
  {
    name: 'Inter-Bold.woff2',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.woff2',
  },
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

async function downloadFonts() {
  console.log('📥 Downloading fonts to public/fonts/...\n');
  
  for (const font of fonts) {
    const filepath = path.join(fontsDir, font.name);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${font.name} (already exists)`);
      continue;
    }
    
    try {
      console.log(`⬇️  Downloading ${font.name}...`);
      await downloadFile(font.url, filepath);
      const stats = fs.statSync(filepath);
      console.log(`✅ Downloaded ${font.name} (${(stats.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`❌ Failed to download ${font.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Font download complete!');
  console.log('   Fonts are now available at /fonts/ and will be loaded automatically.');
}

downloadFonts().catch(console.error);

