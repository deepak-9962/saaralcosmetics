import type { Product } from "./types";

// Mock products — mirrors the real Supabase product catalog.
// Used as fallback when Supabase is unavailable.
export const MOCK_PRODUCTS: Product[] = [
  // ── FACE WASH ──────────────────────────────────────────────
  {
    id: "prod-fw-001",
    name: "Butterfly Pea Facewash (Sangoo Poo)",
    slug: "butterfly-pea-facewash-sangoo-poo",
    category: "face-wash",
    variant_name: "100g",
    price: 349,
    compare_price: null,
    description:
      "Wash away stress and reveal a radiant complexion. Immerse your skin in the calming luxury of our sulfate-free Butterfly Pea & Lavender Face Wash. Powered by antioxidant-rich Butterfly Pea extract and infused with an ultra-gentle, plant-derived cleansing base of Coco and Decyl Glucosides, this soothing gel deeply purifies pores without drying your skin. Perfect for restoring natural elasticity, fading dullness, and calming redness — it leaves your face feeling wonderfully soft, refreshed, and youthfully glowing. Best For: Skin Glow, Anti-Aging Support & Calming Daily Cleansing.",
    ingredients:
      "Distilled Water, Butterfly Pea Extract, Glycerin, Decyl Glucoside, Coco Glucoside, Xanthan Gum (natural thickener), Red Wine Essential Oil, Safe Preservative.",
    how_to_use:
      "Splash your face with water. Take a small amount of the gel cleanser onto your palms and work into a gentle lather. Massage onto your face in circular motions for 30–60 seconds, focusing on areas with dullness or pigmentation. Rinse thoroughly with water and pat dry. Use twice daily (Morning & Night) for a flawless, radiant look.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fw-002",
    name: "Redwine Facewash",
    slug: "redwine-facewash",
    category: "face-wash",
    variant_name: "100g",
    price: 349,
    compare_price: null,
    description:
      "A luxurious, antioxidant-rich face wash infused with Red Wine extract. Gently cleanses while fighting free radicals, improving skin tone, and leaving your face deeply hydrated and radiant.",
    ingredients:
      "Distilled Water, Red Wine Extract, Glycerin, Decyl Glucoside, Coco Glucoside, Xanthan Gum, Safe Preservative.",
    how_to_use:
      "Wet face with water. Apply a small amount and massage gently in circular motions. Rinse thoroughly. Pat dry. Use morning and night.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── SOAP ────────────────────────────────────────────────────
  {
    id: "prod-sp-001",
    name: "Activated Charcoal Soap",
    slug: "activated-charcoal-soap",
    category: "soap",
    variant_name: "100g",
    price: 120,
    compare_price: null,
    description:
      "A deep-cleansing activated charcoal soap that draws out impurities, excess oil, and toxins from pores. Handcrafted for a luxurious detox bathing experience.",
    ingredients:
      "Activated Charcoal, Coconut Oil, Palm Oil, Castor Oil, Shea Butter, Essential Oils.",
    how_to_use:
      "Lather between wet hands. Apply to face and body, massage gently. Rinse well with water.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "57e5ced3-f9c4-4eb2-8aa8-50f914937c04",
    name: "Butterfly Pea Soap (Sangoo Poo)",
    slug: "butterfly-pea-soap-sangoo-poo",
    category: "soap",
    variant_name: "100g",
    price: 120,
    compare_price: null,
    description:
      "Revive your skin with the ultimate antioxidant refresh. Glow naturally with our premium, handcrafted Butterfly Pea Soap. Made using the traditional cold-processed method, this luxurious bar infuses youth-boosting Butterfly Pea extract (Sangoo Poo) into a deeply nourishing base of Cold-Pressed Coconut, Castor, and Olive oils. Rich in natural Glycerin and Vitamin E, it gently cleanses away impurities while fighting skin dullness and protecting your skin's natural moisture barrier. Best For: Anti-Aging Support, Skin Glow & Deep Hydration.",
    ingredients:
      "Cold-Pressed Coconut Oil, Cold-Pressed Castor Oil, Olive Oil, Demineralized Water, Lye, Natural Glycerine, Butterfly Pea Extract, Vitamin E Oil, Premium Essential Oil.",
    how_to_use:
      "Rub the soap bar between wet palms or directly onto your body to create a rich, creamy lather. Gently massage onto your skin in circular motions. Rinse thoroughly with water and pat dry. Pro-Tip: To make your handcrafted soap last longer, keep it in a well-drained soap dish between uses.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-sp-002",
    name: "Nalangu Maavu Soap",
    slug: "nalangu-maavu-soap",
    category: "soap",
    variant_name: "100g",
    price: 120,
    compare_price: null,
    description:
      "A traditional South Indian herbal bath soap made with the classic Nalangu Maavu blend. Gently exfoliates, brightens skin, and leaves a natural herbal fragrance.",
    ingredients:
      "Nalangu Maavu Powder, Green Gram, Turmeric, Rose Petal, Sandalwood, Coconut Oil.",
    how_to_use:
      "Wet skin, lather the soap and apply gently. Massage in circular motions. Rinse thoroughly.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-sp-003",
    name: "Kuppaimeni Soap",
    slug: "kuppaimeni-soap",
    category: "soap",
    variant_name: "100g",
    price: 150,
    compare_price: null,
    description:
      "Kuppaimeni (Acalypha indica) has been used for centuries in Indian herbal medicine to treat skin conditions. This handcrafted soap soothes itching, reduces inflammation, and purifies skin naturally.",
    ingredients:
      "Kuppaimeni Extract, Neem Oil, Coconut Oil, Castor Oil, Shea Butter, Natural Fragrance.",
    how_to_use:
      "Lather and apply to affected or general body areas. Massage gently and rinse thoroughly with water.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-sp-004",
    name: "Manjistha Athimadhuram Soap",
    slug: "manjistha-athimadhuram-soap",
    category: "soap",
    variant_name: "100g",
    price: 150,
    compare_price: null,
    description:
      "Manjistha & Athimadhuram (Licorice Root) are powerful Ayurvedic herbs known for brightening, anti-inflammatory, and skin-purifying properties. This soap helps fade pigmentation and even skin tone.",
    ingredients:
      "Manjistha Extract, Athimadhuram Extract, Coconut Oil, Palm Oil, Shea Butter, Essential Oils.",
    how_to_use:
      "Lather between wet hands. Apply to face and body gently. Rinse thoroughly. Use daily for best results.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-sp-005",
    name: "Redwine Soap",
    slug: "redwine-soap",
    category: "soap",
    variant_name: "100g",
    price: 150,
    compare_price: null,
    description:
      "A luxurious handcrafted soap enriched with Red Wine extract, packed with antioxidants that fight signs of aging, improve skin elasticity, and give a radiant glow.",
    ingredients:
      "Red Wine Extract, Coconut Oil, Olive Oil, Castor Oil, Shea Butter, Natural Fragrance.",
    how_to_use:
      "Wet skin, lather the soap and apply gently. Massage in circular motions. Rinse thoroughly with water.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-sp-006",
    name: "Vetpalai Soap",
    slug: "vetpalai-soap",
    category: "soap",
    variant_name: "100g",
    price: 180,
    compare_price: null,
    description:
      "Vetpalai (Wrightia tinctoria) is a powerful Ayurvedic herb traditionally used to treat skin disorders including psoriasis and eczema. This natural soap deeply soothes and heals irritated skin.",
    ingredients:
      "Vetpalai Extract, Neem Oil, Coconut Oil, Castor Oil, Shea Butter, Natural Fragrance.",
    how_to_use:
      "Lather and apply to affected areas or general body. Massage gently and rinse thoroughly with water.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── NALANGU MAAVU ───────────────────────────────────────────
  {
    id: "prod-nm-001",
    name: "Nalangu Maavu Bath Powder",
    slug: "nalangu-maavu-bath-powder-100g",
    category: "nalangu-maavu",
    variant_name: "100g",
    price: 149,
    compare_price: null,
    description:
      "A traditional South Indian herbal bath powder made from a blend of finely milled herbs and grains. Gently exfoliates, brightens, and nourishes the skin — a timeless pre-bath ritual.",
    ingredients:
      "Green Gram Flour, Turmeric, Rose Petal Powder, Sandalwood Powder, Kasturi Manjal, Vetiver Root.",
    how_to_use:
      "Mix 2–3 tablespoons with water or milk to form a smooth paste. Apply to body and face. Gently scrub and rinse off for silky smooth skin.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-nm-002",
    name: "Nalangu Maavu Bath Powder",
    slug: "nalangu-maavu-bath-powder-250g",
    category: "nalangu-maavu",
    variant_name: "250g",
    price: 299,
    compare_price: null,
    description:
      "A traditional South Indian herbal bath powder made from a blend of finely milled herbs and grains. Gently exfoliates, brightens, and nourishes the skin — a timeless pre-bath ritual.",
    ingredients:
      "Green Gram Flour, Turmeric, Rose Petal Powder, Sandalwood Powder, Kasturi Manjal, Vetiver Root.",
    how_to_use:
      "Mix 2–3 tablespoons with water or milk to form a smooth paste. Apply to body and face. Gently scrub and rinse off for silky smooth skin.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ── FACE CREAM / BALM ───────────────────────────────────────
  {
    id: "prod-fc-001",
    name: "Saaral Anti Aging & Pigmentation Cream",
    slug: "saaral-anti-aging-pigmentation-cream-15g",
    category: "face-cream",
    variant_name: "15g",
    price: 449,
    compare_price: null,
    description:
      "A potent anti-aging and de-pigmentation cream formulated with Ayurvedic botanicals. Targets dark spots, uneven skin tone, fine lines, and dullness — revealing visibly younger-looking, radiant skin.",
    ingredients:
      "Manjistha Extract, Licorice Root, Kumkumadi Oil, Saffron, Vitamin C, Shea Butter, Aloe Vera.",
    how_to_use:
      "Cleanse face. Apply a small amount to face and neck. Massage gently until absorbed. Use morning and night for best results.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fc-002",
    name: "Saaral Anti Aging & Pigmentation Cream",
    slug: "saaral-anti-aging-pigmentation-cream-30g",
    category: "face-cream",
    variant_name: "30g",
    price: 799,
    compare_price: null,
    description:
      "A potent anti-aging and de-pigmentation cream formulated with Ayurvedic botanicals. Targets dark spots, uneven skin tone, fine lines, and dullness — revealing visibly younger-looking, radiant skin.",
    ingredients:
      "Manjistha Extract, Licorice Root, Kumkumadi Oil, Saffron, Vitamin C, Shea Butter, Aloe Vera.",
    how_to_use:
      "Cleanse face. Apply a small amount to face and neck. Massage gently until absorbed. Use morning and night for best results.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fc-003",
    name: "Saaral Skin Whitening Cream",
    slug: "saaral-skin-whitening-cream-15g",
    category: "face-cream",
    variant_name: "15g",
    price: 449,
    compare_price: null,
    description:
      "A gentle yet effective skin brightening cream that visibly reduces pigmentation, dark spots, and uneven skin tone. Powered by natural botanical actives for a luminous, even complexion.",
    ingredients:
      "Licorice Extract, Kojic Acid, Vitamin C, Niacinamide, Aloe Vera, Shea Butter.",
    how_to_use:
      "Apply a small amount to clean skin. Massage gently until absorbed. Use morning and night. For external use only.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fc-004",
    name: "Saaral Skin Whitening Cream",
    slug: "saaral-skin-whitening-cream-30g",
    category: "face-cream",
    variant_name: "30g",
    price: 799,
    compare_price: null,
    description:
      "A gentle yet effective skin brightening cream that visibly reduces pigmentation, dark spots, and uneven skin tone. Powered by natural botanical actives for a luminous, even complexion.",
    ingredients:
      "Licorice Extract, Kojic Acid, Vitamin C, Niacinamide, Aloe Vera, Shea Butter.",
    how_to_use:
      "Apply a small amount to clean skin. Massage gently until absorbed. Use morning and night. For external use only.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fc-005",
    name: "Advanced Foot Repair Balm",
    slug: "advanced-foot-repair-balm",
    category: "face-cream",
    variant_name: "100g",
    price: 350,
    compare_price: null,
    description:
      "An intensive foot repair balm that heals cracked heels, deeply moisturizes dry skin, and restores softness. Formulated with potent botanical extracts for overnight repair.",
    ingredients:
      "Shea Butter, Beeswax, Coconut Oil, Vetiver Extract, Peppermint Oil, Tea Tree Oil, Vitamin E.",
    how_to_use:
      "Clean feet thoroughly. Apply a generous amount to heels and dry areas. Massage well. Wear cotton socks overnight for best results.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-fc-006",
    name: "Advanced Vetpalai Itching Balm",
    slug: "advanced-vetpalai-itching-balm",
    category: "face-cream",
    variant_name: "100g",
    price: 350,
    compare_price: null,
    description:
      "A powerful anti-itch balm crafted with Vetpalai (Wrightia tinctoria) extract, traditionally used to treat chronic skin conditions. Provides instant relief from itching, redness, and inflammation.",
    ingredients:
      "Vetpalai Extract, Neem Oil, Camphor, Coconut Oil, Shea Butter, Beeswax, Natural Fragrance.",
    how_to_use:
      "Apply to affected areas and massage gently. Use as needed for relief. For external use only.",
    images: [],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return MOCK_PRODUCTS.filter((p) => p.is_active);
  return MOCK_PRODUCTS.filter(
    (p) => p.category === category && p.is_active
  );
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_active).slice(0, 3);
}

export function getRelatedProducts(
  currentSlug: string,
  category: string
): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.slug !== currentSlug && p.category === category && p.is_active
  ).slice(0, 4);
}
