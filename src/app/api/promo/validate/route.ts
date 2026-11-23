/**
 * POST /api/promo/validate
 *
 * Server-side promo code validation using the authoritative promo engine.
 * NEVER trust client-computed discounts.
 *
 * Body:
 *   { code: string, cartItems: CartItem[], subtotal: number, userId?: string }
 *
 * Returns:
 *   { valid: true, code, discount_type, discount_amount, is_free_shipping, final_total }
 *   OR
 *   { valid: false, reason: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePromoCode } from "@/lib/promoEngine";
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

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, reason: "No promo code provided." }, { status: 400 });
    }
    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ valid: false, reason: "Invalid cart data." }, { status: 400 });
    }

    const normalizedItems = (cartItems as any[]).map((i) => ({
      productId: i.product_id || i.productId,
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
      is_combo: Boolean(i.is_combo || i.variant_name === "Combo Pack"),
    }));

    const calculatedSubtotal = normalizedItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const cartSubtotal =
      typeof subtotal === "number" && subtotal > 0 ? subtotal : calculatedSubtotal;
    const supabase = getServiceClient();

    const result = await validatePromoCode(supabase, {
      code,
      cartItems: normalizedItems,
      subtotal: cartSubtotal,
      userId: typeof userId === "string" ? userId : null,
    });

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason,
        error: result.reason,
      });
    }

    const final_total = Math.max(0, cartSubtotal - result.discountAmount);

    return NextResponse.json({
      valid: true,
      code: result.code,
      discount_type: result.discountType,
      discount_amount: result.discountAmount,
      discount: result.discountAmount,
      is_free_shipping: result.isFreeShipping,
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
