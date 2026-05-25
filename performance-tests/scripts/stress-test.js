/**
 * Saaral Cosmetics k6 Stress Test
 * 
 * Objectives:
 * - Push the system beyond normal operating limits.
 * - Test infrastructure scalability (Next.js routing, Vercel cold starts, Supabase connection capacity).
 * - Simulates a complete user journey under high concurrent traffic (up to 300 VUs).
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { 
  validateResponse, 
  thinkTime, 
  randomChoice, 
  generateFakeOrderPayload,
  CATEGORIES, 
  SEARCH_QUERIES, 
  generateReportsSummary 
} from '../utils/helpers.js';

// Custom trends to record full-journey metrics
const userJourneyTrend = new Trend('user_journey_duration');
const apiResponseTrend = new Trend('api_response_duration');

const PRODUCT_SLUGS = [
  'kuppaimeni-soap',
  'activated-charcoal-soap',
  'redwine-facewash',
  'nalangu-maavu-soap',
  'saaral-skin-whitening-cream-30g'
];

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '3m', target: 300 },
    { duration: '2m', target: 0 },
  ],
  thresholds: THRESHOLDS.stress
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;
  const startTime = Date.now();

  // ============================================================
  // STEP 1: Open Homepage
  // ============================================================
  const homeRes = http.get(CONFIG.baseUrl, { headers: commonHeaders });
  validateResponse(homeRes, 'Homepage HTML', false);
  
  // Featured products API
  const featuredRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(featuredRes.timings.duration);
  validateResponse(featuredRes, 'Featured Products API');
  
  thinkTime();

  // ============================================================
  // STEP 2: Browse Collections Page
  // ============================================================
  const collectionsRes = http.get(`${CONFIG.baseUrl}/products`, { headers: commonHeaders });
  validateResponse(collectionsRes, 'Collections HTML', false);
  
  const allProdRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(allProdRes.timings.duration);
  validateResponse(allProdRes, 'All Products API');

  thinkTime();

  // ============================================================
  // STEP 3: Switch Categories (Filter)
  // ============================================================
  const cat = randomChoice(CATEGORIES);
  const catRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc&category=eq.${cat}`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(catRes.timings.duration);
  validateResponse(catRes, `Category Filter API [${cat}]`);

  thinkTime();

  // ============================================================
  // STEP 4: Search Products
  // ============================================================
  const query = randomChoice(SEARCH_QUERIES);
  const searchRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(searchRes.timings.duration);
  validateResponse(searchRes, `Search API [${query}]`);

  thinkTime();

  // ============================================================
  // STEP 5: Open Product Detail Page
  // ============================================================
  const slug = randomChoice(PRODUCT_SLUGS);
  const prodPageRes = http.get(`${CONFIG.baseUrl}/products/${slug}`, { headers: commonHeaders });
  validateResponse(prodPageRes, `Product Details Page HTML [${slug}]`, false);

  const detailRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&slug=eq.${slug}`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(detailRes.timings.duration);
  validateResponse(detailRes, `Product Detail API [${slug}]`);

  thinkTime();

  // ============================================================
  // STEP 6: Add Product to Cart & View Cart
  // ============================================================
  const cartPageRes = http.get(`${CONFIG.baseUrl}/cart`, { headers: commonHeaders });
  validateResponse(cartPageRes, 'Cart Page HTML', false);

  thinkTime();

  // ============================================================
  // STEP 7: Checkout & Place Order (Tests Only)
  // ============================================================
  const checkoutPageRes = http.get(`${CONFIG.baseUrl}/checkout`, { headers: commonHeaders });
  validateResponse(checkoutPageRes, 'Checkout Page HTML', false);

  // Cart verification
  const checkRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=id&id=in.(b7fc81ca-928a-4b75-b163-cf1dc46cbf9c)&is_active=eq.true`,
    { headers: dbHeaders }
  );
  apiResponseTrend.add(checkRes.timings.duration);
  validateResponse(checkRes, 'Checkout Cart Verification API');

  // Submit order unless production
  if (CONFIG.env !== 'production' || __ENV.FORCE_WRITE === 'true') {
    const fakeItem = [
      {
        product_id: 'b7fc81ca-928a-4b75-b163-cf1dc46cbf9c',
        name: 'Kuppaimeni Soap',
        price: 35,
        quantity: 1,
        variant_name: '100g',
        image: '/images/cat-soap.webp'
      }
    ];
    const payload = generateFakeOrderPayload(fakeItem, 35);

    const postHeaders = Object.assign({}, dbHeaders, {
      'Prefer': 'return=representation'
    });

    const orderRes = http.post(
      `${CONFIG.supabaseUrl}/rest/v1/orders`,
      JSON.stringify(payload),
      { headers: postHeaders }
    );
    apiResponseTrend.add(orderRes.timings.duration);
    validateResponse(orderRes, 'Checkout Order Submission API');
  }

  thinkTime();

  // ============================================================
  // STEP 8: Return to Homepage
  // ============================================================
  const returnRes = http.get(CONFIG.baseUrl, { headers: commonHeaders });
  validateResponse(returnRes, 'Return Homepage HTML', false);

  // Track full journey length
  userJourneyTrend.add(Date.now() - startTime);

  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
