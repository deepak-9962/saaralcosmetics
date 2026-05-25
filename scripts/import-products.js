const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Resolve environment variables from .env.local manually
const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) supabaseKey = value;
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Supabase URL or Key not found. Please check your .env.local file.');
  process.exit(1);
}

if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

// Helper to parse variant name and price from string segments
function parseVariantPart(part, defaultName) {
  let price = 0;
  const rsMatch = part.match(/Rs\.?\s*(\d+)/i);
  if (rsMatch) {
    price = Number(rsMatch[1]);
  } else {
    const numbers = part.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      price = Number(numbers[numbers.length - 1]);
    }
  }
  
  let name = '';
  const sepMatch = part.split(/[-:]/);
  if (sepMatch.length >= 2) {
    name = sepMatch[0].trim();
  } else {
    name = part.replace(/Rs\.?\s*\d+/i, '').trim();
  }
  
  name = name.replace(/\\/g, '').replace(/\s+/g, ' ').trim();
  
  return { name: name || defaultName || null, price };
}

// Parses variants and prices from variant name and selling price strings
function parseVariantsAndPrices(variantNameStr, sellingPriceStr) {
  const variants = [];
  if (!sellingPriceStr) {
    return [{ name: variantNameStr || null, price: 0 }];
  }
  
  variantNameStr = (variantNameStr || '').trim();
  sellingPriceStr = (sellingPriceStr || '').replace(/\/\-/g, '').trim();
  
  if (sellingPriceStr.includes(',') || sellingPriceStr.includes(';') || (sellingPriceStr.includes('/') && !sellingPriceStr.startsWith('/'))) {
    const parts = sellingPriceStr.split(/[,;/]/);
    parts.forEach(part => {
      part = part.trim();
      if (!part || part === '-') return;
      variants.push(parseVariantPart(part, variantNameStr));
    });
  } else {
    variants.push(parseVariantPart(sellingPriceStr, variantNameStr));
  }
  
  return variants;
}

// Parses standard Markdown questionnaire table structure
function parseMarkdownTable(content) {
  const data = {};
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('|')) {
      const cols = line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cols.length >= 2 && cols[0].toLowerCase() !== 'specification field' && !cols[0].startsWith(':--')) {
        const key = cols[0].replace(/\*\*/g, '').trim();
        const value = cols[1].replace(/\*\*/g, '').trim();
        data[key] = value;
      }
    }
  });
  return data;
}

// Extracts and parses tables from DOCX file structure using native 'tar'
function parseDocx(filePath) {
  const tempDir = path.join(__dirname, '../.temp_docx_extract');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
  try {
    execSync(`tar -xf "${filePath}" -C "${tempDir}" word/document.xml`);
    const xmlPath = path.join(tempDir, 'word/document.xml');
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    
    const tables = [];
    const tblRegex = /<w:tbl[^>]*>([\s\S]*?)<\/w:tbl>/g;
    let tblMatch;
    while ((tblMatch = tblRegex.exec(xmlContent)) !== null) {
      const tableHtml = tblMatch[1];
      const rows = [];
      const trRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
      let trMatch;
      while ((trMatch = trRegex.exec(tableHtml)) !== null) {
        const rowHtml = trMatch[1];
        const cells = [];
        const tcRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
        let tcMatch;
        while ((tcMatch = tcRegex.exec(rowHtml)) !== null) {
          const cellHtml = tcMatch[1];
          const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
          let tMatch;
          let cellText = '';
          while ((tMatch = tRegex.exec(cellHtml)) !== null) {
            cellText += tMatch[1];
          }
          cells.push(cellText.trim());
        }
        rows.push(cells);
      }
      tables.push(rows);
    }
    
    const data = {};
    tables.forEach(table => {
      table.forEach(row => {
        if (row.length >= 2) {
          const key = row[0].replace(/&amp;/g, '&').trim();
          const val = row[1].replace(/&amp;/g, '&').trim();
          if (key && key !== 'Specification Field') {
            data[key] = val;
          }
        }
      });
    });
    
    return data;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function run() {
  const importDir = path.join(__dirname, '../import-data');
  
  if (!fs.existsSync(importDir)) {
    console.log(`\nImport directory does not exist: ${importDir}`);
    return;
  }
  
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.log(`No markdown files found in: ${importDir}`);
    return;
  }
  
  console.log(`\x1b[36m%s\x1b[0m`, `Found ${files.length} product file(s) in import-data folder. Parsing details...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const filePath = path.join(importDir, file);
    
    try {
      const buf = fs.readFileSync(filePath).subarray(0, 4);
      const isDocx = buf.toString('hex') === '504b0304';
      
      let productData = {};
      if (isDocx) {
        productData = parseDocx(filePath);
      } else {
        productData = parseMarkdownTable(fs.readFileSync(filePath, 'utf8'));
      }
      
      // Extract properties
      const name = productData["Product Name"] || productData["Product Name "] || null;
      if (!name) {
        console.error(`\x1b[31m%s\x1b[0m`, `Skipping ${file}: Could not find 'Product Name' in key-value table.`);
        failCount++;
        continue;
      }
      
      // Map category
      const categoryRaw = (productData["Category (Face Cream / Face Wash / Soap / Nalangu Maavu)"] || "soap").toLowerCase();
      let category = "soap";
      if (categoryRaw.includes("cream") || categoryRaw.includes("balm")) {
        category = "face-cream";
      } else if (categoryRaw.includes("wash")) {
        category = "face-wash";
      } else if (categoryRaw.includes("soap")) {
        category = "soap";
      } else if (categoryRaw.includes("maavu")) {
        category = "nalangu-maavu";
      }
      
      // Parse description, ingredients, how_to_use
      const shortDesc = productData["Short Description (Brief hook)"] || "";
      const fullDesc = productData["Full Description (Detailed overview)"] || "";
      const description = `${shortDesc}\n\n${fullDesc}`.trim();
      
      const ingredients = (productData["Ingredients (Full INCI list preferred)"] || "").replace(/^Complete Ingredient List:\s*/i, "").trim();
      const howToUse = (productData["How to Use (Step-by-step instructions)"] || "").replace(/^How to Use:\s*/i, "").trim();
      
      // Parse variants and prices
      const rawVariant = productData["Variant Name (Size/Type e.g., 50g, Rose, Turmeric)"];
      const rawPrice = productData["Selling Price"];
      const variants = parseVariantsAndPrices(rawVariant, rawPrice);
      
      console.log(`\nProcessing Product: "${name}" (${category})`);
      
      for (const variant of variants) {
        // Generate unique slug
        let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        
        // If there are multiple variants, append the variant name to make the slug unique
        if (variants.length > 1 && variant.name) {
          const variantSlug = variant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          slug = `${baseSlug}-${variantSlug}`;
        }
        
        // Build payload matching our database schema
        const payload = {
          name: name,
          slug: slug,
          category: category,
          variant_name: variant.name,
          price: variant.price,
          compare_price: null,
          description: description || null,
          ingredients: ingredients || null,
          how_to_use: howToUse || null,
          images: [], // No photos yet as requested
          stock: 100, // Default to 100 so it is purchasable for testing
          is_active: true
        };
        
        console.log(`  -> Upserting SKU: ${variant.name || "Default"} | Price: Rs ${variant.price} | Slug: ${slug}`);
        
        const url = `${supabaseUrl}/rest/v1/products`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Supabase error: ${response.status} - ${errorText}`);
        }
        
        successCount++;
      }
      
    } catch (err) {
      console.error(`\x1b[31m%s\x1b[0m`, `  Failed to process ${file}:`, err.message || err);
      failCount++;
    }
  }
  
  console.log('\n\x1b[32m%s\x1b[0m', `Import completed. Successful SKUs: ${successCount}. Failures: ${failCount}.`);
}

run();
