const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const logoPath = path.join(__dirname, '../public/images/logo.png');
  const outDir = path.join(__dirname, '../public/images');

  // Read logo.png
  const { data, info } = await sharp(logoPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Variant A: Pure White & Gold Script for Dark Backgrounds
  // "Saaral" and "COSMETICS" become brilliant crisp white #FFFFFF or warm ivory #FFF8F2
  const whiteData = Buffer.from(data);
  for (let i = 0; i < whiteData.length; i += channels) {
    const a = whiteData[i + 3];
    if (a === 0) continue;

    const r = whiteData[i];
    const g = whiteData[i + 1];
    const b = whiteData[i + 2];

    const isPinkBlob = (r > 195 && g > 115 && g < 210 && b > 125 && b < 225);
    const isWhiteLeaf = (r > 240 && g > 240 && b > 240);

    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

    if (!isPinkBlob && !isWhiteLeaf) {
      if (brightness < 130) {
        // Main text stroke
        whiteData[i] = 255;
        whiteData[i + 1] = 255;
        whiteData[i + 2] = 255;
      } else if (brightness < 215) {
        // Anti-aliased edge
        whiteData[i] = 255;
        whiteData[i + 1] = 255;
        whiteData[i + 2] = 255;
      }
    } else if (isPinkBlob) {
      // Over the pink blob, text strokes
      if (brightness < 125) {
        whiteData[i] = 255;
        whiteData[i + 1] = 255;
        whiteData[i + 2] = 255;
      }
    }
  }

  const whiteSharp = sharp(whiteData, { raw: { width, height, channels: 4 } });
  await whiteSharp.clone().png().toFile(path.join(outDir, 'logo-light.png'));
  await whiteSharp.clone().webp({ quality: 90 }).toFile(path.join(outDir, 'logo-light.webp'));
  await whiteSharp.clone().avif({ quality: 85 }).toFile(path.join(outDir, 'logo-light.avif'));
  console.log('✓ Created logo-light (white text variant) in PNG, WebP, AVIF');

  // Variant B: Warm Cream Brand Plaque / Card
  // A luxury rounded ivory card with subtle warm gold border that houses the original green & pink logo
  const plaqueWidth = 240;
  const plaqueHeight = 90;
  const innerLogo = await sharp(logoPath)
    .resize(190, 68, { fit: 'inside' })
    .png()
    .toBuffer();

  const svgCard = `
    <svg width="${plaqueWidth}" height="${plaqueHeight}" viewBox="0 0 ${plaqueWidth} ${plaqueHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFDF9"/>
          <stop offset="100%" stop-color="#F9EFE6"/>
        </linearGradient>
      </defs>
      <rect width="${plaqueWidth}" height="${plaqueHeight}" rx="20" fill="url(#bg)" stroke="#C9A74D" stroke-width="1.5" stroke-opacity="0.35"/>
    </svg>
  `;

  await sharp(Buffer.from(svgCard))
    .composite([{ input: innerLogo, gravity: 'center' }])
    .webp({ quality: 95 })
    .toFile(path.join(outDir, 'logo-footer-badge.webp'));

  await sharp(Buffer.from(svgCard))
    .composite([{ input: innerLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'logo-footer-badge.png'));

  console.log('✓ Created logo-footer-badge in WebP, PNG');
}

run().catch(console.error);
