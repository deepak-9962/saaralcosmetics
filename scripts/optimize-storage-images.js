const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ws = require('ws');

// 1. Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').replace(/^"|"$/g, '').trim();
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const SUPABASE_STORAGE_REGEX = /^https?:\/\/[^\/]+\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/i;

function parseStorageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(SUPABASE_STORAGE_REGEX);
  if (!match) return null;
  const bucket = match[1];
  const objectPath = match[2];
  return { bucket, objectPath };
}

function isRawImage(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(png|jpe?g)$/i.test(url);
}

function getWebpPath(objectPath) {
  return objectPath.replace(/\.(png|jpe?g)$/i, '.webp');
}

async function convertAndUpload(bucket, oldPath) {
  const newPath = getWebpPath(oldPath);
  console.log(`\n⬇️  Downloading: [${bucket}] ${oldPath}`);
  
  const { data: fileData, error: downloadError } = await client.storage
    .from(bucket)
    .download(oldPath);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download ${oldPath}: ${downloadError?.message}`);
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  const originalSize = inputBuffer.length;

  console.log(`⚙️  Compressing with Sharp (WebP, quality 80)...`);
  const webpBuffer = await sharp(inputBuffer)
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  const newSize = webpBuffer.length;
  const savingsPct = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
  console.log(`📦 Size reduced: ${(originalSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (${savingsPct}% saved)`);

  console.log(`⬆️  Uploading WebP with 1-Year Immutable Cache-Control: [${bucket}] ${newPath}`);
  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(newPath, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000, immutable',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload ${newPath}: ${uploadError.message}`);
  }

  // Get new public URL
  const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(newPath);

  // Clean up old raw file from storage to free up space
  console.log(`🗑️  Removing original raw file: [${bucket}] ${oldPath}`);
  await client.storage.from(bucket).remove([oldPath]);

  return {
    publicUrl,
    newPath,
    originalSize,
    newSize,
  };
}

async function optimizeAll() {
  console.log("=================================================================");
  console.log("🚀 STARTING STORAGE IMAGE OPTIMIZATION (PNG/JPG -> WebP)");
  console.log("=================================================================");

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  let convertedCount = 0;
  const urlMap = new Map(); // Cache already converted URLs

  // -------------------------------------------------------------
  // 1. PRODUCTS TABLE
  // -------------------------------------------------------------
  console.log("\n📦 Scanning 'products' table...");
  const { data: products, error: prodErr } = await client
    .from('products')
    .select('id, name, images, image_path');

  if (prodErr) throw prodErr;

  for (const product of products || []) {
    let changed = false;
    const currentImages = Array.isArray(product.images) ? [...product.images] : [];
    const newImages = [];
    let newImagePath = product.image_path;

    for (const imgUrl of currentImages) {
      if (isRawImage(imgUrl)) {
        const parsed = parseStorageUrl(imgUrl);
        if (parsed) {
          try {
            let result;
            if (urlMap.has(imgUrl)) {
              result = urlMap.get(imgUrl);
            } else {
              result = await convertAndUpload(parsed.bucket, parsed.objectPath);
              urlMap.set(imgUrl, result);
              totalOriginalBytes += result.originalSize;
              totalOptimizedBytes += result.newSize;
              convertedCount++;
            }
            newImages.push(result.publicUrl);
            if (product.image_path && product.image_path.includes(path.basename(parsed.objectPath))) {
              newImagePath = result.newPath;
            }
            changed = true;
          } catch (err) {
            console.error(`❌ Error converting image for ${product.name}:`, err.message);
            newImages.push(imgUrl);
          }
        } else {
          newImages.push(imgUrl);
        }
      } else {
        newImages.push(imgUrl);
      }
    }

    if (changed) {
      console.log(`💾 Updating product: "${product.name}" in DB...`);
      const { error: updateErr } = await client
        .from('products')
        .update({
          images: newImages,
          image_path: newImagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateErr) {
        console.error(`❌ DB update failed for ${product.name}:`, updateErr.message);
      } else {
        console.log(`✅ Product updated successfully.`);
      }
    }
  }

  // -------------------------------------------------------------
  // 2. HERO SLIDES TABLE
  // -------------------------------------------------------------
  console.log("\n🖼️ Scanning 'hero_slides' table...");
  const { data: heroSlides } = await client.from('hero_slides').select('*');
  for (const slide of heroSlides || []) {
    if (isRawImage(slide.image_url)) {
      const parsed = parseStorageUrl(slide.image_url);
      if (parsed) {
        try {
          const res = await convertAndUpload(parsed.bucket, parsed.objectPath);
          totalOriginalBytes += res.originalSize;
          totalOptimizedBytes += res.newSize;
          convertedCount++;
          await client.from('hero_slides').update({ image_url: res.publicUrl }).eq('id', slide.id);
          console.log(`✅ Updated hero slide: ${slide.id}`);
        } catch (err) {
          console.error(`❌ Hero slide error:`, err.message);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 3. HOMEPAGE CATEGORIES TABLE
  // -------------------------------------------------------------
  console.log("\n📑 Scanning 'homepage_categories' table...");
  const { data: hpCats } = await client.from('homepage_categories').select('*');
  for (const cat of hpCats || []) {
    if (isRawImage(cat.image_url)) {
      const parsed = parseStorageUrl(cat.image_url);
      if (parsed) {
        try {
          const res = await convertAndUpload(parsed.bucket, parsed.objectPath);
          totalOriginalBytes += res.originalSize;
          totalOptimizedBytes += res.newSize;
          convertedCount++;
          await client.from('homepage_categories').update({ image_url: res.publicUrl }).eq('id', cat.id);
          console.log(`✅ Updated homepage category: ${cat.title || cat.id}`);
        } catch (err) {
          console.error(`❌ Homepage category error:`, err.message);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 4. CUSTOMER TRANSFORMATIONS TABLE
  // -------------------------------------------------------------
  console.log("\n✨ Scanning 'customer_transformations' table...");
  const { data: trans } = await client.from('customer_transformations').select('*');
  for (const row of trans || []) {
    let updatePayload = {};
    if (isRawImage(row.before_image)) {
      const parsed = parseStorageUrl(row.before_image);
      if (parsed) {
        try {
          const res = await convertAndUpload(parsed.bucket, parsed.objectPath);
          totalOriginalBytes += res.originalSize;
          totalOptimizedBytes += res.newSize;
          convertedCount++;
          updatePayload.before_image = res.publicUrl;
        } catch (err) { console.error(err.message); }
      }
    }
    if (isRawImage(row.after_image)) {
      const parsed = parseStorageUrl(row.after_image);
      if (parsed) {
        try {
          const res = await convertAndUpload(parsed.bucket, parsed.objectPath);
          totalOriginalBytes += res.originalSize;
          totalOptimizedBytes += res.newSize;
          convertedCount++;
          updatePayload.after_image = res.publicUrl;
        } catch (err) { console.error(err.message); }
      }
    }
    if (Object.keys(updatePayload).length > 0) {
      await client.from('customer_transformations').update(updatePayload).eq('id', row.id);
      console.log(`✅ Updated transformation row: ${row.id}`);
    }
  }

  // -------------------------------------------------------------
  // 5. BLOG POSTS TABLE
  // -------------------------------------------------------------
  console.log("\n📝 Scanning 'blog_posts' table...");
  const { data: posts } = await client.from('blog_posts').select('*');
  for (const post of posts || []) {
    if (isRawImage(post.cover_image)) {
      const parsed = parseStorageUrl(post.cover_image);
      if (parsed) {
        try {
          const res = await convertAndUpload(parsed.bucket, parsed.objectPath);
          totalOriginalBytes += res.originalSize;
          totalOptimizedBytes += res.newSize;
          convertedCount++;
          await client.from('blog_posts').update({ cover_image: res.publicUrl }).eq('id', post.id);
          console.log(`✅ Updated blog post cover: ${post.title}`);
        } catch (err) { console.error(err.message); }
      }
    }
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  const savedBytes = totalOriginalBytes - totalOptimizedBytes;
  const savedMb = (savedBytes / 1024 / 1024).toFixed(2);
  const origMb = (totalOriginalBytes / 1024 / 1024).toFixed(2);
  const optMb = (totalOptimizedBytes / 1024 / 1024).toFixed(2);
  const pct = totalOriginalBytes > 0 ? (((savedBytes) / totalOriginalBytes) * 100).toFixed(1) : 0;

  console.log("\n=================================================================");
  console.log("🎉 STORAGE OPTIMIZATION COMPLETED SUCCESSFULLY");
  console.log("=================================================================");
  console.log(`Total Images Converted to WebP: ${convertedCount}`);
  console.log(`Original Total Size:           ${origMb} MB`);
  console.log(`New Optimized Size:            ${optMb} MB`);
  console.log(`Total Storage & Egress Saved:  ${savedMb} MB (${pct}% Drop)`);
  console.log("All converted objects configured with 1-Year Immutable CDN Cache-Control.");
  console.log("=================================================================\n");
}

optimizeAll().catch(console.error);

