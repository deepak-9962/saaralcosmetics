/**
 * update-all-products-structured.js
 * Rewrites description, ingredients, and how_to_use for all 17 products
 * into clean, short bullet-point format, then pushes to Supabase.
 */

const SUPABASE_URL = "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY4ODc1MiwiZXhwIjoyMDk0MjY0NzUyfQ.iX_EpcCIW2PGQ_LrOBCuNguC0c3kyP844VFyu7OzX58";

// ─────────────────────────────────────────────────────────────
// STRUCTURED PRODUCT DATA
// Each product has: slug, description (bullet points), ingredients (bullet), how_to_use (bullet)
// ─────────────────────────────────────────────────────────────
const updates = [

  // ── SOAPS ────────────────────────────────────────────────────

  {
    slug: "activated-charcoal-soap",
    description: `• Deep-cleansing charcoal bar that draws out impurities, excess oil & toxins
• Cold-processed to preserve all natural nutrients
• Creates a rich lather that detoxifies without stripping skin
• Helps unclog pores and prevent breakouts
• Leaves skin feeling fresh, soft, and deeply clean
• Suitable for face & body use
• 100g handcrafted bar`,
    ingredients: `• Activated Charcoal
• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet skin with water
• Rub bar between palms to build a lather
• Massage gently onto face or body in circular motions
• Leave lather for 30–60 seconds for deeper cleanse
• Rinse thoroughly with water
• Pat dry gently
• Store in a well-drained soap dish between uses`,
  },

  {
    slug: "butterfly-pea-soap-sangoo-poo",
    description: `• Handcrafted with antioxidant-rich Butterfly Pea (Sangoo Poo) extract
• Traditional cold-processed soap — preserves 100% natural nutrients
• Fights skin dullness and boosts natural glow
• Creamy lather from Coconut, Castor & Olive oils
• Locks in moisture with Glycerin & Vitamin E
• Free from SLS, sulfates & harsh chemicals
• Best for: Anti-Aging, Skin Glow & Deep Hydration
• Suitable for all skin types`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Butterfly Pea Extract
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet palms or body with water
• Rub bar to create a rich, creamy lather
• Massage gently onto skin in circular motions
• Rinse thoroughly with water
• Pat dry gently
• Store in a well-drained soap dish to extend life`,
  },

  {
    slug: "kuppaimeni-soap",
    description: `• Formulated with Kuppaimeni (Acalypha indica) — a powerful Siddha herb
• Soothes skin irritation, itching & inflammation naturally
• Cold-processed to retain full herbal potency
• Gentle lather from Coconut, Castor & Olive oils
• Enriched with Neem Oil for antibacterial protection
• Natural Glycerin & Vitamin E keep skin moisturised
• Best for: Skin Irritation, Itching Relief & Purification
• Suitable for sensitive & problem-prone skin`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Kuppaimeni Extract
• Neem Oil
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet skin with water
• Rub bar between palms to form a lather
• Massage gently onto affected or general body areas
• Let lather sit for 1–2 minutes for best effect
• Rinse thoroughly with water
• Pat dry gently
• Store in a dry, well-drained soap dish`,
  },

  {
    slug: "manjistha-athimadhuram-soap",
    description: `• Powered by Manjistha & Athimadhuram (Licorice Root) — Ayurvedic brightening herbs
• Fades dark spots, pigmentation & uneven skin tone
• Anti-inflammatory and skin-purifying properties
• Cold-processed to preserve all herbal nutrients
• Creamy lather from Coconut, Castor & Olive oils
• Suitable for daily use on face & body
• Best for: Brightening, Pigmentation & Clear Skin`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Manjistha Extract
• Athimadhuram (Licorice Root) Extract
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet skin with water
• Rub bar to create a rich lather
• Massage onto face or body in gentle circular motions
• Rinse thoroughly with water
• Pat dry
• Use daily for best brightening results
• Keep in a well-drained soap dish between uses`,
  },

  {
    slug: "nalangu-maavu-soap",
    description: `• Traditional South Indian herbal bath soap with classic Nalangu Maavu blend
• Gently exfoliates dead skin cells for a radiant glow
• Brightens skin tone naturally with herbal actives
• Leaves a natural, calming herbal fragrance
• Rich, creamy lather — gentle enough for daily use
• No harsh chemicals or synthetic fragrances
• Best for: Brightening, Exfoliation & Skin Nourishment`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Nalangu Maavu Powder (Green Gram, Turmeric, Rose Petal, Sandalwood)
• Kasturi Manjal
• Vitamin E Oil`,
    how_to_use: `• Wet skin with water
• Rub bar to form a gentle herbal lather
• Massage onto body in circular motions
• Rinse well with water
• Pat dry
• Store in a well-drained soap dish`,
  },

  {
    slug: "redwine-soap",
    description: `• Enriched with Red Wine Extract — packed with skin-reviving antioxidants
• Fights free radicals and signs of aging
• Improves skin elasticity and texture
• Cold-processed to preserve all natural nutrients
• Creamy lather from Coconut, Castor & Olive oils
• Moisturising Glycerin & Vitamin E prevent dryness
• Best for: Anti-Aging, Glow & Skin Rejuvenation
• Suitable for all skin types`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Red Wine Extract
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet skin with water
• Rub bar to create a creamy lather
• Massage gently onto face or body
• Rinse thoroughly with water
• Pat dry
• Store in a well-drained soap dish`,
  },

  {
    slug: "vetpalai-soap",
    description: `• Therapeutic herbal soap with potent Vetpalai (Wrightia tinctoria) extract
• Calms severe itching, allergies & skin irritation
• Targets fungal infections and chronic skin conditions
• Multi-herb blend: Vetpalai, Neem, Thulasi, Kuppaimeni & more
• Cold-processed — full herbal potency preserved
• Gentle lather that won't disturb skin's natural pH
• Best for: Psoriasis Relief, Eczema, Fungal Infections & Itching
• Ideal for sensitive & problem-prone skin`,
    ingredients: `• Cold-Pressed Coconut Oil
• Cold-Pressed Castor Oil
• Olive Oil
• Demineralized Water
• Lye
• Natural Glycerine
• Vetpalai Extract
• Neem
• Thulasi (Holy Basil)
• Seemai Agathi
• Pungan Leaves
• Kuppaimeni
• Poovarasu Leaves
• Vitamin E Oil
• Premium Essential Oil`,
    how_to_use: `• Wet skin with water
• Rub bar to form a rich herbal lather
• Massage gently onto affected or general body areas
• Leave lather on skin for 1–2 minutes for therapeutic effect
• Rinse thoroughly with clean water
• Pat dry gently
• Store in a well-drained soap dish between uses`,
  },

  // ── FACE WASH ────────────────────────────────────────────────

  {
    slug: "butterfly-pea-facewash-sangoo-poo",
    description: `• Sulfate-free gel face wash with Butterfly Pea (Sangoo Poo) extract
• Rich in antioxidants — fights dullness & promotes radiance
• Lavender Essential Oil calms redness and irritation
• Plant-based cleansers (Decyl & Coco Glucoside) — no harsh chemicals
• Deeply purifies pores without drying the skin
• Glycerin locks in moisture after every wash
• Best for: Skin Glow, Anti-Aging & Daily Calming Cleanse
• Suitable for all skin types, especially sensitive skin`,
    ingredients: `• Distilled Water
• Butterfly Pea Extract
• Glycerin
• Decyl Glucoside
• Coco Glucoside
• Xanthan Gum (natural thickener)
• Lavender Essential Oil
• Red Wine Essential Oil
• Safe Preservative`,
    how_to_use: `• Splash face with water
• Take a small amount on palms and work into a lather
• Massage onto face in circular motions for 30–60 seconds
• Focus on dull or pigmented areas
• Rinse thoroughly with water
• Pat dry
• Use morning & night for best results`,
  },

  {
    slug: "redwine-facewash",
    description: `• Antioxidant-rich face wash with Red Wine Extract
• Rejuvenates and brightens dull, tired skin
• Sulfate-free — gentle on all skin types
• Plant-based cleansers for a soft, luxurious foam
• Deeply cleanses pores without over-drying
• Glycerin keeps skin hydrated post-wash
• Best for: Dullness, Glow & Anti-Aging Cleanse
• Suitable for all skin types`,
    ingredients: `• Distilled Water
• Red Wine Extract
• Glycerin
• Decyl Glucoside
• Coco Glucoside
• Xanthan Gum (natural thickener)
• Safe Preservative`,
    how_to_use: `• Wet face with water
• Apply a small amount on palms and lather
• Massage gently onto face in circular motions
• Rinse thoroughly with water
• Pat dry
• Use morning & night for best results`,
  },

  // ── NALANGU MAAVU ────────────────────────────────────────────

  {
    slug: "nalangu-maavu-bath-powder-100g",
    description: `• Traditional South Indian herbal bath powder — a royal bathing ritual
• Gently exfoliates dead skin cells for smooth, bright skin
• Natural blend of herbs: Green Gram, Turmeric, Sandalwood & more
• No chemicals — 100% natural & plant-based
• Leaves skin soft, glowing & naturally fragrant
• Can be mixed with water, milk or rose water
• Available in 100g pack
• Best for: Brightening, Exfoliation & Skin Nourishment`,
    ingredients: `• Green Gram Flour (Payaru Maavu)
• Turmeric Powder
• Rose Petal Powder
• Sandalwood Powder
• Kasturi Manjal
• Vetiver Root (Vettiver)
• Neem Powder`,
    how_to_use: `• Mix 2–3 tablespoons with water or milk to form a smooth paste
• Apply evenly to face and body
• Gently scrub in circular motions
• Leave for 2–3 minutes (optional)
• Rinse off thoroughly with water
• Pat dry for silky smooth skin
• Use 2–3 times a week`,
  },

  {
    slug: "nalangu-maavu-bath-powder-250g",
    description: `• Traditional South Indian herbal bath powder — a royal bathing ritual
• Gently exfoliates dead skin cells for smooth, bright skin
• Natural blend of herbs: Green Gram, Turmeric, Sandalwood & more
• No chemicals — 100% natural & plant-based
• Leaves skin soft, glowing & naturally fragrant
• Can be mixed with water, milk or rose water
• Available in 250g value pack
• Best for: Brightening, Exfoliation & Skin Nourishment`,
    ingredients: `• Green Gram Flour (Payaru Maavu)
• Turmeric Powder
• Rose Petal Powder
• Sandalwood Powder
• Kasturi Manjal
• Vetiver Root (Vettiver)
• Neem Powder`,
    how_to_use: `• Mix 2–3 tablespoons with water or milk to form a smooth paste
• Apply evenly to face and body
• Gently scrub in circular motions
• Leave for 2–3 minutes (optional)
• Rinse off thoroughly with water
• Pat dry for silky smooth skin
• Use 2–3 times a week`,
  },

  // ── FACE CREAM / BALM ────────────────────────────────────────

  {
    slug: "saaral-anti-aging-pigmentation-cream-15g",
    description: `• Potent anti-aging & de-pigmentation cream with Ayurvedic herbs
• Fades dark spots, pigmentation & uneven skin tone
• Reduces fine lines and restores skin elasticity
• Key herbs: Thiruneetru Pachillai, Athimadhuram, Manjistha & Neem
• Lightweight texture — absorbs quickly without greasiness
• Enriched with Shea Butter & Almond Oil for deep nourishment
• Best used as a night cream for maximum results
• Available in 15g pack
• Best for: Anti-Aging, Pigmentation & Radiance`,
    ingredients: `• Aqua
• Cold-Pressed Coconut Oil
• Almond Oil
• Raw Shea Butter
• Emulsifying Wax (e-Wax)
• Thiruneetru Pachillai Extract
• Athimadhuram (Licorice)
• Manjistha
• Neem Extract
• Basil Essential Oil
• Butterfly Pea Extract`,
    how_to_use: `• Cleanse face with a mild face wash
• Apply a small amount to face and neck
• Massage in upward, circular motions
• Focus on pigmented areas or fine lines
• Use as a night cream before bed for best results
• Follow with sunscreen in the morning`,
  },

  {
    slug: "saaral-anti-aging-pigmentation-cream-30g",
    description: `• Potent anti-aging & de-pigmentation cream with Ayurvedic herbs
• Fades dark spots, pigmentation & uneven skin tone
• Reduces fine lines and restores skin elasticity
• Key herbs: Thiruneetru Pachillai, Athimadhuram, Manjistha & Neem
• Lightweight texture — absorbs quickly without greasiness
• Enriched with Shea Butter & Almond Oil for deep nourishment
• Best used as a night cream for maximum results
• Available in 30g pack — better value
• Best for: Anti-Aging, Pigmentation & Radiance`,
    ingredients: `• Aqua
• Cold-Pressed Coconut Oil
• Almond Oil
• Raw Shea Butter
• Emulsifying Wax (e-Wax)
• Thiruneetru Pachillai Extract
• Athimadhuram (Licorice)
• Manjistha
• Neem Extract
• Basil Essential Oil
• Butterfly Pea Extract`,
    how_to_use: `• Cleanse face with a mild face wash
• Apply a small amount to face and neck
• Massage in upward, circular motions
• Focus on pigmented areas or fine lines
• Use as a night cream before bed for best results
• Follow with sunscreen in the morning`,
  },

  {
    slug: "saaral-skin-whitening-cream-15g",
    description: `• Ayurvedic brightening cream for a luminous, even complexion
• Fades dark spots and reduces pigmentation naturally
• Key herbs: Athimadhuram (Licorice), Manjistha, Turmeric & Blue Lotus
• Orange Peel gently exfoliates for instant brightness
• Sandalwood smooths skin texture & clears blemishes
• Rich base of Shea Butter, Coconut & Almond Oil — non-greasy
• Suitable for face & body use
• Available in 15g pack
• Best for: Brightening, Even Skin Tone & Deep Hydration`,
    ingredients: `• Aqua
• Cold-Pressed Coconut Oil
• Almond Oil
• Raw Shea Butter
• Emulsifying Wax
• Blue Lotus Extract
• Rose Petal Powder
• Athimadhuram (Licorice)
• Manjistha
• Orange Peel Powder
• Sandalwood Powder
• Turmeric`,
    how_to_use: `• Cleanse face with a mild cleanser
• Take a pea-sized amount
• Dot gently across face and neck
• Massage in upward, circular motions until absorbed
• Use morning and night for best results
• No rinsing required`,
  },

  {
    slug: "saaral-skin-whitening-cream-30g",
    description: `• Ayurvedic brightening cream for a luminous, even complexion
• Fades dark spots and reduces pigmentation naturally
• Key herbs: Athimadhuram (Licorice), Manjistha, Turmeric & Blue Lotus
• Orange Peel gently exfoliates for instant brightness
• Sandalwood smooths skin texture & clears blemishes
• Rich base of Shea Butter, Coconut & Almond Oil — non-greasy
• Suitable for face & body use
• Available in 30g pack — better value
• Best for: Brightening, Even Skin Tone & Deep Hydration`,
    ingredients: `• Aqua
• Cold-Pressed Coconut Oil
• Almond Oil
• Raw Shea Butter
• Emulsifying Wax
• Blue Lotus Extract
• Rose Petal Powder
• Athimadhuram (Licorice)
• Manjistha
• Orange Peel Powder
• Sandalwood Powder
• Turmeric`,
    how_to_use: `• Cleanse face with a mild cleanser
• Take a pea-sized amount
• Dot gently across face and neck
• Massage in upward, circular motions until absorbed
• Use morning and night for best results
• No rinsing required`,
  },

  {
    slug: "advanced-foot-repair-balm",
    description: `• Intensive healing balm for cracked heels & extremely dry feet
• Deeply moisturises and softens hardened skin overnight
• Peppermint & Tea Tree Oil cool and refresh tired feet
• Vetiver Extract soothes and repairs damaged skin
• Rich base of Shea Butter, Beeswax & Coconut Oil
• Vitamin E boosts skin regeneration
• Available in 50g jar
• Best for: Cracked Heels, Dry Skin & Foot Repair`,
    ingredients: `• Shea Butter
• Beeswax
• Cold-Pressed Coconut Oil
• Vetiver Extract
• Peppermint Oil
• Tea Tree Oil
• Vitamin E Oil`,
    how_to_use: `• Clean feet thoroughly and pat dry
• Apply a generous amount to heels and dry areas
• Massage well until absorbed
• Wear cotton socks overnight for deep repair
• Use daily until cracked heels heal
• Maintain with 2–3 times per week thereafter`,
  },

  {
    slug: "advanced-vetpalai-itching-balm",
    description: `• Powerful anti-itch balm with traditional Vetpalai (Wrightia tinctoria) extract
• Provides fast relief from chronic itching, redness & irritation
• Targets eczema, psoriasis & allergic skin reactions
• Camphor delivers instant cooling and soothing sensation
• Neem Oil adds antibacterial & antifungal protection
• Shea Butter & Coconut Oil nourish and repair skin barrier
• Available in 50g jar
• Best for: Itching Relief, Eczema, Psoriasis & Skin Allergies`,
    ingredients: `• Vetpalai Extract
• Neem Oil
• Camphor
• Cold-Pressed Coconut Oil
• Shea Butter
• Beeswax
• Vitamin E Oil
• Natural Fragrance`,
    how_to_use: `• Clean the affected area and pat dry
• Apply a small amount of balm to the itching area
• Massage gently until absorbed
• Repeat 2–3 times daily or as needed
• For external use only
• Keep away from eyes`,
  },
];

// ─────────────────────────────────────────────────────────────
// UPDATE FUNCTION
// ─────────────────────────────────────────────────────────────
async function updateProduct(slug, description, ingredients, how_to_use) {
  const url = new URL("/rest/v1/products", SUPABASE_URL);
  url.searchParams.set("slug", `eq.${slug}`);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ description, ingredients, how_to_use }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ ${slug}: ${err}`);
    return false;
  }
  return true;
}

async function main() {
  console.log(`Updating ${updates.length} products...\n`);
  let success = 0;
  let fail = 0;

  for (const p of updates) {
    const ok = await updateProduct(p.slug, p.description, p.ingredients, p.how_to_use);
    if (ok) {
      console.log(`  ✅ ${p.slug}`);
      success++;
    } else {
      fail++;
    }
  }

  console.log(`\nDone! ✅ ${success} updated  ❌ ${fail} failed`);
}

main();
