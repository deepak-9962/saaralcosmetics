const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_PATH = path.join(__dirname, '../../public/images/hero.png');
const OUTPUT_AVIF_PATH = path.join(__dirname, '../../public/images/hero-mobile.avif');
const OUTPUT_WEBP_PATH = path.join(__dirname, '../../public/images/hero-mobile.webp');

async function main() {
  console.log(`Starting hero image optimization...`);
  console.log(`Source: ${INPUT_PATH}`);
  
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Error: Source file does not exist at ${INPUT_PATH}`);
    process.exit(1);
  }
  
  const stats = fs.statSync(INPUT_PATH);
  console.log(`Source File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  try {
    // 1. Generate AVIF version
    console.log(`Generating hero-mobile.avif at 768px width...`);
    await sharp(INPUT_PATH)
      .resize({ width: 768 })
      .avif({ quality: 80, effort: 4 }) // Effort 4 is balanced speed/compression
      .toFile(OUTPUT_AVIF_PATH);
      
    const avifStats = fs.statSync(OUTPUT_AVIF_PATH);
    console.log(`Created: ${OUTPUT_AVIF_PATH}`);
    console.log(`AVIF Size: ${(avifStats.size / 1024).toFixed(2)} KB`);

    // 2. Generate WEBP version
    console.log(`Generating hero-mobile.webp at 768px width...`);
    await sharp(INPUT_PATH)
      .resize({ width: 768 })
      .webp({ quality: 85 })
      .toFile(OUTPUT_WEBP_PATH);
      
    const webpStats = fs.statSync(OUTPUT_WEBP_PATH);
    console.log(`Created: ${OUTPUT_WEBP_PATH}`);
    console.log(`WEBP Size: ${(webpStats.size / 1024).toFixed(2)} KB`);
    
    console.log(`\nSuccess! Both optimized mobile hero images have been generated successfully.`);
  } catch (error) {
    console.error(`Error during image optimization:`, error);
    process.exit(1);
  }
}

main();
