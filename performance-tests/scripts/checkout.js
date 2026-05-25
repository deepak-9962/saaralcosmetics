/**
 * Checkout and Order Placement Performance Test
 * 
 * Objectives:
 * - Measure `/checkout` page HTML load speed.
 * - Simulates `getActiveProductIds` verification call to Supabase.
 * - Submits simulated orders to the `orders` table using REST POST.
 * - Automatically blocks database modifications in production unless forced.
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, generateFakeOrderPayload, generateReportsSummary } from '../utils/helpers.js';

const checkoutLoadTrend = new Trend('checkout_page_load_duration');
const orderCreationTrend = new Trend('checkout_duration');
const apiResponseTrend = new Trend('api_response_duration');

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 15 },
    { duration: '10s', target: 0 }
  ],
  thresholds: THRESHOLDS.checkout
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;

  // Define mock items in cart
  const cartItems = [
    {
      product_id: 'b7fc81ca-928a-4b75-b163-cf1dc46cbf9c',
      name: 'Kuppaimeni Soap',
      price: 35,
      quantity: 1,
      variant_name: '100g',
      image: '/images/cat-soap.webp'
    },
    {
      product_id: 'f9a5bbe7-a1fd-46e9-a5de-86162ed5766e',
      name: 'Activated Charcoal Soap',
      price: 40,
      quantity: 2,
      variant_name: '100g',
      image: '/images/cat-soap.webp'
    }
  ];
  const subtotal = 115; // 35*1 + 40*2

  // 1. Load checkout page HTML
  const pageRes = http.get(`${CONFIG.baseUrl}/checkout`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  checkoutLoadTrend.add(pageRes.timings.duration);
  validateResponse(pageRes, 'Checkout Page HTML', false);

  thinkTime();

  // 2. Query products for active status (simulating `getActiveProductIds`)
  // Query: products?select=id&id=in.(UUID1,UUID2)&is_active=eq.true
  const checkUrl = `${CONFIG.supabaseUrl}/rest/v1/products?select=id&id=in.(b7fc81ca-928a-4b75-b163-cf1dc46cbf9c,f9a5bbe7-a1fd-46e9-a5de-86162ed5766e)&is_active=eq.true`;
  const checkRes = http.get(checkUrl, {
    headers: dbHeaders,
    timeout: CONFIG.timeouts.apiCall
  });
  apiResponseTrend.add(checkRes.timings.duration);
  validateResponse(checkRes, 'Cart Verification API');

  thinkTime();

  // 3. Place Order (POST to orders table)
  // SAFEGUARD: Skip actual database write if environment is production, unless user overrides via env
  if (CONFIG.env === 'production' && __ENV.FORCE_WRITE !== 'true') {
    console.warn(`[Safe Mode] Order submission skipped: Target environment is production. Use FORCE_WRITE=true to override.`);
    return;
  }

  // Generate fake order details
  const payload = generateFakeOrderPayload(cartItems, subtotal);
  payload.payment_status = 'pending';
  payload.order_status = 'new';

  const postHeaders = Object.assign({}, dbHeaders, {
    'Prefer': 'return=representation' // Return inserted row details
  });

  const orderStartTime = Date.now();
  const orderRes = http.post(
    `${CONFIG.supabaseUrl}/rest/v1/orders`,
    JSON.stringify(payload),
    {
      headers: postHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  const orderDuration = Date.now() - orderStartTime;
  
  orderCreationTrend.add(orderDuration);
  apiResponseTrend.add(orderDuration);

  validateResponse(orderRes, 'Order Placement API');

  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
