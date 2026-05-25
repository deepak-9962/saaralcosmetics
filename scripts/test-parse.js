const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const importDir = path.join(__dirname, '../import-data');
const files = fs.readdirSync(importDir).filter(f => f.endsWith('.md'));

// Helper to parse variant/price
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
    // Strip out "Rs <number>" or similar to see what's left
    name = part.replace(/Rs\.?\s*\d+/i, '').trim();
  }
  
  name = name.replace(/\\/g, '').replace(/\s+/g, ' ').trim();
  
  return { name: name || defaultName || null, price };
}

function parseVariantsAndPrices(variantNameStr, sellingPriceStr) {
  const variants = [];
  if (!sellingPriceStr) {
    return [{ name: variantNameStr || null, price: 0 }];
  }
  
  variantNameStr = (variantNameStr || '').trim();
  // Replace the common Indian price suffix "/-" with just empty string
  sellingPriceStr = (sellingPriceStr || '').replace(/\/\-/g, '').trim();
  
  // Split on commas, semicolons, or slashes (e.g. 100g - Rs 149 / 250g - Rs 299)
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

// Custom Markdown Table parser
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

function parseDocx(filePath) {
  const tempDir = path.join(__dirname, '../.temp_docx_extract');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
  execSync(`tar -xf "${filePath}" -C "${tempDir}" word/document.xml`);
  const xmlPath = path.join(tempDir, 'word/document.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  
  fs.rmSync(tempDir, { recursive: true, force: true });
  
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
}

files.forEach(file => {
  const filePath = path.join(importDir, file);
  const buf = fs.readFileSync(filePath).subarray(0, 4);
  const isDocx = buf.toString('hex') === '504b0304';
  
  let productData = {};
  if (isDocx) {
    productData = parseDocx(filePath);
  } else {
    productData = parseMarkdownTable(fs.readFileSync(filePath, 'utf8'));
  }
  
  const name = productData["Product Name"] || productData["Product Name "] || "N/A";
  const cat = productData["Category (Face Cream / Face Wash / Soap / Nalangu Maavu)"] || "N/A";
  const variants = parseVariantsAndPrices(
    productData["Variant Name (Size/Type e.g., 50g, Rose, Turmeric)"],
    productData["Selling Price"]
  );
  
  console.log(`File: ${file}`);
  console.log(`  Name: ${name}`);
  console.log(`  Category: ${cat}`);
  console.log(`  Variants extracted:`, JSON.stringify(variants));
  console.log('----------------------------------------------------');
});
