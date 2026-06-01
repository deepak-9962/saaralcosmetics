/**
 * fetch-all-products-full.js
 * Fetches ALL products ordered by newest first and prints full detail.
 */

const SUPABASE_URL = "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4ODc1MiwiZXhwIjoyMDk0MjY0NzUyfQ.iX_EpcCIW2PGQ_LrOBCuNguC0c3kyP844VFyu7OzX58";

async function main() {
  const url = new URL("/rest/v1/products", SUPABASE_URL);
  url.searchParams.set(
    "select",
    "id,name,slug,category,variant_name,price,compare_price,stock,is_active,images,description,ingredients,how_to_use"
  );
  url.searchParams.set("order", "created_at.desc");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  const data = await res.json();
  console.log(`Total products in Supabase: ${data.length}\n`);
  data.forEach((p, i) => {
    console.log(`--- Product ${i + 1} ---`);
    console.log(`  Name       : ${p.name}`);
    console.log(`  Slug       : ${p.slug}`);
    console.log(`  Category   : ${p.category}`);
    console.log(`  Variant    : ${p.variant_name}`);
    console.log(`  Price      : ₹${p.price}`);
    console.log(`  Stock      : ${p.stock}`);
    console.log(`  Active     : ${p.is_active}`);
    console.log(`  Images     : ${JSON.stringify(p.images)}`);
    console.log(`  Description: ${(p.description || "").substring(0, 80)}...`);
    console.log("");
  });
}

main();
