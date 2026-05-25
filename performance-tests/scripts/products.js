/**
 * Products Listing Performance Test
 * 
 * Objectives:
 * - Measure `/products` collection page HTML load speed.
 * - Measure Supabase products retrieval API.
 * - Dynamically parse retrieved product images and simulate browser download of product assets.
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, randomChoice, generateReportsSummary } from '../utils/helpers.js';

const productsLoadTrend = new Trend('products_page_load_duration');
const apiResponseTrend = new Trend('api_response_duration');
const imageLoadTrend = new Trend('image_load_duration');
const dbQueryTrend = new Trend('db_query_duration');

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: THRESHOLDS.products
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;

  // 1. Visit the `/products` page
  const pageRes = http.get(`${CONFIG.baseUrl}/products`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  productsLoadTrend.add(pageRes.timings.duration);
  validateResponse(pageRes, 'Products Page HTML', false);

  thinkTime();

  // 2. Fetch active products list from Supabase
  // Query: products?select=*&is_active=eq.true&order=price.asc
  const apiRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(apiRes.timings.duration);
  dbQueryTrend.add(apiRes.timings.duration);
  const isValid = validateResponse(apiRes, 'Products List API');

  if (isValid) {
    const products = JSON.parse(apiRes.body);
    if (products && products.length > 0) {
      // Pick a random product from the list and load its images to simulate realistic browsing
      const randomProduct = randomChoice(products);
      
      // Parse images (row stores it as JSON array or text array)
      let images = [];
      if (Array.isArray(randomProduct.images)) {
        images = randomProduct.images;
      } else if (typeof randomProduct.images === 'string') {
        try {
          images = JSON.parse(randomProduct.images);
        } catch(e) {
          images = [randomProduct.images];
        }
      }

      if (images && images.length > 0) {
        const imageUrl = images[0];
        
        // Simulating image fetch. We skip external domains like lh3.googleusercontent.com to focus on local/CDN static assets,
        // or load them to measure external connection latency. Let's make the call.
        const imageRes = http.get(imageUrl, {
          headers: commonHeaders,
          timeout: CONFIG.timeouts.staticAsset
        });
        imageLoadTrend.add(imageRes.timings.duration);
      }
    }
  }

  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
