/**
 * Saaral Cosmetics k6 Baseline Performance Test (Before Optimizations)
 * 
 * Objectives:
 * - Establish a definitive performance baseline at 100 Virtual Users.
 * - Sustain load for exactly 5 minutes.
 * - Save the report as baseline-100vu-before-optimization.html.
 */
import { THRESHOLDS } from '../utils/thresholds.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Import the complete user journey from stress-test to ensure realistic user flows
import userJourney from './stress-test.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Quick ramp up to 100 VUs
    { duration: '4m', target: 100 },  // Sustain 100 VUs for 4 minutes
    { duration: '30s', target: 0 }    // Cool down
  ],
  // No strict fail aborts to ensure we complete the baseline capture
  thresholds: {
    'http_req_failed': ['rate>=0.0'],
    'http_req_duration': ['p(95)>=0']
  }
};

// Re-export the core user shopping journey as the default function
export default userJourney;

// Custom summary handler to save reports using the specific requested file names
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-tests/reports/baseline-100vu-before-optimization.json': JSON.stringify(data, null, 2),
    'performance-tests/reports/baseline-100vu-before-optimization.html': htmlReport(data, {
      title: 'Saaral Cosmetics - Baseline Performance Report (100 VUs Before Optimizations)',
    }),
  };
}
