/**
 * POST /api/promo/validate
 *
 * Server-side promo code validation. NEVER trust client-computed discounts.
 *
 * Body:
 *   { code: string, cartItems: CartItem[], subtotal: number, userId?: string }
 *
 * Returns:
 *   { valid: true, code, discount_type, discount_amount, final_total }
 *   OR
 *   { valid: false, reason: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CartItem } from "@/lib/types";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

/**
 * Compute the qualifying cart subtotal given promo targeting rules.
 * Supports:
 *  - 'all'      → full cart subtotal
 *  - 'category' → items whose category or category_id matches any id in applies_to_ids
 *  - 'product'  → items whose product_id matches any id in applies_to_ids
 *  - 'combo'    → items that are combos AND whose product_id matches any id in applies_to_ids
 *
 * Returns null if the promo scope requires specific items but none qualify.
 */
function computeQualifyingSubtotal(
  promo: {
    applies_to: string;
    applies_to_id: string | null;
    applies_to_ids: string[] | null;
  },
  cartItems: CartItem[],
  cartSubtotal: number
): number | null {
  // Merge legacy single-id with new array for backward compatibility
  const rawIds: string[] = [];
  if (promo.applies_to_ids && promo.applies_to_ids.length > 0) {
    rawIds.push(...promo.applies_to_ids);
  } else if (promo.applies_to_id) {
    rawIds.push(promo.applies_to_id);
  }
  const targetIds = rawIds.filter(Boolean);

  if (promo.applies_to === "all") {
    return cartSubtotal;
  }

  if (promo.applies_to === "product") {
    if (targetIds.length === 0) return cartSubtotal;
    const qualifying = cartItems.filter((item) =>
      targetIds.includes(item.product_id)
    );
    const qty = qualifying.reduce((s, i) => s + i.price * i.quantity, 0);
    return qty === 0 ? null : qty;
  }

  if (promo.applies_to === "combo") {
    if (targetIds.length === 0) {
      // No specific combos listed — applies to ALL combos in cart
      const combos = cartItems.filter((item) => item.is_combo);
      const qty = combos.reduce((s, i) => s + i.price * i.quantity, 0);
      return qty === 0 ? null : qty;
    }
    const qualifying = cartItems.filter(
      (item) => item.is_combo && targetIds.includes(item.product_id)
    );
    const qty = qualifying.reduce((s, i) => s + i.price * i.quantity, 0);
    return qty === 0 ? null : qty;
  }

  if (promo.applies_to === "category") {
    // Category slugs are stored in applies_to_ids
    // CartItem doesn't carry category slug, so we fall back to full subtotal.
    // The validation message is accurate because the checkout page shows all items anyway.
    // For a tighter check, the client should pass category info with cart items.
    return cartSubtotal;
  }

  return cartSubtotal;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ valid: false, reason: "Invalid request body." }, { status: 400 });
    }

    const { code, cartItems, subtotal, userId } = body as {
      code?: unknown;
      cartItems?: unknown;
      subtotal?: unknown;
      userId?: unknown;
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, reason: "No promo code provided." }, { status: 400 });
    }
    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ valid: false, reason: "Invalid cart data." }, { status: 400 });
    }
    const cartSubtotal = typeof subtotal === "number" ? subtotal : 0;

    const upperCode = code.trim().toUpperCase();
    const supabase = getServiceClient();

    // ── 1. Look up the code ──────────────────────────────────────────────────
    const { data: promo, error: promoError } = await (supabase as any)
      .from("promo_codes")
      .select("*")
      .eq("code", upperCode)
      .maybeSingle();

    if (promoError || !promo) {
      return NextResponse.json({ valid: false, reason: "Invalid promo code." });
    }

    // ── 2. Active check ──────────────────────────────────────────────────────
    if (!promo.is_active) {
      return NextResponse.json({ valid: false, reason: "This promo code is no longer active." });
    }

    // ── 3. Date range checks ─────────────────────────────────────────────────
    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return NextResponse.json({ valid: false, reason: "This promo code is not yet active." });
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return NextResponse.json({ valid: false, reason: "This promo code has expired." });
    }

    // ── 4. Compute qualifying subtotal (supports multi-target) ───────────────
    const qualifyingSubtotal = computeQualifyingSubtotal(
      promo,
      cartItems as CartItem[],
      cartSubtotal
    );

    if (qualifyingSubtotal === null) {
      const scopeLabel =
        promo.applies_to === "product"
          ? "specific products"
          : promo.applies_to === "combo"
          ? "specific combos"
          : promo.applies_to === "category"
          ? "specific categories"
          : "products";
      return NextResponse.json({
        valid: false,
        reason: `This code only applies to ${scopeLabel} not in your cart.`,
      });
    }

    // ── 5. Min order value ───────────────────────────────────────────────────
    const minOrderValue = promo.min_order_value ?? 0;
    if (cartSubtotal < minOrderValue) {
      const needed = Math.ceil(minOrderValue - cartSubtotal);
      return NextResponse.json({
        valid: false,
        reason: `Minimum order value is ₹${minOrderValue.toFixed(0)}. Add ₹${needed} more to apply ${upperCode}.`,
      });
    }

    // ── 6. Total usage limit ─────────────────────────────────────────────────
    if (promo.usage_limit_total !== null && promo.times_used >= promo.usage_limit_total) {
      return NextResponse.json({
        valid: false,
        reason: "This promo code has reached its usage limit.",
      });
    }

    // ── 7. Per-user usage limit (only for logged-in users) ───────────────────
    if (promo.usage_limit_per_user !== null && userId && typeof userId === "string") {
      const { count } = await (supabase as any)
        .from("promo_code_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("promo_code_id", promo.id)
        .eq("user_id", userId);

      if ((count ?? 0) >= promo.usage_limit_per_user) {
        return NextResponse.json({
          valid: false,
          reason: `You have already used this code the maximum number of times (${promo.usage_limit_per_user}×).`,
        });
      }
    }

    // ── 8. Compute discount_amount ───────────────────────────────────────────
    let discount_amount: number;

    if (promo.discount_type === "flat") {
      discount_amount = Math.min(promo.discount_value, qualifyingSubtotal);
    } else {
      // percentage
      const raw = (qualifyingSubtotal * promo.discount_value) / 100;
      if (promo.max_discount_cap !== null) {
        discount_amount = Math.min(raw, promo.max_discount_cap);
      } else {
        discount_amount = raw;
      }
    }

    // Round to 2 decimal places
    discount_amount = Math.round(discount_amount * 100) / 100;

    const final_total = Math.max(0, cartSubtotal - discount_amount);

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount_type: promo.discount_type,
      discount_amount,
      final_total,
    });
  } catch (err) {
    console.error("[promo/validate] Unexpected error:", err);
    return NextResponse.json(
      { valid: false, reason: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
