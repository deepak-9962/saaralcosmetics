/**
 * Category Switching Performance Test
 * 
 * Objectives:
 * - Test category filtering API performance under rapid changes.
 * - Detect Supabase database connection issues / API overload.
 * - Measure switching latency for: All, Face Cream, Face Wash, Soap, Nalangu Maavu.
 * - Simulate rapid user clicking with minimal think times (200ms - 600ms).
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, rapidInteractionTime, generateReportsSummary } from '../utils/helpers.js';

const categorySwitchTrend = new Trend('category_switch_duration');
const apiResponseTrend = new Trend('api_response_duration');
const dbQueryTrend = new Trend('db_query_duration');

// Define specific slugs used in Saaral Cosmetics
const CATEGORY_SLUGS = ['all', 'face-cream', 'face-wash', 'soap', 'nalangu-maavu'];

export const options = {
  stages: [
    { duration: '15s', target: 10 },  // Quick ramp
    { duration: '1m', target: 50 },   // Sustained rapid interactions
    { duration: '15s', target: 0 }
  ],
  thresholds: THRESHOLDS.categories
};

export default function () {
  const dbHeaders = CONFIG.headers.supabase;

  // Simulate a user clicking through all categories rapidly
  for (let i = 0; i < CATEGORY_SLUGS.length; i++) {
    const category = CATEGORY_SLUGS[i];
    let queryPath = 'products?select=*&is_active=eq.true&order=price.asc';
    
    if (category !== 'all') {
      queryPath += `&category=eq.${category}`;
    }

    const url = `${CONFIG.supabaseUrl}/rest/v1/${queryPath}`;
    
    const startTime = Date.now();
    const res = http.get(url, {
      headers: dbHeaders,
      timeout: CONFIG.timeouts.apiCall
    });
    const duration = Date.now() - startTime;
    
    // Add metrics
    categorySwitchTrend.add(duration);
    apiResponseTrend.add(duration);
    dbQueryTrend.add(duration);
    
    validateResponse(res, `Category Switch [${category}]`);

    // Simulate fast user clicking (200ms - 600ms)
    rapidInteractionTime();
  }
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
