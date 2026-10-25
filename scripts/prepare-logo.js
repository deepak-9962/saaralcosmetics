const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_PATH = 'C:/Users/DEEPAK/.gemini/antigravity-ide/brain/c61721da-168a-46d9-8ff9-44f5ac8c6553/.user_uploaded/media_1792941640489.png';
const PUBLIC_IMAGES = path.join(__dirname, '../public/images');
const SRC_APP = path.join(__dirname, '../src/app');

async function processLogo() {
  console.log('--- Processing Saaral Cosmetics Logo ---');

  const image = sharp(SOURCE_PATH);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // 1. Flood fill to remove exterior white background with anti-aliasing
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(x, y) {
    const idx = (y * width + x) * channels;
    return data[idx] > 240 && data[idx+1] > 240 && data[idx+2] > 240;
  }

  for (let x = 0; x < width; x++) {
    if (isBg(x, 0)) { queue.push(x, 0); visited[x] = 1; }
    if (isBg(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBg(0, y) && !visited[y * width]) { queue.push(0, y); visited[y * width] = 1; }
    if (isBg(width - 1, y) && !visited[y * width + width - 1]) { queue.push(width - 1, y); visited[y * width + width - 1] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const qx = queue[head++];
    const qy = queue[head++];
    const neighbors = [
      [qx+1, qy], [qx-1, qy], [qx, qy+1], [qx, qy-1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && isBg(nx, ny)) {
          visited[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Create RGBA buffer with transparent exterior
  const transparentBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const srcIdx = pIdx * channels;
      const dstIdx = pIdx * 4;

      transparentBuffer[dstIdx] = data[srcIdx];
      transparentBuffer[dstIdx + 1] = data[srcIdx + 1];
      transparentBuffer[dstIdx + 2] = data[srcIdx + 2];

      if (visited[pIdx]) {
        // Compute feathering based on brightness
        const avg = (data[srcIdx] + data[srcIdx + 1] + data[srcIdx + 2]) / 3;
        if (avg >= 253) {
          transparentBuffer[dstIdx + 3] = 0;
        } else {
          // Soft transition at borders
          const alpha = Math.max(0, Math.min(255, Math.round((255 - avg) * 20)));
          transparentBuffer[dstIdx + 3] = alpha;
        }
      } else {
        transparentBuffer[dstIdx + 3] = 255;
      }
    }
  }

  // Get bounding box of visible content
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = transparentBuffer[(y * width + x) * 4 + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const padX = 24;
  const padY = 24;
  const extractLeft = Math.max(0, minX - padX);
  const extractTop = Math.max(0, minY - padY);
  const extractWidth = Math.min(width - extractLeft, (maxX - minX) + padX * 2);
  const extractHeight = Math.min(height - extractTop, (maxY - minY) + padY * 2);

  console.log(`Content bounds: ${minX}, ${minY} to ${maxX}, ${maxY}`);
  console.log(`Extracting cropped logo: ${extractWidth}x${extractHeight}`);

  const trimmedSharp = sharp(transparentBuffer, { raw: { width, height, channels: 4 } })
    .extract({ left: extractLeft, top: extractTop, width: extractWidth, height: extractHeight });

  // 1. Transparent horizontal logo for Navbar, Checkout, Footer
  await trimmedSharp.clone().png({ quality: 90, compressionLevel: 9 }).toFile(path.join(PUBLIC_IMAGES, 'logo.png'));
  await trimmedSharp.clone().webp({ quality: 90 }).toFile(path.join(PUBLIC_IMAGES, 'logo.webp'));
  await trimmedSharp.clone().avif({ quality: 85 }).toFile(path.join(PUBLIC_IMAGES, 'logo.avif'));
  console.log('✓ Created public/images/logo.png, .webp, .avif');

  // 2. Square Brand Logo for Schema.org & Google Knowledge Panel (512x512)
  // Google recommends a clean square logo on white/neutral background
  const squareSize = 512;
  const logoInSquare = await trimmedSharp.clone()
    .resize(460, 460, { fit: 'inside' })
    .png()
    .toBuffer();

  const squareLogo = sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).composite([{ input: logoInSquare, gravity: 'center' }]);

  await squareLogo.clone().png().toFile(path.join(PUBLIC_IMAGES, 'logo-square.png'));
  await squareLogo.clone().webp({ quality: 90 }).toFile(path.join(PUBLIC_IMAGES, 'logo-square.webp'));
  await squareLogo.clone().avif({ quality: 85 }).toFile(path.join(PUBLIC_IMAGES, 'logo-square.avif'));
  console.log('✓ Created public/images/logo-square.png, .webp, .avif (for Google Schema.org)');

  // 3. Next.js App Router Favicon and Apple Touch Icon
  // Next.js recognizes `src/app/icon.png` (32x32 to 512x512) and `src/app/apple-icon.png` (180x180)
  const iconSize = 512;
  const iconInner = await trimmedSharp.clone()
    .resize(440, 440, { fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: { r: 253, g: 246, b: 240, alpha: 1 } // Matches brand ivory #FDF6F0
    }
  })
  .composite([{ input: iconInner, gravity: 'center' }])
  .png()
  .toFile(path.join(SRC_APP, 'icon.png'));
  console.log('✓ Created src/app/icon.png (512x512 high-DPI Google SERP & Tab Favicon)');

  const appleIconSize = 180;
  const appleIconInner = await trimmedSharp.clone()
    .resize(150, 150, { fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: appleIconSize,
      height: appleIconSize,
      channels: 4,
      background: { r: 253, g: 246, b: 240, alpha: 1 }
    }
  })
  .composite([{ input: appleIconInner, gravity: 'center' }])
  .png()
  .toFile(path.join(SRC_APP, 'apple-icon.png'));
  console.log('✓ Created src/app/apple-icon.png (180x180 for iOS home screen)');

  // 4. OpenGraph Social Share Card (1200x630) for WhatsApp, Facebook, iMessage, Twitter/X
  const ogWidth = 1200;
  const ogHeight = 630;
  const ogLogo = await trimmedSharp.clone()
    .resize(680, 320, { fit: 'inside' })
    .png()
    .toBuffer();

  // Create elegant gradient backdrop matching Saaral aesthetic (#FDF6F0 warm blush / ivory with soft gold border)
  const ogCardSvg = `
    <svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="60%" stop-color="#FCF3EB"/>
          <stop offset="100%" stop-color="#F7E6D7"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="24" y="24" width="${ogWidth - 48}" height="${ogHeight - 48}" rx="24" fill="none" stroke="#C9A74D" stroke-opacity="0.3" stroke-width="2"/>
      <text x="600" y="470" font-family="'Playfair Display', Georgia, serif" font-size="28" font-style="italic" fill="#5A2E3B" text-anchor="middle" letter-spacing="1">
        Handcrafted 100% Natural Herbal Skincare
      </text>
      <text x="600" y="520" font-family="'Inter', sans-serif" font-size="16" font-weight="500" fill="#886868" text-anchor="middle" letter-spacing="4">
        PURE · HERBAL · SUSTAINABLE · TAMIL NADU, INDIA
      </text>
    </svg>
  `;

  await sharp(Buffer.from(ogCardSvg))
    .composite([
      { input: ogLogo, top: 110, left: Math.round((ogWidth - 680) / 2) }
    ])
    .webp({ quality: 90 })
    .toFile(path.join(PUBLIC_IMAGES, 'og-image.webp'));

  await sharp(Buffer.from(ogCardSvg))
    .composite([
      { input: ogLogo, top: 110, left: Math.round((ogWidth - 680) / 2) }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(PUBLIC_IMAGES, 'og-image.jpg'));

  console.log('✓ Created public/images/og-image.webp and og-image.jpg (1200x630 Social Card)');
  console.log('--- Logo Processing Complete! ---');
}

processLogo().catch(console.error);
