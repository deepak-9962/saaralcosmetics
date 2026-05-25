/**
 * Homepage Performance Test
 * 
 * Objectives:
 * - Measure homepage HTML document load speed.
 * - Measure hero section image loading performance (detect unoptimized/oversized hero image).
 * - Measure Supabase API queries for featured products.
 * - Test with 10 -> 50 -> 100 -> 300 users with gradual ramping.
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, generateReportsSummary } from '../utils/helpers.js';

// Custom metric trends for fine-grained analysis
const homepageLoadTrend = new Trend('homepage_load_duration');
const imageLoadTrend = new Trend('image_load_duration');
const apiResponseTrend = new Trend('api_response_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp to 10 VUs
    { duration: '1m', target: 50 },   // Ramp to 50 VUs
    { duration: '1m', target: 100 },  // Ramp to 100 VUs
    { duration: '1m', target: 300 },  // Ramp to 300 VUs (stress peak)
    { duration: '30s', target: 0 }    // Cool down to 0 VUs
  ],
  thresholds: THRESHOLDS.homepage
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;

  // 1. Load Homepage HTML
  const homeRes = http.get(CONFIG.baseUrl, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  homepageLoadTrend.add(homeRes.timings.duration);
  validateResponse(homeRes, 'Homepage HTML', false);

  thinkTime();

  // 2. Fetch Hero Image (/images/hero1.png) - explicitly tested to evaluate styling weight
  const heroRes = http.get(`${CONFIG.baseUrl}/images/hero1.png`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.staticAsset
  });
  imageLoadTrend.add(heroRes.timings.duration);
  
  // Custom frontend performance validation: check if hero image is overly heavy (e.g. > 1.5MB)
  if (heroRes.body && heroRes.body.length > 1500000) {
    console.warn(`[Performance Alert] Hero image size is oversized: ${(heroRes.body.length / 1024 / 1024).toFixed(2)}MB. Recommend WebP conversion/compression.`);
  }
  
  // Note: we check status 200 or 404 (in case development setup doesn't have the image file yet)
  const isImageValid = heroRes.status === 200 || heroRes.status === 304 || heroRes.status === 404;
  if (!isImageValid) {
    console.error(`[Error] Hero image failed to load with status: ${heroRes.status}`);
  }

  // 3. Fetch Featured Products from Supabase (REST API)
  // This simulates the `listFeaturedProducts` call on page mount.
  // Query: products?select=*&is_active=eq.true&order=price.asc&limit=3
  const apiRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(apiRes.timings.duration);
  validateResponse(apiRes, 'Featured Products API');

  thinkTime();
}

// Generate reports at the end of the run
export function handleSummary(data) {
  return generateReportsSummary(data);
}
