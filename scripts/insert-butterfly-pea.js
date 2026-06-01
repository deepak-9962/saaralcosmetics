/**
 * insert-butterfly-pea.js
 * Inserts the Butterfly Pea Facewash (Sangoo Poo) product into Supabase.
 * Run with: node scripts/insert-butterfly-pea.js
 */

const SUPABASE_URL = "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4ODc1MiwiZXhwIjoyMDk0MjY0NzUyfQ.iX_EpcCIW2PGQ_LrOBCuNguC0c3kyP844VFyu7OzX58";

const product = {
  name: "Butterfly Pea Facewash (Sangoo Poo)",
  slug: "butterfly-pea-facewash-sangoo-poo",
  category: "face-wash",
  variant_name: "100g",
  price: 349,
  compare_price: null,
  description:
    "Wash away stress and reveal a radiant complexion. Immerse your skin in the calming luxury of our sulfate-free Butterfly Pea & Lavender Face Wash. Powered by antioxidant-rich Butterfly Pea extract and infused with an ultra-gentle, plant-derived cleansing base of Coco and Decyl Glucosides, this soothing gel deeply purifies pores without drying your skin. Perfect for restoring natural elasticity, fading dullness, and calming redness, it leaves your face feeling wonderfully soft, refreshed, and youthfully glowing. Best For: Skin Glow, Anti-Aging Support & Calming Daily Cleansing. Skin Type: Suitable for all skin types, especially sensitive, dull, or tired skin.",
  ingredients:
    "Distilled Water, Butterfly Pea Extract, Glycerin, Decyl Glucoside, Coco Glucoside, Xanthan Gum (natural thickener), Red Wine Essential Oil, Safe Preservative.",
  how_to_use:
    "Splash your face with water. Take a small amount of the gel cleanser onto your palms and work into a gentle lather. Massage onto your face in circular motions for 30–60 seconds, focusing on areas with dullness or pigmentation. Rinse thoroughly with water and pat dry. Use twice daily (Morning & Night) for a flawless, radiant look.",
  images: [],
  stock: 50,
  is_active: true,
};

async function insertProduct() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Failed to insert product:", err);
    process.exit(1);
  }

  const data = await res.json();
  console.log("✅ Product inserted successfully!");
  console.log("   ID  :", data[0]?.id);
  console.log("   Name:", data[0]?.name);
  console.log("   Slug:", data[0]?.slug);
}

insertProduct();
