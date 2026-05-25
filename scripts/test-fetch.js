const fs = require('fs');
const path = require('path');

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
  console.error('Error: Supabase URL or Key not found.');
  process.exit(1);
}

if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

async function run() {
  console.log('Fetching products from Supabase...');
  try {
    const url = `${supabaseUrl}/rest/v1/products?select=*`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const products = await response.json();
    console.log(`\x1b[32m%s\x1b[0m`, `Successfully retrieved ${products.length} products from the database:`);
    products.forEach((p, idx) => {
      console.log(`  ${idx + 1}. Name: "${p.name}" | Variant: ${p.variant_name} | Price: Rs ${p.price} | Category: ${p.category} | Slug: ${p.slug}`);
    });
  } catch (err) {
    console.error('Failed to fetch products:', err.message || err);
  }
}

run();
