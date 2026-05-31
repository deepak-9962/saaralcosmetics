const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const DIR = path.join(__dirname, '../public/images/testimonials');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'));

Promise.all(
  files.map((f) => {
    const src = path.join(DIR, f);
    const dest = path.join(DIR, f.replace('.png', '.avif'));
    return sharp(src)
      .avif({ quality: 72, effort: 4 })
      .toFile(dest)
      .then((info) => {
        const kb = (info.size / 1024).toFixed(1);
        console.log('converted: ' + f + ' -> ' + f.replace('.png', '.avif') + ' (' + kb + ' KB)');
      })
      .catch((e) => console.error('FAILED: ' + f + ': ' + e.message));
  })
).then(() => console.log('All done!'));
