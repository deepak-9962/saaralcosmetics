/**
 * insert-butterfly-pea-soap.js
 * Inserts the Butterfly Pea Soap (Sangoo Poo) into Supabase.
 */

const SUPABASE_URL = "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4ODc1MiwiZXhwIjoyMDk0MjY0NzUyfQ.iX_EpcCIW2PGQ_LrOBCuNguC0c3kyP844VFyu7OzX58";

const product = {
  name: "Butterfly Pea Soap (Sangoo Poo)",
  slug: "butterfly-pea-soap-sangoo-poo",
  category: "soap",
  variant_name: "100g",
  price: 120,
  compare_price: null,
  description:
    "Revive your skin with the ultimate antioxidant refresh. Glow naturally with our premium, handcrafted Butterfly Pea Soap. Made using the traditional cold-processed method, this luxurious bar infuses youth-boosting Butterfly Pea extract (Sangoo Poo) into a deeply nourishing base of Cold-Pressed Coconut, Castor, and Olive oils. Rich in natural Glycerin and Vitamin E, it gently cleanses away impurities while fighting skin dullness and protecting your skin's natural moisture barrier. Experience a creamy, skin-loving lather that leaves your body feeling velvety soft, completely refreshed, and radiantly healthy. Best For: Anti-Aging Support, Skin Glow & Deep Hydration. Skin Type: Perfect for all skin types, especially tired or dull skin.",
  ingredients:
    "Cold-Pressed Coconut Oil, Cold-Pressed Castor Oil, Olive Oil, Demineralized Water, Lye, Natural Glycerine, Butterfly Pea Extract, Vitamin E Oil, Premium Essential Oil.",
  how_to_use:
    "Rub the soap bar between wet palms or directly onto your body to create a rich, creamy lather. Gently massage onto your skin in circular motions. Rinse thoroughly with water and pat dry. Pro-Tip: To make your handcrafted soap last longer, keep it in a well-drained soap dish between uses.",
  images: [],
  stock: 100,
  is_active: true,
};

async function insertProduct() {
  const url = new URL("/rest/v1/products", SUPABASE_URL);
  const res = await fetch(url.toString(), {
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
    console.error("❌ Failed:", err);
    process.exit(1);
  }

  const data = await res.json();
  console.log("✅ Product inserted successfully into Supabase!");
  console.log("   ID  :", data[0]?.id);
  console.log("   Name:", data[0]?.name);
  console.log("   Slug:", data[0]?.slug);
  console.log("   Cat :", data[0]?.category);
  console.log("   Price: ₹" + data[0]?.price);
}

insertProduct();
