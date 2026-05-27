import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// UUID v4 regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Razorpay payment_id format: pay_XXXXXXXXXXXXXXXX
const PAYMENT_ID_REGEX = /^pay_[A-Za-z0-9]{14,}$/;

// Razorpay order_id format: order_XXXXXXXXXXXXXXXX
const ORDER_ID_REGEX = /^order_[A-Za-z0-9]{14,}$/;

// Razorpay signature is a 64-char hex string
const SIGNATURE_REGEX = /^[a-f0-9]{64}$/i;

/**
 * Constant-time string comparison — prevents timing attacks
 * where an attacker could measure response time to guess the signature.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export async function POST(request: Request) {
  // ── 1. Rate Limiting ─────────────────────────────────────────────────────────
  // Allow at most 10 verification attempts per IP per minute
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(ip, 10, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
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

    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      body as Record<string, unknown>;

    if (
      !orderId || typeof orderId !== "string" ||
      !razorpay_payment_id || typeof razorpay_payment_id !== "string" ||
      !razorpay_order_id || typeof razorpay_order_id !== "string" ||
      !razorpay_signature || typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        { error: "All payment fields are required." },
        { status: 400 }
      );
    }

    // ── 3. Format Validation ─────────────────────────────────────────────────
    if (!UUID_REGEX.test(orderId)) {
      return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
    }
    if (!PAYMENT_ID_REGEX.test(razorpay_payment_id)) {
      return NextResponse.json({ error: "Invalid payment ID format." }, { status: 400 });
    }
    if (!ORDER_ID_REGEX.test(razorpay_order_id)) {
      return NextResponse.json({ error: "Invalid Razorpay order ID format." }, { status: 400 });
    }
    if (!SIGNATURE_REGEX.test(razorpay_signature)) {
      return NextResponse.json({ error: "Invalid signature format." }, { status: 400 });
    }

    // ── 4. Validate Server Credentials ──────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!keySecret || !supabaseUrl || !serviceRoleKey) {
      console.error("[verify-payment] Missing server environment variables.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // ── 5. Fetch Order from DB — verify it exists & isn't already paid ───────
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, payment_status, razorpay_order_id")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // ── 6. Guard: Idempotency — block replaying already-paid orders ──────────
    if (order.payment_status === "paid") {
      // Already processed — safe to return success (idempotent)
      return NextResponse.json({ success: true });
    }

    // ── 7. Guard: Razorpay order_id must match what we stored ────────────────
    // Prevents a customer from swapping in a different order's Razorpay ID
    if (!order.razorpay_order_id || order.razorpay_order_id !== razorpay_order_id) {
      console.warn(
        `[verify-payment] razorpay_order_id mismatch for DB order ${orderId}. ` +
        `Expected: ${order.razorpay_order_id}, Got: ${razorpay_order_id}`
      );
      return NextResponse.json(
        { error: "Payment reference mismatch. Verification failed." },
        { status: 400 }
      );
    }

    // ── 8. Cryptographic Signature Verification ──────────────────────────────
    // Razorpay spec: HMAC-SHA256( razorpay_order_id + "|" + razorpay_payment_id )
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(signaturePayload)
      .digest("hex");

    // Use constant-time comparison to prevent timing attacks
    const isSignatureValid = safeCompare(expectedSignature, razorpay_signature);

    if (!isSignatureValid) {
      // Log for security audit but do not expose details to the client
      console.warn(
        `[verify-payment] Invalid signature for order ${orderId} (IP: ${ip})`
      );

      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);

      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    // ── 9. Mark Order as Paid ─────────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_order_id,
        order_status: "new",
      })
      .eq("id", orderId)
      .eq("payment_status", "pending"); // Double-lock: only update if still pending

    if (updateError) {
      console.error("[verify-payment] DB update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to record payment. Contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("[verify-payment] Unhandled error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
