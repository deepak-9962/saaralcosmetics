/**
 * Shipping fee calculation rules for Saaral Cosmetics:
 * - Flat shipping rate: ₹60 (when applicable)
 * - Free shipping for Tamil Nadu: orders >= ₹499
 * - Free shipping for Rest of India: orders >= ₹999
 * - Promo code with discount_type "free_shipping": ₹0 regardless of total
 */

export const FLAT_SHIPPING_FEE = 60;
export const TN_FREE_SHIPPING_THRESHOLD = 499;
export const NATIONAL_FREE_SHIPPING_THRESHOLD = 999;

/**
 * Checks whether the specified state string matches Tamil Nadu.
 */
export function isTamilNadu(state?: string | null): boolean {
  if (!state) return false;
  const clean = state.trim().toLowerCase().replace(/[^a-z]/g, "");
  return clean === "tamilnadu" || clean === "tn";
}

/**
 * Gets the free shipping threshold for a given destination state.
 * @param state Destination state name
 * @returns 499 for Tamil Nadu, 999 for all other states / unspecified
 */
export function getFreeShippingThreshold(state?: string | null): number {
  return isTamilNadu(state) ? TN_FREE_SHIPPING_THRESHOLD : NATIONAL_FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculates shipping charge based on purchase amount (subtotal), destination state,
 * and whether a free-shipping promo is applied.
 *
 * @param subtotal Purchase amount after item/coupon discounts
 * @param state Destination Indian state
 * @param isFreeShippingPromo Whether a free_shipping promo code was validated
 * @returns 0 (free shipping) or ₹60
 */
export function calculateShippingCharge(
  subtotal: number,
  state?: string | null,
  isFreeShippingPromo = false
): number {
  if (isFreeShippingPromo) {
    return 0;
  }
  const threshold = getFreeShippingThreshold(state);
  return subtotal >= threshold ? 0 : FLAT_SHIPPING_FEE;
}
