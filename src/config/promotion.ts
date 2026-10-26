/**
 * Promotional Offer & Countdown Banner Configuration
 *
 * Easily update the promotional message, target end date (IST),
 * destination link, and display options here.
 */

export interface PromotionCampaign {
  /** Unique campaign ID — changing this resets dismissal for a new campaign */
  id: string;

  /** Master switch to show or hide the announcement countdown bar */
  enabled: boolean;

  /** Promotional offer headline */
  message: string;

  /** Target promotion expiration date (ISO 8601 string with IST timezone +05:30) */
  endDate: string;

  /** Destination URL when the banner is clicked (e.g. "/products" or "/products?category=face-wash") */
  targetUrl?: string;

  /** Message to display when the countdown reaches 00:00:00 */
  expiredMessage: string;

  /** What to do when expired: "show-expired" to show expiration text, or "hide" to hide the bar */
  onExpire: "show-expired" | "hide";

  /** Allow visitors to close the bar via the (X) button */
  allowDismiss: boolean;
}

export const CURRENT_PROMOTION: PromotionCampaign = {
  id: "saaral_festive_sale_50_2026",
  enabled: true,
  message: "FLAT 50% OFF — SALE ENDS IN",
  endDate: "2026-11-02T23:59:59+05:30", // Configured in Indian Standard Time (IST)
  targetUrl: "/products",
  expiredMessage: "THIS OFFER HAS ENDED",
  onExpire: "show-expired",
  allowDismiss: false,
};
