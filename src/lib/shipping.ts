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
 * Checks whether a given 6-digit Indian PIN code belongs to Tamil Nadu.
 * Tamil Nadu PIN codes span prefixes 60 to 64 (ranges 600001 - 643999).
 * Specific Puducherry codes in the 605 range are excluded.
 */
export function isTamilNaduPincode(pincode?: string | null): boolean {
  if (!pincode) return false;
  const clean = pincode.trim().replace(/\D/g, "");
  if (clean.length !== 6) return false;

  const prefix2 = parseInt(clean.substring(0, 2), 10);
  if (prefix2 >= 60 && prefix2 <= 64) {
    const fullPin = parseInt(clean, 10);
    // Exclude Puducherry UT post offices in 605 range
    if (
      (fullPin >= 605001 && fullPin <= 605014) ||
      fullPin === 605102 ||
      fullPin === 605107 ||
      fullPin === 605110
    ) {
      return false; // Puducherry
    }
    return true;
  }
  return false;
}

/**
 * Resolves Indian State name from a 6-digit PIN code using India Post postal prefixes.
 */
export function getStateFromPincode(pincode?: string | null): string | null {
  if (!pincode) return null;
  const clean = pincode.trim().replace(/\D/g, "");
  if (clean.length !== 6) return null;

  const prefix2 = parseInt(clean.substring(0, 2), 10);
  const prefix3 = parseInt(clean.substring(0, 3), 10);
  const fullPin = parseInt(clean, 10);

  // Puducherry UT post offices
  if (
    (fullPin >= 605001 && fullPin <= 605014) ||
    fullPin === 605102 ||
    fullPin === 605107 ||
    fullPin === 605110
  ) {
    return "Puducherry";
  }

  // Tamil Nadu (60 - 64)
  if (prefix2 >= 60 && prefix2 <= 64) return "Tamil Nadu";

  // Kerala (67 - 69)
  if (prefix2 >= 67 && prefix2 <= 69) return "Kerala";

  // Karnataka (56 - 59)
  if (prefix2 >= 56 && prefix2 <= 59) return "Karnataka";

  // Andhra Pradesh & Telangana (50 - 53)
  if (prefix2 >= 50 && prefix2 <= 53) {
    if (prefix3 >= 500 && prefix3 <= 509) return "Telangana";
    return "Andhra Pradesh";
  }

  // Maharashtra & Goa (40 - 44)
  if (prefix2 >= 40 && prefix2 <= 44) {
    if (prefix3 === 403) return "Goa";
    return "Maharashtra";
  }

  // Gujarat (36 - 39)
  if (prefix2 >= 36 && prefix2 <= 39) return "Gujarat";

  // Rajasthan (30 - 34)
  if (prefix2 >= 30 && prefix2 <= 34) return "Rajasthan";

  // Madhya Pradesh & Chhattisgarh (45 - 49)
  if (prefix2 >= 45 && prefix2 <= 49) {
    if (prefix3 >= 490 && prefix3 <= 497) return "Chhattisgarh";
    return "Madhya Pradesh";
  }

  // Uttar Pradesh & Uttarakhand (20 - 28)
  if (prefix2 >= 20 && prefix2 <= 28) {
    if ((prefix3 >= 246 && prefix3 <= 249) || prefix3 === 263) return "Uttarakhand";
    return "Uttar Pradesh";
  }

  // Delhi (11)
  if (prefix2 === 11) return "Delhi";

  // Haryana (12, 13)
  if (prefix2 === 12 || prefix2 === 13) return "Haryana";

  // Punjab (14, 15)
  if (prefix2 === 14 || prefix2 === 15) return "Punjab";

  // Chandigarh (16)
  if (prefix2 === 16) return "Chandigarh";

  // Himachal Pradesh (17)
  if (prefix2 === 17) return "Himachal Pradesh";

  // Jammu & Kashmir / Ladakh (18, 19)
  if (prefix2 === 18 || prefix2 === 19) {
    if (prefix3 === 194) return "Ladakh";
    return "Jammu and Kashmir";
  }

  // West Bengal & Andaman (70 - 74)
  if (prefix2 >= 70 && prefix2 <= 74) return "West Bengal";

  // Odisha (75 - 77)
  if (prefix2 >= 75 && prefix2 <= 77) return "Odisha";

  // Assam (78)
  if (prefix2 === 78) return "Assam";

  // North-Eastern states (79)
  if (prefix2 === 79) {
    if (prefix3 >= 790 && prefix3 <= 792) return "Arunachal Pradesh";
    if (prefix3 === 793 || prefix3 === 794) return "Meghalaya";
    if (prefix3 === 795) return "Manipur";
    if (prefix3 === 796) return "Mizoram";
    if (prefix3 === 797 || prefix3 === 798) return "Nagaland";
    if (prefix3 === 799) return "Tripura";
    return "Assam";
  }

  // Bihar & Jharkhand (80 - 85)
  if (prefix2 >= 80 && prefix2 <= 85) {
    if (prefix3 >= 814 && prefix3 <= 835) return "Jharkhand";
    return "Bihar";
  }

  return null;
}

/**
 * Checks whether the specified state string or pincode represents Tamil Nadu.
 */
export function isTamilNadu(state?: string | null, pincode?: string | null): boolean {
  if (state) {
    const clean = state.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (clean === "tamilnadu" || clean === "tn") return true;
  }
  if (pincode) {
    return isTamilNaduPincode(pincode);
  }
  return false;
}

/**
 * Gets the free shipping threshold for a given destination state and/or pincode.
 * @param state Destination state name
 * @param pincode Destination pincode (optional)
 * @returns 499 for Tamil Nadu, 999 for all other states / unspecified
 */
export function getFreeShippingThreshold(state?: string | null, pincode?: string | null): number {
  return isTamilNadu(state, pincode) ? TN_FREE_SHIPPING_THRESHOLD : NATIONAL_FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculates shipping charge based on purchase amount (subtotal), destination state,
 * optional free-shipping promo, and optional pincode.
 *
 * @param subtotal Purchase amount after item/coupon discounts
 * @param state Destination Indian state
 * @param isFreeShippingPromo Whether a free_shipping promo code was validated
 * @param pincode Destination 6-digit Indian PIN code (optional)
 * @returns 0 (free shipping) or ₹60
 */
export function calculateShippingCharge(
  subtotal: number,
  state?: string | null,
  isFreeShippingPromo = false,
  pincode?: string | null
): number {
  if (isFreeShippingPromo) {
    return 0;
  }
  const threshold = getFreeShippingThreshold(state, pincode);
  return subtotal >= threshold ? 0 : FLAT_SHIPPING_FEE;
}
