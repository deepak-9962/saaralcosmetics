import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "orderId, razorpay_payment_id, razorpay_order_id, and razorpay_signature are required" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    // Verify HMAC signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    // Use service role client — bypasses RLS so the UPDATE on orders is permitted
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (isSignatureValid) {
      // Update order details in Supabase
      const { error: dbError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id,
          razorpay_order_id,
          order_status: "new"
        })
        .eq("id", orderId);

      if (dbError) {
        return NextResponse.json(
          { error: `Database update error: ${dbError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // Update order status as failed
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);

      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
