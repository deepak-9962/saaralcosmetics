import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { generateOrderNumber } from "@/lib/utils";
import type { OrderItem } from "@/lib/types";

interface CartInputItem {
  productId: string;
  quantity: number;
  variant_name?: string | null;
}

interface OrderCreateRequest {
  items: CartInputItem[];
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  promoCode?: string | null;
  passkey?: string | null;
}

export async function POST(request: NextRequest) {
  // ── 1. Rate Limiting ──────────────────────────────────────────
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip, 6, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a minute before retrying." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // ── 2. Checkout Mode Guard ────────────────────────────────────
  const checkoutMode = process.env.NEXT_PUBLIC_CHECKOUT_MODE || "live";
  let body: OrderCreateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (checkoutMode === "disabled") {
    return NextResponse.json(
      { error: "Checkout is currently closed for scheduled maintenance. Please check back soon!" },
      { status: 403 }
    );
  }

  if (checkoutMode === "beta") {
    const betaKey = process.env.NEXT_PUBLIC_CHECKOUT_BETA_PASSKEY || "saaral-beta-2026";
    if (!body.passkey || body.passkey.trim() !== betaKey.trim()) {
      return NextResponse.json(
        { error: "A valid beta passkey is required to place an order during beta access." },
        { status: 403 }
      );
    }
  }

  // ── 3. Validate Inputs ────────────────────────────────────────
  const { items, customer, promoCode } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  if (
    !customer ||
    !customer.name?.trim() ||
    !customer.phone?.trim() ||
    !customer.address1?.trim() ||
    !customer.city?.trim() ||
    !customer.state?.trim() ||
    !customer.pincode?.trim()
  ) {
    return NextResponse.json(
      { error: "All required customer and delivery address fields must be provided." },
      { status: 400 }
    );
  }

  const cleanPhone = customer.phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit mobile number." },
      { status: 400 }
    );
  }

  const cleanPincode = customer.pincode.replace(/\D/g, "");
  if (cleanPincode.length !== 6) {
    return NextResponse.json(
      { error: "Please enter a valid 6-digit postal pincode." },
      { status: 400 }
    );
  }

  // ── 4. Verify Products, Prices & Stock Directly from DB ────────
  const supabase = getSupabaseServiceClient();
  const productIds = Array.from(new Set(items.map((i) => i.productId)));

  const { data: dbProducts, error: dbError } = await (supabase as any)
    .from("products")
    .select("id, name, slug, price, stock, is_active, images, variant_name")
    .in("id", productIds);

  if (dbError) {
    console.error("[orders/create] Supabase products fetch error:", dbError);
    return NextResponse.json(
      { error: "Failed to verify product catalog. Please try again." },
      { status: 500 }
    );
  }

  const productMap = new Map((((dbProducts as any[]) ?? [])).map((p: any) => [p.id, p]));
  const verifiedOrderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const product: any = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `One of the products in your cart is no longer available.` },
        { status: 400 }
      );
    }

    if (!product.is_active) {
      return NextResponse.json(
        { error: `"${product.name}" is currently inactive and cannot be ordered.` },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));

    // Check stock if tracked
    if (typeof product.stock === "number" && product.stock >= 0) {
      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: `"${product.name}" only has ${product.stock} units remaining in stock. Please adjust your quantity.`,
          },
          { status: 400 }
        );
      }
    }

    // Server-enforced true DB price
    const verifiedUnitPrice = Number(product.price);
    const itemTotal = verifiedUnitPrice * quantity;
    calculatedSubtotal += itemTotal;

    verifiedOrderItems.push({
      product_id: product.id,
      name: product.name,
      variant: item.variant_name || product.variant_name || null,
      price: verifiedUnitPrice,
      qty: quantity,
      image: (product.images && product.images[0]) || "",
    });
  }

  // ── 5. Server-Side Promo Code Validation & Discount Calculation ──
  let discountAmount = 0;
  let appliedPromoCode: string | null = null;
  let appliedDiscountType: string | null = null;

  if (promoCode && typeof promoCode === "string" && promoCode.trim().length > 0) {
    const cleanCode = promoCode.trim().toUpperCase();
    const { data: promo, error: promoError } = await (supabase as any)
      .from("promo_codes")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!promoError && promo && promo.is_active) {
      const now = new Date();
      const startsAt = promo.starts_at ? new Date(promo.starts_at) : null;
      const expiresAt = promo.expires_at ? new Date(promo.expires_at) : null;
      const isDateValid = (!startsAt || now >= startsAt) && (!expiresAt || now <= expiresAt);
      const isUsageValid = promo.usage_limit === null || (promo.times_used ?? 0) < promo.usage_limit;
      const isMinCartValid = promo.min_cart_value === null || calculatedSubtotal >= Number(promo.min_cart_value);

      if (isDateValid && isUsageValid && isMinCartValid) {
        appliedPromoCode = promo.code;
        appliedDiscountType = promo.discount_type;

        if (promo.discount_type === "percentage") {
          const rawDiscount = (calculatedSubtotal * Number(promo.discount_value)) / 100;
          discountAmount = promo.max_discount
            ? Math.min(rawDiscount, Number(promo.max_discount))
            : rawDiscount;
        } else if (promo.discount_type === "flat") {
          discountAmount = Math.min(calculatedSubtotal, Number(promo.discount_value));
        } else if (promo.discount_type === "free_shipping") {
          discountAmount = 0;
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
      }
    }
  }

  // ── 6. Server-Side Shipping Calculation ────────────────────────
  // Standard rule: Free shipping for orders >= ₹499 or free_shipping promo, otherwise ₹50
  const isFreeShipping = calculatedSubtotal >= 499 || appliedDiscountType === "free_shipping";
  const shippingCharge = isFreeShipping ? 0 : 50;

  // ── 7. Calculate Grand Total ───────────────────────────────────
  const grandTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingCharge);

  // ── 8. Resolve Authenticated User (if logged in) ───────────────
  let userId: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (user?.id) {
      userId = user.id;
    }
  }

  // ── 9. Insert Order into Supabase ──────────────────────────────
  const orderNumber = generateOrderNumber();
  const orderPayload = {
    order_number: orderNumber,
    user_id: userId,
    customer_name: customer.name.trim(),
    customer_phone: cleanPhone,
    customer_email: customer.email?.trim() || null,
    address_line1: customer.address1.trim(),
    address_line2: customer.address2?.trim() || null,
    city: customer.city.trim(),
    state: customer.state.trim(),
    pincode: cleanPincode,
    items: verifiedOrderItems,
    subtotal: calculatedSubtotal,
    shipping_charge: shippingCharge,
    total: grandTotal,
    payment_status: "pending",
    order_status: "new",
    promo_code_snapshot: appliedPromoCode,
    discount_type_snapshot: appliedDiscountType,
    discount_amount: discountAmount,
  };

  const { data: newOrder, error: insertError } = await (supabase as any)
    .from("orders")
    .insert(orderPayload)
    .select("id, order_number, total, subtotal, shipping_charge, discount_amount")
    .single();

  if (insertError || !newOrder) {
    console.error("[orders/create] Order insert error:", insertError);
    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    orderId: newOrder.id,
    orderNumber: newOrder.order_number,
    subtotal: newOrder.subtotal,
    shippingCharge: newOrder.shipping_charge,
    discountAmount: newOrder.discount_amount,
    total: newOrder.total,
  });
}
