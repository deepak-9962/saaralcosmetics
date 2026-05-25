/**
 * Product Detail Page Performance Test
 * 
 * Objectives:
 * - Measure `/products/[slug]` page HTML load speed.
 * - Measure Supabase product detail lookup by slug API.
 * - Measure related product recommendation loading API.
 * - Test multiple products from the catalog to ensure cache variations.
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, randomChoice, generateReportsSummary } from '../utils/helpers.js';

const productDetailLoadTrend = new Trend('product_detail_page_load_duration');
const apiResponseTrend = new Trend('api_response_duration');
const dbQueryTrend = new Trend('db_query_duration');

// Array of real product objects from catalog to query
const PRODUCT_CATALOG = [
  { slug: 'kuppaimeni-soap', category: 'soap' },
  { slug: 'activated-charcoal-soap', category: 'soap' },
  { slug: 'manjistha-athimadhuram-soap', category: 'soap' },
  { slug: 'vetpalai-soap', category: 'soap' },
  { slug: 'nalangu-maavu-soap', category: 'soap' },
  { slug: 'redwine-soap', category: 'soap' },
  { slug: 'redwine-facewash', category: 'face-wash' },
  { slug: 'butterfly-pea-facewash-sangoo-poo', category: 'face-wash' },
  { slug: 'nalangu-maavu-bath-powder-100g', category: 'nalangu-maavu' },
  { slug: 'nalangu-maavu-bath-powder-250g', category: 'nalangu-maavu' },
  { slug: 'saaral-anti-aging-pigmentation-cream-15g', category: 'face-cream' },
  { slug: 'saaral-anti-aging-pigmentation-cream-30g', category: 'face-cream' },
  { slug: 'saaral-skin-whitening-cream-15g', category: 'face-cream' },
  { slug: 'saaral-skin-whitening-cream-30g', category: 'face-cream' }
];

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: THRESHOLDS.productDetail
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;

  // Pick a random product to load
  const product = randomChoice(PRODUCT_CATALOG);

  // 1. Visit the product detail page HTML
  const pageRes = http.get(`${CONFIG.baseUrl}/products/${product.slug}`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  productDetailLoadTrend.add(pageRes.timings.duration);
  validateResponse(pageRes, `Product Page HTML [${product.slug}]`, false);

  thinkTime();

  // 2. Fetch specific product data by slug from Supabase
  // Query: products?select=*&is_active=eq.true&slug=eq.saffron-radiance-elixir&limit=1
  const detailUrl = `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&slug=eq.${product.slug}`;
  const detailRes = http.get(detailUrl, {
    headers: dbHeaders,
    timeout: CONFIG.timeouts.apiCall
  });
  apiResponseTrend.add(detailRes.timings.duration);
  dbQueryTrend.add(detailRes.timings.duration);
  validateResponse(detailRes, `Product Detail API [${product.slug}]`);

  thinkTime();

  // 3. Fetch related products from Supabase
  // Query: products?select=*&category=eq.face-cream&is_active=eq.true&slug=neq.saffron-radiance-elixir&order=created_at.desc&limit=4
  const relatedUrl = `${CONFIG.supabaseUrl}/rest/v1/products?select=*&category=eq.${product.category}&is_active=eq.true&slug=neq.${product.slug}&order=created_at.desc&limit=4`;
  const relatedRes = http.get(relatedUrl, {
    headers: dbHeaders,
    timeout: CONFIG.timeouts.apiCall
  });
  apiResponseTrend.add(relatedRes.timings.duration);
  dbQueryTrend.add(relatedRes.timings.duration);
  validateResponse(relatedRes, `Related Products API [${product.slug}]`);

  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
