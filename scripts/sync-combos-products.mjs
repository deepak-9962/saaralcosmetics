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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path, options = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("Fetching combos category...");
  const categories = await api("categories?slug=eq.combos&select=id");
  const combosCatId = categories[0]?.id || null;
  console.log("Combos category id:", combosCatId);

  console.log("Fetching all combos from combos table...");
  const combos = await api("combos?select=*,combo_items(*,products(*))");
  console.log(`Found ${combos.length} combos.`);

  for (const c of combos) {
    console.log(`\nSyncing combo: ${c.name} (${c.slug})...`);
    
    // Gather all images: primary combo image + images of included products
    const images = [c.image_url];
    if (Array.isArray(c.combo_items)) {
      for (const item of c.combo_items) {
        if (item.products?.images) {
          for (const img of item.products.images) {
            if (img && !images.includes(img)) {
              images.push(img);
            }
          }
        }
      }
    }

    // Upsert into products table
    const prodPayload = {
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: "combos",
      category_id: combosCatId,
      variant_name: "Combo Pack",
      price: c.price,
      compare_price: c.compare_price || null,
      description: c.description,
      images,
      stock: 50,
      is_active: true, // Activate combos so detail pages are visible
      updated_at: new Date().toISOString(),
    };

    const upsertRes = await api("products", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(prodPayload),
    });
    console.log("  ✅ Upserted into products table.");

    // Update combos table to active as well
    await api(`combos?id=eq.${c.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: true, updated_at: new Date().toISOString() }),
    });
    console.log("  ✅ Activated in combos table.");

    // Clear old conflicting product_images and insert correct combo images
    await api(`product_images?product_id=eq.${c.id}`, {
      method: "DELETE",
    });

    const piRows = images.map((url, idx) => {
      let image_path = url.includes("/product-images/")
        ? url.split("/product-images/")[1]
        : `combos/${c.id}-${idx}.webp`;
      return {
        product_id: c.id,
        image_url: url,
        image_path,
        display_order: idx,
        alt_text: idx === 0 ? `${c.name} — Full Ritual Set` : `${c.name} — Included Item ${idx}`,
      };
    });

    await api("product_images", {
      method: "POST",
      body: JSON.stringify(piRows),
    });
    console.log(`  ✅ Registered ${piRows.length} gallery images in product_images.`);
  }

  console.log("\n✨ All combos synchronized successfully!");
}

main().catch(console.error);
