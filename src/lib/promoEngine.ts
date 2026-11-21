import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscountType } from "@/lib/types";

export interface PromoCartItemMeta {
  productId: string;
  quantity: number;
  price: number;
  category?: string | null;
  category_id?: string | null;
  is_combo?: boolean;
}

export interface PromoValidationInput {
  code: string;
  cartItems: PromoCartItemMeta[];
  subtotal: number;
  userId?: string | null;
}

export interface PromoValidationSuccess {
  valid: true;
  code: string;
  promoId: string;
  discountType: DiscountType;
  discountAmount: number;
  isFreeShipping: boolean;
  qualifyingSubtotal: number;
}

export interface PromoValidationFailure {
  valid: false;
  reason: string;
}

export type PromoValidationOutput = PromoValidationSuccess | PromoValidationFailure;

/**
 * Computes the qualifying cart subtotal based on promo code targeting rules.
 * Handles 'all', 'product', 'combo', and 'category' scopes.
 */
export function computeQualifyingSubtotal(
  promo: {
    applies_to: string;
    applies_to_id?: string | null;
    applies_to_ids?: string[] | null;
  },
  cartItems: PromoCartItemMeta[],
  cartSubtotal: number
): number | null {
  const rawIds: string[] = [];
  if (Array.isArray(promo.applies_to_ids) && promo.applies_to_ids.length > 0) {
    rawIds.push(...promo.applies_to_ids);
  } else if (promo.applies_to_id) {
    rawIds.push(promo.applies_to_id);
  }
  const targetIds = rawIds.filter(Boolean);

  if (promo.applies_to === "all") {
    return cartSubtotal;
  }

  if (targetIds.length === 0 && promo.applies_to !== "combo") {
    return cartSubtotal;
  }

  if (promo.applies_to === "product") {
    const qualifying = cartItems.filter((item) => targetIds.includes(item.productId));
    const total = qualifying.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total > 0 ? total : null;
  }

  if (promo.applies_to === "combo") {
    const qualifying = cartItems.filter(
      (item) => item.is_combo && (targetIds.length === 0 || targetIds.includes(item.productId))
    );
    const total = qualifying.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total > 0 ? total : null;
  }

  if (promo.applies_to === "category") {
    const qualifying = cartItems.filter((item) => {
      const catSlugMatch = item.category && targetIds.includes(item.category);
      const catIdMatch = item.category_id && targetIds.includes(item.category_id);
      return Boolean(catSlugMatch || catIdMatch);
    });
    const total = qualifying.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // If cart items don't have category populated (e.g. client pre-check), fallback to cartSubtotal
    return qualifying.length > 0 ? total : cartItems.some((i) => i.category) ? null : cartSubtotal;
  }

  return cartSubtotal;
}

/**
 * Authoritative Server-Side Promo Code Validator
 *
 * Verifies code existence, active status, date range, overall usage limit,
 * per-user usage limit, minimum cart order value, target item scope, and
 * calculates the accurate discount amount according to discount_type and caps.
 */
export async function validatePromoCode(
  supabase: SupabaseClient | any,
  input: PromoValidationInput
): Promise<PromoValidationOutput> {
  const { code, cartItems, subtotal, userId } = input;

  if (!code || typeof code !== "string" || !code.trim()) {
    return { valid: false, reason: "No promo code provided." };
  }

  const cleanCode = code.trim().toUpperCase();

  // 1. Fetch promo code from DB
  const { data: promo, error: promoError } = await (supabase as any)
    .from("promo_codes")
    .select("*")
    .eq("code", cleanCode)
    .maybeSingle();

  if (promoError || !promo) {
    return { valid: false, reason: "Invalid promo code." };
  }

  // 2. Active status check
  if (!promo.is_active) {
    return { valid: false, reason: "This promo code is no longer active." };
  }

  // 3. Date range check
  const now = new Date();
  if (promo.starts_at && new Date(promo.starts_at) > now) {
    return { valid: false, reason: "This promo code is not active yet." };
  }
  if (promo.expires_at && new Date(promo.expires_at) < now) {
    return { valid: false, reason: "This promo code has expired." };
  }

  // 4. Overall usage limit check
  if (promo.usage_limit_total !== null && (promo.times_used ?? 0) >= promo.usage_limit_total) {
    return { valid: false, reason: "This promo code has reached its maximum usage limit." };
  }

  // 5. Per-user usage limit check (for logged-in users)
  if (promo.usage_limit_per_user !== null && userId) {
    const { count, error: countErr } = await (supabase as any)
      .from("promo_code_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("promo_code_id", promo.id)
      .eq("user_id", userId);

    if (!countErr && (count ?? 0) >= promo.usage_limit_per_user) {
      return {
        valid: false,
        reason: `You have already used this code the maximum allowed number of times (${promo.usage_limit_per_user}×).`,
      };
    }
  }

  // 6. Minimum order value check
  const minOrderVal = Number(promo.min_order_value) || 0;
  if (minOrderVal > 0 && subtotal < minOrderVal) {
    const diff = Math.ceil(minOrderVal - subtotal);
    return {
      valid: false,
      reason: `Minimum order value of ₹${minOrderVal} required. Add ₹${diff} more to apply this code.`,
    };
  }

  // 7. Qualifying items subtotal based on applies_to
  const qualifyingSubtotal = computeQualifyingSubtotal(promo, cartItems, subtotal);
  if (qualifyingSubtotal === null || qualifyingSubtotal <= 0) {
    const scopeLabel =
      promo.applies_to === "product"
        ? "specific products"
        : promo.applies_to === "combo"
        ? "specific combos"
        : promo.applies_to === "category"
        ? "specific categories"
        : "qualifying products";
    return {
      valid: false,
      reason: `This promo code only applies to ${scopeLabel} not currently in your cart.`,
    };
  }

  // 8. Compute discount amount
  let discountAmount = 0;
  const isFreeShipping = promo.discount_type === "free_shipping";

  if (promo.discount_type === "flat") {
    discountAmount = Math.min(Number(promo.discount_value), qualifyingSubtotal);
  } else if (promo.discount_type === "percentage") {
    const rawDiscount = (qualifyingSubtotal * Number(promo.discount_value)) / 100;
    discountAmount = promo.max_discount_cap !== null
      ? Math.min(rawDiscount, Number(promo.max_discount_cap))
      : rawDiscount;
  } else if (isFreeShipping) {
    discountAmount = 0;
  }

  // Round discount to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true,
    code: cleanCode,
    promoId: promo.id,
    discountType: promo.discount_type as DiscountType,
    discountAmount,
    isFreeShipping,
    qualifyingSubtotal,
  };
}

/**
 * Atomically records a promo code redemption for a confirmed paid order.
 * Prevents double-counting and creates an audit trail in promo_code_redemptions.
 */
export async function recordPromoRedemption(
  supabase: SupabaseClient | any,
  params: {
    orderId: string;
    promoCode: string;
    userId?: string | null;
    discountAmount: number;
  }
): Promise<void> {
  const { orderId, promoCode, userId, discountAmount } = params;
  if (!promoCode || !orderId) return;

  const cleanCode = promoCode.trim().toUpperCase();

  // Find promo code ID
  const { data: promo } = await (supabase as any)
    .from("promo_codes")
    .select("id, times_used")
    .eq("code", cleanCode)
    .maybeSingle();

  if (!promo) return;

  // Check if redemption already recorded for this order (idempotent)
  const { data: existing } = await (supabase as any)
    .from("promo_code_redemptions")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) return;

  // Insert redemption record
  await (supabase as any).from("promo_code_redemptions").insert({
    promo_code_id: promo.id,
    user_id: userId || null,
    order_id: orderId,
    discount_applied: discountAmount,
  });

  // Note: If postgres RPC process_order_payment already incremented times_used,
  // we do not increment again here.
}
