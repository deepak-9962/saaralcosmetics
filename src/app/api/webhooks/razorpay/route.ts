import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Constant-time string comparison preventing timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      console.error("[razorpay-webhook] Missing RAZORPAY_WEBHOOK_SECRET / RAZORPAY_KEY_SECRET.");
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
    }

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      console.warn("[razorpay-webhook] Missing x-razorpay-signature header.");
      return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
    }

    const rawBody = await request.text();
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!safeCompare(expectedSignature, signature)) {
      console.warn("[razorpay-webhook] Invalid webhook signature detected.");
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const event = payload.event;
    const supabase = getSupabaseServiceClient();

    // ── Handle Payment Captured or Order Paid ─────────────────────
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id || payload.payload?.order?.entity?.id;
      const razorpayPaymentId = payment?.id;

      if (!razorpayOrderId) {
        console.warn("[razorpay-webhook] Missing order_id in payment payload.");
        return NextResponse.json({ status: "skipped_no_order_id" });
      }

      // Check existing order in DB
      const { data: order, error: orderError } = await (supabase as any)
        .from("orders")
        .select("id, payment_status, promo_code_snapshot")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (orderError) {
        console.error("[razorpay-webhook] DB fetch error:", orderError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!order) {
        console.warn(`[razorpay-webhook] No order found matching razorpay_order_id: ${razorpayOrderId}`);
        return NextResponse.json({ status: "order_not_found" });
      }

      // ── Atomic Payment & Inventory Processing via PostgreSQL RPC ──
      const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
        "process_order_payment",
        {
          p_order_id: order.id,
          p_razorpay_payment_id: razorpayPaymentId || null,
          p_order_status: "new",
        }
      );

      if (!rpcError && rpcResult) {
        if (rpcResult.status === "already_processed") {
          console.log(`[razorpay-webhook] Order ${order.id} is already paid. Idempotent return 200.`);
          return NextResponse.json({ status: "already_processed", orderId: order.id });
        }
        if (!rpcResult.success && rpcResult.error === "insufficient_stock") {
          console.warn(`[razorpay-webhook] Oversell prevented for order ${order.id}: ${rpcResult.product_name} stock exhausted.`);
          return NextResponse.json({ status: "stock_exhausted", orderId: order.id, error: rpcResult.error });
        }
        console.log(`[razorpay-webhook] Order ${order.id} marked as paid and inventory decremented atomically.`);
        return NextResponse.json({ status: "success", orderId: order.id });
      }

      // ── Fallback for environments where RPC is not yet applied ──
      if (order.payment_status === "paid") {
        return NextResponse.json({ status: "already_processed", orderId: order.id });
      }

      const { error: updateError } = await (supabase as any)
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: razorpayPaymentId || null,
          order_status: "new",
        })
        .eq("id", order.id)
        .eq("payment_status", "pending");

      if (updateError) {
        console.error(`[razorpay-webhook] Failed to update order ${order.id}:`, updateError);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
      }

      if (order.promo_code_snapshot) {
        try {
          const { data: promo } = await (supabase as any)
            .from("promo_codes")
            .select("times_used")
            .eq("code", order.promo_code_snapshot)
            .maybeSingle();

          if (promo) {
            await (supabase as any)
              .from("promo_codes")
              .update({ times_used: (promo.times_used || 0) + 1 })
              .eq("code", order.promo_code_snapshot);
          }
        } catch (promoErr) {
          console.warn("[razorpay-webhook] Could not increment promo counter:", promoErr);
        }
      }

      console.log(`[razorpay-webhook] Order ${order.id} marked as paid successfully.`);
      return NextResponse.json({ status: "success", orderId: order.id });
    }

    // ── Handle Payment Failed ──────────────────────────────────────
    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const errorDescription = payment?.error_description || "Payment failed at gateway";

      console.warn(`[razorpay-webhook] Payment failed for Razorpay order ${razorpayOrderId}: ${errorDescription}`);

      if (razorpayOrderId) {
        await (supabase as any)
          .from("orders")
          .update({
            payment_status: "failed",
            notes: `Payment failed: ${errorDescription}`,
          })
          .eq("razorpay_order_id", razorpayOrderId)
          .eq("payment_status", "pending");
      }

      return NextResponse.json({ status: "recorded_failure" });
    }

    // Acknowledge other unhandled events safely
    return NextResponse.json({ status: "acknowledged", event });
  } catch (err: any) {
    console.error("[razorpay-webhook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
