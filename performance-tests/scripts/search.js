/**
 * Search Page & API Performance Test
 * 
 * Objectives:
 * - Test loading the products catalog page with search query parameters.
 * - Test valid search keywords ('soap', 'cream', 'face wash', 'herbal', 'saaral').
 * - Test empty search parameters and invalid searches.
 * - Simulate repeated query submissions and debounce behaviors.
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, randomChoice, generateReportsSummary } from '../utils/helpers.js';

const searchLoadTrend = new Trend('search_load_duration');
const apiResponseTrend = new Trend('api_response_duration');
const dbQueryTrend = new Trend('db_query_duration');

const SEARCH_TERMS = ['soap', 'cream', 'face wash', 'herbal', 'saaral'];
const INVALID_TERMS = ['unknownproduct', 'invalidquery123', 'nonexistent_shampoo'];

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: THRESHOLDS.search
};

export default function () {
  const commonHeaders = CONFIG.headers.common;
  const dbHeaders = CONFIG.headers.supabase;

  // 1. Simulate standard searches
  const term = randomChoice(SEARCH_TERMS);
  
  // Hit page with search query parameter (server routing validation)
  const pageRes = http.get(`${CONFIG.baseUrl}/products?search=${encodeURIComponent(term)}`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  searchLoadTrend.add(pageRes.timings.duration);
  validateResponse(pageRes, `Page Search [${term}]`, false);

  // Search mounts listProducts('all') under the hood
  const apiRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(apiRes.timings.duration);
  dbQueryTrend.add(apiRes.timings.duration);
  validateResponse(apiRes, `Search API [${term}]`);

  // Simulate user reading/debounce pause
  sleep(0.5);

  // 2. Simulate Repeated Search (Cache testing)
  const repeatRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(repeatRes.timings.duration);
  dbQueryTrend.add(repeatRes.timings.duration);
  validateResponse(repeatRes, `Search API [${term} - Repeated]`);

  thinkTime();

  // 3. Simulate Invalid Search
  const invalidTerm = randomChoice(INVALID_TERMS);
  const invalidRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(invalidRes.timings.duration);
  dbQueryTrend.add(invalidRes.timings.duration);
  validateResponse(invalidRes, `Search API [Invalid - ${invalidTerm}]`);

  thinkTime();

  // 4. Simulate Empty Search
  const emptyRes = http.get(
    `${CONFIG.supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=price.asc`,
    {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    }
  );
  apiResponseTrend.add(emptyRes.timings.duration);
  dbQueryTrend.add(emptyRes.timings.duration);
  validateResponse(emptyRes, 'Search API [Empty]');

  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
