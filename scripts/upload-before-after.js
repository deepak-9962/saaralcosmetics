/**
 * Saaral Cosmetics — Before/After Photo Uploader
 * ─────────────────────────────────────────────
 * Uses Supabase Storage REST API directly (no WebSocket/realtime issues).
 *
 * 1. Reads raw PNG/JPG photos from:  customer-photos/
 *    Expected naming convention:
 *      devika-before.jpg       devika-after.jpg
 *      sudharshan-before.jpg   sudharshan-after.jpg
 *      amirtha-before.jpg      amirtha-after.jpg
 *
 * 2. Converts each to AVIF (65% quality — smallest file size, best quality)
 * 3. Uploads to Supabase Storage bucket: "customer-transformations"
 * 4. Prints public URLs to paste into CustomerTransformations.tsx
 *
 * Usage:
 *   npm run upload-before-after
 *   npm run upload-before-after -- --delete   ← also deletes originals after upload
 */

const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

// ── Load .env.local (no dotenv dependency needed) ─────────────────────────────
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET_NAME      = 'customer-transformations';
const INPUT_DIR        = path.join(__dirname, '../customer-photos');
const TEMP_DIR         = path.join(__dirname, '../customer-photos/_converted');
const SUPPORTED_EXTS   = ['.png', '.jpg', '.jpeg', '.avif', '.webp'];
const DELETE_ORIGINALS = process.argv.includes('--delete');

if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error('\n✕  Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n');
  process.exit(1);
}

// ── Supabase Storage REST helpers (pure fetch, no WS) ────────────────────────
const storageBase = `${SUPABASE_URL}/storage/v1`;
const headers = {
  apikey: SUPABASE_SERVICE,
  Authorization: `Bearer ${SUPABASE_SERVICE}`,
};

async function bucketExists() {
  const res = await fetch(`${storageBase}/bucket/${BUCKET_NAME}`, { headers });
  return res.ok;
}

async function createBucket() {
  const res = await fetch(`${storageBase}/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: BUCKET_NAME,
      name: BUCKET_NAME,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ['image/avif', 'image/webp', 'image/jpeg', 'image/png'],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
}

async function uploadFile(localPath, remoteName, contentType = 'image/avif') {
  const buffer = fs.readFileSync(localPath);
  const uploadUrl = `${storageBase}/object/${BUCKET_NAME}/${remoteName}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': contentType,
      'x-upsert': 'true', // overwrite if already exists
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
}

function getPublicUrl(remoteName) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${remoteName}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  Saaral Cosmetics — Before/After Photo Uploader  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // 1. Ensure input folder exists (first-run setup)
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log('✓  Created input folder: customer-photos/\n');
    console.log('   Drop your raw before/after photos inside it:\n');
    console.log('   customer-photos/');
    console.log('   ├── devika-before.jpg');
    console.log('   ├── devika-after.jpg');
    console.log('   ├── sudharshan-before.jpg');
    console.log('   ├── sudharshan-after.jpg');
    console.log('   ├── amirtha-before.jpg');
    console.log('   └── amirtha-after.jpg');
    console.log('\n   Then run: npm run upload-before-after\n');
    process.exit(0);
  }

  // 2. Find all raw images (skip _converted subfolder)
  const allFiles = fs.readdirSync(INPUT_DIR);
  const imageFiles = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return SUPPORTED_EXTS.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('  No PNG/JPG images found in customer-photos/');
    console.log('  Add your photos and run again.\n');
    process.exit(0);
  }

  console.log(`  Found ${imageFiles.length} photo(s):\n`);
  imageFiles.forEach((f) => console.log(`    - ${f}`));
  console.log('');

  // 3. Create temp dir for AVIF conversions
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  // 4. Ensure Supabase bucket exists
  process.stdout.write('  Checking Storage bucket… ');
  const exists = await bucketExists();
  if (!exists) {
    process.stdout.write('creating… ');
    await createBucket();
    console.log(`✓  Bucket "${BUCKET_NAME}" created (public).`);
  } else {
    console.log(`✓  Bucket "${BUCKET_NAME}" ready.`);
  }
  console.log('');

  // 5. Process each file: convert → upload
  const results = [];

  for (const file of imageFiles) {
    const inputPath  = path.join(INPUT_DIR, file);
    const ext        = path.extname(file).toLowerCase();
    const baseName   = path.basename(file, ext);
    const isDirect   = ext === '.avif' || ext === '.webp';
    const remoteName = isDirect ? file : `${baseName}.avif`;
    const avifLocal  = path.join(TEMP_DIR, remoteName);
    const originalSize = fs.statSync(inputPath).size;

    if (isDirect) {
      process.stdout.write(`  [${file}] (${formatBytes(originalSize)}) → Direct upload… `);
    } else {
      process.stdout.write(`  [${file}] (${formatBytes(originalSize)}) → AVIF… `);
    }

    try {
      if (isDirect) {
        const contentType = ext === '.avif' ? 'image/avif' : 'image/webp';
        await uploadFile(inputPath, remoteName, contentType);
        const publicUrl = getPublicUrl(remoteName);
        console.log('✓');
        results.push({ name: baseName, url: publicUrl });
      } else {
        await sharp(inputPath)
          .avif({ quality: 65, effort: 4 })
          .toFile(avifLocal);

        const avifSize = fs.statSync(avifLocal).size;
        const reduction = (((originalSize - avifSize) / originalSize) * 100).toFixed(0);
        process.stdout.write(`${formatBytes(avifSize)} (-${reduction}%) → Uploading… `);

        await uploadFile(avifLocal, remoteName, 'image/avif');
        const publicUrl = getPublicUrl(remoteName);

        console.log('✓');
        results.push({ name: baseName, url: publicUrl });
      }

      if (DELETE_ORIGINALS) {
        fs.unlinkSync(inputPath);
        console.log(`    └─ Deleted original: ${file}`);
      }
    } catch (err) {
      console.log('✕ FAILED');
      console.error(`    Error: ${err.message}`);
    }
  }

  // 6. Clean up temp dir
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  if (results.length === 0) {
    console.log('\n  No files were uploaded successfully.\n');
    process.exit(1);
  }

  // 7. Print results & instructions
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  Upload Complete!                                                ║');
  console.log('║  Paste these into: src/components/home/CustomerTransformations.tsx ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Group by person name
  const grouped = {};
  for (const { name, url } of results) {
    const isAfter  = name.endsWith('-after');
    const isBefore = name.endsWith('-before');
    const person   = name.replace(/-before$/, '').replace(/-after$/, '');
    if (!grouped[person]) grouped[person] = {};
    if (isAfter)  grouped[person].afterSrc  = url;
    if (isBefore) grouped[person].beforeSrc = url;
  }

  for (const [person, urls] of Object.entries(grouped)) {
    console.log(`  // ${person}`);
    if (urls.beforeSrc) console.log(`  beforeSrc: "${urls.beforeSrc}",`);
    if (urls.afterSrc)  console.log(`  afterSrc:  "${urls.afterSrc}",`);
    console.log('');
  }

  console.log('  Also add Supabase to next.config.ts remotePatterns if not already:');
  console.log('  ────────────────────────────────────────────────────────────────');
  const host = new URL(SUPABASE_URL).hostname;
  console.log(`  { hostname: "${host}" }\n`);
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
