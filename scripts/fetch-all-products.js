/**
 * fetch-all-products.js
 * Fetches all products from Supabase and prints their key fields.
 */

const SUPABASE_URL = "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4ODc1MiwiZXhwIjoyMDk0MjY0NzUyfQ.iX_EpcCIW2PGQ_LrOBCuNguC0c3kyP844VFyu7OzX58";

async function main() {
  const url = new URL("/rest/v1/products", SUPABASE_URL);
  url.searchParams.set("select", "id,name,slug,category,price,stock,is_active");
  url.searchParams.set("order", "created_at.asc");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  const data = await res.json();
  console.log(`Total products in Supabase: ${data.length}`);
  data.forEach((p) => {
    console.log(
      `  [${p.is_active ? "✅" : "❌"}] ${p.name} | ${p.category} | ₹${p.price} | stock:${p.stock} | slug: ${p.slug}`
    );
  });
}

main();
