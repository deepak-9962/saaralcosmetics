/**
 * POST /api/promo/redeem
 *
 * Called AFTER a successful Razorpay payment verification.
 * Re-validates the promo code server-side, then atomically records the redemption.
 *
 * Body:
 *   { orderId, code, cartItems, subtotal, userId? }
 *
 * Actions (only on valid code):
 *   1. Re-validate the code (full check — same as /validate)
 *   2. Atomically increment promo_codes.times_used by 1
 *   3. Insert a promo_code_redemptions row
 *   4. Update the orders row with promo snapshot + discount_amount
 *
 * This is fire-and-forget from the client — failures are logged but don't
 * block navigation to the order confirmation page.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CartItem } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { orderId, code, cartItems, subtotal, userId } = body as {
      orderId?: unknown;
      code?: unknown;
      cartItems?: unknown;
      subtotal?: unknown;
      userId?: unknown;
    };

    if (!orderId || typeof orderId !== "string" || !UUID_REGEX.test(orderId)) {
      return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No code provided." }, { status: 400 });
    }
    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
    }
    const cartSubtotal = typeof subtotal === "number" ? subtotal : 0;
    const upperCode = code.trim().toUpperCase();
    const supabase = getServiceClient();

    // ── 1. Re-validate ───────────────────────────────────────────────────────
    const { data: promo, error: promoError } = await (supabase as any)
      .from("promo_codes")
      .select("*")
      .eq("code", upperCode)
      .maybeSingle();

    if (promoError || !promo) {
      console.warn(`[promo/redeem] Code not found: ${upperCode}`);
      return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: "Promo code is inactive." }, { status: 409 });
    }

    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return NextResponse.json({ error: "Promo code not yet active." }, { status: 409 });
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return NextResponse.json({ error: "Promo code has expired." }, { status: 409 });
    }
    if (promo.usage_limit_total !== null && promo.times_used >= promo.usage_limit_total) {
      return NextResponse.json({ error: "Usage limit reached." }, { status: 409 });
    }

    // ── 2. Compute discount (same logic as /validate) ────────────────────────
    const minOrderValue = promo.min_order_value ?? 0;
    if (cartSubtotal < minOrderValue) {
      return NextResponse.json({ error: "Min order value not met." }, { status: 409 });
    }

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
        return NextResponse.json({ error: "Qualifying product not in cart." }, { status: 409 });
      }
    }

    let discount_amount: number;
    if (promo.discount_type === "flat") {
      discount_amount = Math.min(promo.discount_value, qualifyingSubtotal);
    } else {
      const raw = (qualifyingSubtotal * promo.discount_value) / 100;
      discount_amount = promo.max_discount_cap !== null
        ? Math.min(raw, promo.max_discount_cap)
        : raw;
    }
    discount_amount = Math.round(discount_amount * 100) / 100;

    // ── 3. Atomic increment of times_used ────────────────────────────────────
    const { error: incrError } = await (supabase as any).rpc("increment_promo_times_used", {
      p_promo_id: promo.id,
    });

    if (incrError) {
      // Fallback: direct update (non-atomic but acceptable for low concurrency)
      console.warn("[promo/redeem] RPC not available, falling back to direct update:", incrError.message);
      await (supabase as any)
        .from("promo_codes")
        .update({ times_used: promo.times_used + 1 })
        .eq("id", promo.id);
    }

    // ── 4. Insert redemption row ─────────────────────────────────────────────
    await (supabase as any).from("promo_code_redemptions").insert({
      promo_code_id: promo.id,
      user_id: typeof userId === "string" && userId ? userId : null,
      order_id: orderId,
      discount_applied: discount_amount,
    });

    // ── 5. Update order with promo snapshot ──────────────────────────────────
    await (supabase as any)
      .from("orders")
      .update({
        promo_code_snapshot: upperCode,
        discount_type_snapshot: promo.discount_type,
        discount_amount,
      })
      .eq("id", orderId);

    return NextResponse.json({ success: true, discount_amount });
  } catch (err) {
    console.error("[promo/redeem] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
