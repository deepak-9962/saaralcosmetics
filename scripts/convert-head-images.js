/**
 * convert-head-images.js
 * Converts head1.png, head2.png, head3.png, head4.png → AVIF
 * Preserves transparency (alpha channel) for background-less images.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const HEAD_FILES = ['head1.png', 'head2.png', 'head3.png', 'head4.png'];

async function run() {
  console.log('=== Converting head1–head4 PNG → AVIF ===\n');

  for (const file of HEAD_FILES) {
    const srcPath = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠ Not found, skipping: ${file}`);
      continue;
    }

    const baseName = path.basename(file, '.png');
    const avifPath = path.join(IMAGES_DIR, `${baseName}.avif`);
    const originalSize = fs.statSync(srcPath).size;

    console.log(`Processing: ${file}  (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);

    try {
      await sharp(srcPath)
        .avif({ quality: 70, effort: 5 })
        .toFile(avifPath);

      const avifSize = fs.statSync(avifPath).size;
      const pct = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
      console.log(`  ✓ → ${baseName}.avif  ${(avifSize / 1024).toFixed(1)} KB  (saved ${pct}%)\n`);
    } catch (err) {
      console.error(`  ✕ Error: ${err.message}\n`);
    }
  }

  console.log('=== Done ===');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
