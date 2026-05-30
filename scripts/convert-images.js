const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg'];

async function convertImages() {
  console.log('=== Saaral Cosmetics Image Optimizer ===');
  console.log(`Scanning directory: ${IMAGES_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Error: Directory does not exist at ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_EXTS.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('No PNG or JPG images found for conversion.');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to optimize:`);
  imageFiles.forEach(file => console.log(`  - ${file}`));
  console.log('\nStarting conversions...\n');

  for (const file of imageFiles) {
    const fullPath = path.join(IMAGES_DIR, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const originalSize = fs.statSync(fullPath).size;

    console.log(`Optimizing [ ${file} ] (${(originalSize / 1024 / 1024).toFixed(2)} MB):`);

    // Define target paths
    const webpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
    const avifPath = path.join(IMAGES_DIR, `${baseName}.avif`);

    try {
      // 1. Convert to AVIF (Standard quality 65, effort 4 is a good balance of speed vs compression)
      await sharp(fullPath)
        .avif({ quality: 65, effort: 4 })
        .toFile(avifPath);
      
      const avifSize = fs.statSync(avifPath).size;
      const avifReduction = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
      console.log(`  └─> AVIF: ${(avifSize / 1024).toFixed(1)} KB (Reduced by ${avifReduction}%)`);

      // 2. Convert to WebP (Standard quality 75)
      await sharp(fullPath)
        .webp({ quality: 75 })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      const webpReduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      console.log(`  └─> WebP: ${(webpSize / 1024).toFixed(1)} KB (Reduced by ${webpReduction}%)`);

      // 3. Delete original if --delete flag is provided
      if (process.argv.includes('--delete')) {
        fs.unlinkSync(fullPath);
        console.log(`  └─> Deleted original source: ${file}`);
      }

    } catch (err) {
      console.error(`  ✕ Error processing ${file}:`, err.message);
    }
    console.log('');
  }

  console.log('=== Image Optimization Complete! ===');
}

convertImages().catch(err => {
  console.error('Fatal error during optimization:', err);
  process.exit(1);
});
