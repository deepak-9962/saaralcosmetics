import assert from "node:assert/strict";
import { computeQualifyingSubtotal, validatePromoCode } from "../src/lib/promoEngine.ts";
import { calculateShippingCharge } from "../src/lib/shipping.ts";

console.log("🚀 Starting Promo Code & Payment Gateway Verification Test Suite...\n");

// --- TEST 1: Shipping Policy ---
console.log("Test 1: Saaral Shipping Policy");
{
  // Tamil Nadu: Free shipping on >= 499, else 60
  assert.equal(calculateShippingCharge(498, "Tamil Nadu", false), 60, "TN < 499 must be 60");
  assert.equal(calculateShippingCharge(499, "Tamil Nadu", false), 0, "TN == 499 must be free");
  assert.equal(calculateShippingCharge(1200, "Tamil Nadu", false), 0, "TN > 499 must be free");

  // Non-TN: Free shipping on >= 999, else 60
  assert.equal(calculateShippingCharge(500, "Kerala", false), 60, "Non-TN < 999 must be 60");
  assert.equal(calculateShippingCharge(999, "Karnataka", false), 0, "Non-TN == 999 must be free");
  assert.equal(calculateShippingCharge(1500, "Maharashtra", false), 0, "Non-TN > 999 must be free");

  // Free shipping promo code: always 0
  assert.equal(calculateShippingCharge(100, "Delhi", true), 0, "Free shipping promo overrides non-TN charge");
  assert.equal(calculateShippingCharge(200, "Tamil Nadu", true), 0, "Free shipping promo overrides TN charge");
  console.log("  ✅ Saaral Shipping Policy verified.");
}

// --- TEST 2: computeQualifyingSubtotal ---
console.log("\nTest 2: Target Scope Calculation (computeQualifyingSubtotal)");
{
  const cartItems = [
    { productId: "prod-1", quantity: 2, price: 300, category: "face-wash" },
    { productId: "prod-2", quantity: 1, price: 400, category: "soap" },
    { productId: "prod-combo-1", quantity: 1, price: 800, is_combo: true }
  ];
  const cartSubtotal = 2 * 300 + 400 + 800; // 1800

  // Scope: 'all'
  const subtotalAll = computeQualifyingSubtotal({ applies_to: "all" }, cartItems, cartSubtotal);
  assert.equal(subtotalAll, 1800, "Scope 'all' should qualify full subtotal");

  // Scope: 'category' (face-wash)
  const subtotalFaceWash = computeQualifyingSubtotal(
    { applies_to: "category", applies_to_ids: ["face-wash"] },
    cartItems,
    cartSubtotal
  );
  assert.equal(subtotalFaceWash, 600, "Category face-wash should qualify 600");

  // Scope: 'category' (multiple: face-wash + soap)
  const subtotalMultiCat = computeQualifyingSubtotal(
    { applies_to: "category", applies_to_ids: ["face-wash", "soap"] },
    cartItems,
    cartSubtotal
  );
  assert.equal(subtotalMultiCat, 1000, "Multi-category should qualify 1000");

  // Scope: 'category' (non-existent category in cart)
  const subtotalNonMatch = computeQualifyingSubtotal(
    { applies_to: "category", applies_to_ids: ["herbal-oil"] },
    cartItems,
    cartSubtotal
  );
  assert.equal(subtotalNonMatch, null, "Non-matching category should qualify null");

  // Scope: 'product'
  const subtotalProduct = computeQualifyingSubtotal(
    { applies_to: "product", applies_to_ids: ["prod-2"] },
    cartItems,
    cartSubtotal
  );
  assert.equal(subtotalProduct, 400, "Specific product should qualify 400");

  // Scope: 'combo'
  const subtotalCombo = computeQualifyingSubtotal(
    { applies_to: "combo", applies_to_ids: [] },
    cartItems,
    cartSubtotal
  );
  assert.equal(subtotalCombo, 800, "Combos should qualify 800");

  console.log("  ✅ Target Scope Calculation verified.");
}

// --- TEST 3: Mock Supabase validatePromoCode ---
console.log("\nTest 3: Authoritative validatePromoCode Scenarios");
{
  const mockDb = {
    FLAT100: {
      id: "promo-flat-100",
      code: "FLAT100",
      is_active: true,
      discount_type: "flat",
      discount_value: 100,
      min_order_value: 500,
      max_discount_cap: null,
      applies_to: "all",
      times_used: 5,
      usage_limit_total: 100,
      usage_limit_per_user: 3,
    },
    PERCENT20: {
      id: "promo-pct-20",
      code: "PERCENT20",
      is_active: true,
      discount_type: "percentage",
      discount_value: 20,
      min_order_value: 0,
      max_discount_cap: 150,
      applies_to: "all",
      times_used: 0,
      usage_limit_total: null,
      usage_limit_per_user: null,
    },
    FREESHIP: {
      id: "promo-free-ship",
      code: "FREESHIP",
      is_active: true,
      discount_type: "free_shipping",
      discount_value: 0,
      min_order_value: 300,
      applies_to: "all",
      times_used: 0,
    },
    EXPIRED: {
      id: "promo-expired",
      code: "EXPIRED",
      is_active: true,
      discount_type: "flat",
      discount_value: 50,
      expires_at: "2020-01-01T00:00:00Z",
    }
  };

  function createMockSupabase(db, userUsageCount = 0) {
    return {
      from(table) {
        if (table === "promo_codes") {
          return {
            select() {
              return {
                eq(_col, val) {
                  return {
                    maybeSingle: async () => {
                      const codeUpper = String(val).toUpperCase();
                      return { data: db[codeUpper] ?? null, error: null };
                    }
                  };
                }
              };
            }
          };
        }
        if (table === "promo_code_redemptions") {
          return {
            select(_fields, _opts) {
              return {
                eq() {
                  return {
                    eq() {
                      return Promise.resolve({ count: userUsageCount, error: null });
                    }
                  };
                }
              };
            }
          };
        }
        throw new Error("Unhandled table: " + table);
      }
    };
  }

  const standardCart = [
    { productId: "prod-1", quantity: 2, price: 500, category: "face-wash" } // Subtotal 1000
  ];

  // Scenario 3A: Flat 100 discount on 1000 cart
  {
    const res = await validatePromoCode(createMockSupabase(mockDb), {
      code: "flat100",
      cartItems: standardCart,
      subtotal: 1000,
      userId: "user-123"
    });
    assert.equal(res.valid, true, "FLAT100 should be valid");
    assert.equal(res.discountAmount, 100, "FLAT100 discount must be 100");
    assert.equal(res.isFreeShipping, false, "FLAT100 is not free shipping");
  }

  // Scenario 3B: Flat 100 fails if cart below min_order_value (500)
  {
    const res = await validatePromoCode(createMockSupabase(mockDb), {
      code: "flat100",
      cartItems: [{ productId: "p1", quantity: 1, price: 300 }],
      subtotal: 300,
      userId: "user-123"
    });
    assert.equal(res.valid, false, "FLAT100 must fail below 500");
    assert.match(res.reason, /Minimum order value/);
  }

  // Scenario 3C: Percentage 20% capped at 150
  {
    // 20% of 1000 = 200, but cap is 150 -> should give 150
    const res = await validatePromoCode(createMockSupabase(mockDb), {
      code: "PERCENT20",
      cartItems: standardCart,
      subtotal: 1000,
      userId: "user-123"
    });
    assert.equal(res.valid, true, "PERCENT20 should be valid");
    assert.equal(res.discountAmount, 150, "PERCENT20 discount must be capped at 150");
  }

  // Scenario 3D: Free Shipping promo code
  {
    const res = await validatePromoCode(createMockSupabase(mockDb), {
      code: "FREESHIP",
      cartItems: standardCart,
      subtotal: 1000,
      userId: "user-123"
    });
    assert.equal(res.valid, true, "FREESHIP should be valid");
    assert.equal(res.discountAmount, 0, "FREESHIP direct discount is 0");
    assert.equal(res.isFreeShipping, true, "FREESHIP must set isFreeShipping to true");
  }

  // Scenario 3E: Expired promo code
  {
    const res = await validatePromoCode(createMockSupabase(mockDb), {
      code: "EXPIRED",
      cartItems: standardCart,
      subtotal: 1000,
      userId: "user-123"
    });
    assert.equal(res.valid, false, "EXPIRED must be invalid");
    assert.match(res.reason, /expired/);
  }

  // Scenario 3F: Per-user usage limit reached
  {
    const res = await validatePromoCode(createMockSupabase(mockDb, 3), {
      code: "FLAT100",
      cartItems: standardCart,
      subtotal: 1000,
      userId: "user-limit-reached"
    });
    assert.equal(res.valid, false, "FLAT100 should fail when user limit reached");
    assert.match(res.reason, /maximum allowed number of times/);
  }

  console.log("  ✅ Authoritative validatePromoCode Scenarios verified.");
}

// --- TEST 4: Gateway Amount Conversion to Paise ---
console.log("\nTest 4: Gateway Paise Conversion & Exact Match");
{
  const subtotal = 1000;
  const discount = 150; // PERCENT20
  const discountedTotal = subtotal - discount; // 850
  const shipping = calculateShippingCharge(discountedTotal, "Karnataka", false); // 60 (< 999)
  const grandTotal = discountedTotal + shipping; // 910

  const amountInPaise = Math.round(grandTotal * 100);
  assert.equal(grandTotal, 910, "Grand total must be 910");
  assert.equal(amountInPaise, 91000, "Paise amount sent to Razorpay must be 91000");

  // Verify floating point precision with cents/paise
  const decimalTotal = 499.50;
  assert.equal(Math.round(decimalTotal * 100), 49950);
  console.log("  ✅ Gateway Paise Conversion verified.");
}

console.log("\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨");
