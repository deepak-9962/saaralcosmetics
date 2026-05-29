const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../../public/images');

const banners = ['saaral-banner-2', 'saaral-banner-3'];

async function main() {
  console.log(`Starting homepage banners mobile optimization...`);
  
  for (const banner of banners) {
    const inputPng = path.join(IMAGES_DIR, `${banner}.png`);
    const outputAvif = path.join(IMAGES_DIR, `${banner}-mobile.avif`);
    const outputWebp = path.join(IMAGES_DIR, `${banner}-mobile.webp`);
    
    if (!fs.existsSync(inputPng)) {
      console.warn(`Warning: Source file ${inputPng} does not exist. Skipping.`);
      continue;
    }
    
    const stats = fs.statSync(inputPng);
    console.log(`\nProcessing ${banner}.png (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);
    
    try {
      // 1. Generate Mobile AVIF (768px width)
      await sharp(inputPng)
        .resize({ width: 768 })
        .avif({ quality: 80, effort: 4 })
        .toFile(outputAvif);
        
      const avifStats = fs.statSync(outputAvif);
      console.log(`-> Created ${banner}-mobile.avif: ${(avifStats.size / 1024).toFixed(2)} KB`);

      // 2. Generate Mobile WEBP (768px width)
      await sharp(inputPng)
        .resize({ width: 768 })
        .webp({ quality: 85 })
        .toFile(outputWebp);
        
      const webpStats = fs.statSync(outputWebp);
      console.log(`-> Created ${banner}-mobile.webp: ${(webpStats.size / 1024).toFixed(2)} KB`);
      
    } catch (err) {
      console.error(`Error processing ${banner}:`, err);
    }
  }
  
  console.log(`\nBanners optimization complete!`);
}

main();
