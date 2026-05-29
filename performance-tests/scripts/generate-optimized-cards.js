const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, '../../public/images');

const cards = ['card1', 'card2', 'card3', 'card4'];

async function main() {
  console.log(`Starting homepage cards optimization...`);
  
  for (const card of cards) {
    const inputPng = path.join(IMAGES_DIR, `${card}.png`);
    const outputAvif = path.join(IMAGES_DIR, `${card}.avif`);
    const outputWebp = path.join(IMAGES_DIR, `${card}.webp`);
    
    if (!fs.existsSync(inputPng)) {
      console.warn(`Warning: Source file ${inputPng} does not exist. Skipping.`);
      continue;
    }
    
    const stats = fs.statSync(inputPng);
    console.log(`\nProcessing ${card}.png (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);
    
    try {
      // 1. Generate AVIF (Max-width 768px, high quality)
      await sharp(inputPng)
        .resize({ width: 768, withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toFile(outputAvif);
        
      const avifStats = fs.statSync(outputAvif);
      console.log(`-> Created ${card}.avif: ${(avifStats.size / 1024).toFixed(2)} KB`);

      // 2. Generate WEBP (Max-width 768px, high quality)
      await sharp(inputPng)
        .resize({ width: 768, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputWebp);
        
      const webpStats = fs.statSync(outputWebp);
      console.log(`-> Created ${card}.webp: ${(webpStats.size / 1024).toFixed(2)} KB`);
      
    } catch (err) {
      console.error(`Error processing ${card}:`, err);
    }
  }
  
  console.log(`\nCards optimization complete!`);
}

main();
