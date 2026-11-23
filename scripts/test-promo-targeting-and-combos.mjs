import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    env[k] = v;
  }
});

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  SAARAL COSMETICS TEST SUITE: PROMO TARGETING & COMBOS");
  console.log("=======================================================\n");

  // ── TEST 1: Admin Catalog API ──────────────────────────────────────────────
  console.log("TEST 1: Admin Catalog API (/api/admin/catalog)");
  try {
    const catRes = await fetch(`${BASE_URL}/api/admin/catalog`);
    assert(catRes.status === 200, `/api/admin/catalog returned HTTP ${catRes.status}`);
    const catData = await catRes.json();
    assert(catData.success === true, "API reports success: true");
    assert(Array.isArray(catData.products) && catData.products.length >= 25, `Returned ${catData.products?.length} products (expected >= 25)`);
    assert(Array.isArray(catData.combos) && catData.combos.length >= 3, `Returned ${catData.combos?.length} combos (expected >= 3)`);
    assert(Array.isArray(catData.categories) && catData.categories.length >= 7, `Returned ${catData.categories?.length} categories (expected >= 7)`);

    const butterflyCombo = catData.combos.find(c => c.slug === "butterfly-pea-radiant-glow-combo");
    assert(Boolean(butterflyCombo), "Butterfly Pea Combo present in combos list");
    assert(Boolean(butterflyCombo?.image_url), `Butterfly Pea Combo has image_url: ${butterflyCombo?.image_url}`);
  } catch (err) {
    assert(false, `Catalog API test crashed: ${err.message}`);
  }

  // ── TEST 2: Combo Images and Detail Page ────────────────────────────────────
  console.log("\nTEST 2: Combo Image Accessibility & Storage");
  try {
    const comboImgUrl = "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/product-images/combos/1795195227226-465c8b83-dfa4-48ed-bc24-2ac57b1df07d.webp";
    const imgCheck = await fetch(comboImgUrl, { method: "HEAD" });
    assert(imgCheck.status === 200, `Butterfly Pea Combo image returns HTTP 200 (${comboImgUrl})`);

    const redWineImgUrl = "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/product-images/combos/1795196274407-4cffce2b-193e-4aaf-947e-3dab24d7dddd.webp";
    const redWineCheck = await fetch(redWineImgUrl, { method: "HEAD" });
    assert(redWineCheck.status === 200, `Red Wine Combo image returns HTTP 200 (${redWineImgUrl})`);

    const vetpalaiImgUrl = "https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/product-images/combos/1795194553557-6272410f-9fd5-4d64-bfdd-7781a09695e9.webp";
    const vetpalaiCheck = await fetch(vetpalaiImgUrl, { method: "HEAD" });
    assert(vetpalaiCheck.status === 200, `Vetpalai Combo image returns HTTP 200 (${vetpalaiImgUrl})`);
  } catch (err) {
    assert(false, `Combo image check crashed: ${err.message}`);
  }

  // ── TEST 3: Promo Validation API — Strict Allow-List Targeting ──────────────
  console.log("\nTEST 3: Promo Code Validation API — Targeting Scopes");

  // Let's create temporary promo codes in DB to test targeting rules
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // Helper to insert a test promo code
  async function insertTestPromo(promo) {
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/promo_codes`, {
      method: "POST",
      headers,
      body: JSON.stringify(promo),
    });
    const data = await res.json();
    return Array.isArray(data) ? data[0] : null;
  }

  // Helper to delete test promo code
  async function deleteTestPromo(id) {
    await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/promo_codes?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });
  }

  // Product IDs from DB:
  const BUTTERFLY_FACEWASH_ID = "001dc7a8-1580-422f-8e06-df20ed1b89a8"; // price: 320, category: face-wash
  const REDWINE_SOAP_ID = "c9fe21b4-319c-4c0c-b233-7977bbd9da64"; // price: 150, category: soap
  const BUTTERFLY_COMBO_ID = "4d53f000-64fa-4357-9a6f-aae652d00a25"; // price: 601, category: combos

  // Subtest 3A: Category Promo (Only Face Wash)
  console.log("\n  Subtest 3A: Category Promo (applies_to: 'category', target: ['face-wash'])");
  const catPromo = await insertTestPromo({
    code: "TEST_FACEWASH_20",
    discount_type: "percentage",
    discount_value: 20,
    applies_to: "category",
    applies_to_ids: ["face-wash"],
    applies_to_id: null,
    is_active: true,
  });

  if (catPromo) {
    try {
      // Mixed Cart: 1 Face Wash (₹320) + 1 Soap (₹150)
      // Qualifying = ₹320. Discount = 20% of ₹320 = ₹64. Soap receives ₹0.
      const valRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_FACEWASH_20",
          cartItems: [
            { productId: BUTTERFLY_FACEWASH_ID, quantity: 1 },
            { productId: REDWINE_SOAP_ID, quantity: 1 },
          ],
        }),
      });
      const valJson = await valRes.json();
      assert(valJson.valid === true, "Promo is valid for cart containing eligible Face Wash");
      // Butterfly Pea Facewash DB price is ₹299, 20% discount is ₹59.8
      assert(Math.abs(valJson.discount - 59.8) < 0.1, `Discount is ₹59.8 (20% of ₹299 DB price). Actual: ₹${valJson.discount}`);

      // Excluded Cart: Only Soap + Combo. Face Wash promo should NOT apply!
      const exclRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_FACEWASH_20",
          cartItems: [
            { productId: REDWINE_SOAP_ID, quantity: 1 },
            { productId: BUTTERFLY_COMBO_ID, quantity: 1 },
          ],
        }),
      });
      const exclJson = await exclRes.json();
      assert(exclJson.valid === false, "Promo rejected when cart only contains Soap and Combo (excluded)");
      const reason = exclJson.reason || exclJson.error || "";
      assert(reason.includes("categories") || reason.includes("qualify"), `Error explains eligibility: "${reason}"`);
    } finally {
      await deleteTestPromo(catPromo.id);
    }
  } else {
    assert(false, "Failed to create temporary category promo");
  }

  // Subtest 3B: Specific Product Promo
  console.log("\n  Subtest 3B: Specific Product Promo (applies_to: 'product', target: [Butterfly Pea Facewash])");
  const prodPromo = await insertTestPromo({
    code: "TEST_PROD_100",
    discount_type: "flat",
    discount_value: 100,
    applies_to: "product",
    applies_to_ids: [BUTTERFLY_FACEWASH_ID],
    applies_to_id: BUTTERFLY_FACEWASH_ID,
    is_active: true,
  });

  if (prodPromo) {
    try {
      // Cart with Butterfly Pea Facewash + Soap
      const valRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_PROD_100",
          cartItems: [
            { productId: BUTTERFLY_FACEWASH_ID, quantity: 1 },
            { productId: REDWINE_SOAP_ID, quantity: 1 },
          ],
        }),
      });
      const valJson = await valRes.json();
      assert(valJson.valid === true, "Promo is valid when targeted product is in cart");
      assert(valJson.discount === 100, `Discount is ₹100 flat. Actual: ₹${valJson.discount}`);

      // Cart without Butterfly Pea Facewash (only Soap + Combo)
      const exclRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_PROD_100",
          cartItems: [
            { productId: REDWINE_SOAP_ID, quantity: 2 },
            { productId: BUTTERFLY_COMBO_ID, quantity: 1 },
          ],
        }),
      });
      const exclJson = await exclRes.json();
      assert(exclJson.valid === false, "Promo rejected when targeted product is not in cart");
    } finally {
      await deleteTestPromo(prodPromo.id);
    }
  } else {
    assert(false, "Failed to create temporary product promo");
  }

  // Subtest 3C: Specific Combo Promo
  console.log("\n  Subtest 3C: Specific Combo Promo (applies_to: 'combo', target: [Butterfly Pea Combo])");
  const comboPromo = await insertTestPromo({
    code: "TEST_COMBO_150",
    discount_type: "flat",
    discount_value: 150,
    applies_to: "combo",
    applies_to_ids: [BUTTERFLY_COMBO_ID],
    applies_to_id: BUTTERFLY_COMBO_ID,
    is_active: true,
  });

  if (comboPromo) {
    try {
      // Cart with Butterfly Pea Combo + Soap
      const valRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_COMBO_150",
          cartItems: [
            { productId: BUTTERFLY_COMBO_ID, quantity: 1 },
            { productId: REDWINE_SOAP_ID, quantity: 1 },
          ],
        }),
      });
      const valJson = await valRes.json();
      assert(valJson.valid === true, "Promo is valid when targeted combo is in cart");
      assert(valJson.discount === 150, `Discount is ₹150 flat on combo. Actual: ₹${valJson.discount}`);

      // Cart without Butterfly Pea Combo (only Soap + Facewash)
      const exclRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_COMBO_150",
          cartItems: [
            { productId: BUTTERFLY_FACEWASH_ID, quantity: 1 },
            { productId: REDWINE_SOAP_ID, quantity: 1 },
          ],
        }),
      });
      const exclJson = await exclRes.json();
      assert(exclJson.valid === false, "Promo rejected when targeted combo is not in cart");
    } finally {
      await deleteTestPromo(comboPromo.id);
    }
  } else {
    assert(false, "Failed to create temporary combo promo");
  }

  // Subtest 3D: Empty Category/Product Selection must NEVER default to All Products
  console.log("\n  Subtest 3D: Empty Category Selection (must be rejected)");
  const emptyCatPromo = await insertTestPromo({
    code: "TEST_EMPTY_CAT",
    discount_type: "flat",
    discount_value: 50,
    applies_to: "category",
    applies_to_ids: [],
    applies_to_id: null,
    is_active: true,
  });

  if (emptyCatPromo) {
    try {
      const valRes = await fetch(`${BASE_URL}/api/promo/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST_EMPTY_CAT",
          cartItems: [{ productId: BUTTERFLY_FACEWASH_ID, quantity: 1 }],
        }),
      });
      const valJson = await valRes.json();
      assert(valJson.valid === false, "Empty category targeting rule is rejected and NEVER defaults to all products");
    } finally {
      await deleteTestPromo(emptyCatPromo.id);
    }
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
