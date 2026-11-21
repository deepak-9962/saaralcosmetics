import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function query(table, select = "*") {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  const prods = await query("products", "id,name,variant_name,category,is_active");
  const cats = [...new Set(prods.map((p) => p.category))];
  console.log("Categories in products table:", cats);

  const combosInProducts = prods.filter((p) => p.category === "combos" || p.name.toLowerCase().includes("combo"));
  console.log("Combo-like products in products table:", combosInProducts);

  const combos = await query("combos", "id,name,is_active");
  console.log("Combos in combos table:", combos);
}

main().catch(console.error);
