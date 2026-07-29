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

    // ── 4. Compute qualifying subtotal (scoped vs all) ───────────────────────
    let qualifyingSubtotal = cartSubtotal;

    if (promo.applies_to === "product" && promo.applies_to_id) {
      const qualifying = (cartItems as CartItem[]).filter(
        (item) => item.product_id === promo.applies_to_id
      );
      qualifyingSubtotal = qualifying.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      if (qualifyingSubtotal === 0) {
        return NextResponse.json({
          valid: false,
          reason: "This code only applies to a specific product not in your cart.",
        });
      }
    } else if (promo.applies_to === "category" && promo.applies_to_id) {
      // For category-scoped codes, applies_to_id holds the category string slug
      // (we store category slug as the applies_to_id text — UUID column allows any uuid
      // but we handle this gracefully)
      // Since products in the cart don't carry category, we fall back to full subtotal
      // unless the client passes category info. For now treat as full subtotal.
      qualifyingSubtotal = cartSubtotal;
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
