import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// UUID v4 regex — rejects obviously malformed IDs before touching DB
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // ── 1. Rate Limiting ─────────────────────────────────────────────────────────
  // Allow at most 5 order creation attempts per IP per minute
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(ip, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
      }
    );
  }

  try {
    // ── 2. Parse & Basic Input Validation ────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { orderId } = body as Record<string, unknown>;

    // Only orderId accepted from browser — amount is always fetched from DB
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "orderId is required and must be a string." },
        { status: 400 }
      );
    }

    // ── 3. UUID Format Guard ─────────────────────────────────────────────────
    if (!UUID_REGEX.test(orderId)) {
      return NextResponse.json(
        { error: "Invalid orderId format." },
        { status: 400 }
      );
    }

    // ── 4. Validate Server Credentials ──────────────────────────────────────
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!keyId || !keySecret || !supabaseUrl || !serviceRoleKey) {
      console.error("[create-razorpay-order] Missing server environment variables.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // ── 5. Supabase: Verify Order Exists & Fetch Real Amount ─────────────────
    // NEVER trust the amount from the browser. Always re-fetch from DB.
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, total, payment_status, razorpay_order_id")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // ── 6. Guard: Block already-paid orders ──────────────────────────────────
    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 409 }
      );
    }

    // ── 7. Guard: Prevent duplicate Razorpay order creation ──────────────────
    // If a Razorpay order already exists for this DB order, return it directly
    // to avoid double-charging the customer on retries.
    if (order.razorpay_order_id) {
      return NextResponse.json({
        razorpayOrderId: order.razorpay_order_id,
        amount: Math.round(order.total * 100),
        currency: "INR",
      });
    }

    // ── 8. Create Razorpay Order using server-fetched amount ─────────────────
    const amountInPaise = Math.round(order.total * 100);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${orderId.replace(/-/g, "").substring(0, 20)}`,
        notes: { supabase_order_id: orderId }, // For reconciliation
      }),
    });

    if (!razorpayResponse.ok) {
      const errText = await razorpayResponse.text();
      console.error("[create-razorpay-order] Razorpay API error:", errText);
      return NextResponse.json(
        { error: "Payment gateway error. Please try again." },
        { status: 502 }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    // ── 9. Persist razorpay_order_id to Supabase ─────────────────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", orderId)
      .eq("payment_status", "pending"); // Extra guard: only update if still pending

    if (updateError) {
      console.error("[create-razorpay-order] DB update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to save payment reference. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (error) {
    console.error("[create-razorpay-order] Unhandled error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
