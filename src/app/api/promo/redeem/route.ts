/**
 * POST /api/promo/redeem
 *
 * Called upon successful Razorpay payment verification.
 * Records the promo code redemption in the promo_code_redemptions audit table.
 *
 * Body:
 *   { orderId, code, userId? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { recordPromoRedemption } from "@/lib/promoEngine";

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

    const { orderId, code, userId } = body as {
      orderId?: unknown;
      code?: unknown;
      userId?: unknown;
    };

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Fetch order to get verified discount_amount
    const { data: order } = await (supabase as any)
      .from("orders")
      .select("id, discount_amount, user_id, promo_code_snapshot")
      .eq("id", orderId)
      .maybeSingle();

    if (order && (order.promo_code_snapshot || code)) {
      await recordPromoRedemption(supabase, {
        orderId: order.id,
        promoCode: order.promo_code_snapshot || (code as string),
        userId: (order.user_id || userId) as string | null,
        discountAmount: Number(order.discount_amount) || 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[promo/redeem] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
