/**
 * Saaral Cosmetics k6 Breakpoint Test
 * 
 * Objectives:
 * - Determine the absolute capacity limits of the system.
 * - Find the exact concurrency level (VUs) at which the server or database crashes or fails thresholds.
 * - Ramps from 0 to 1000 VUs continuously.
 * 
 * Note: Breakpoint tests are intended to break the system, so thresholds are omitted or set extremely high
 * to prevent k6 from aborting the run prematurely.
 */
import { generateReportsSummary } from '../utils/helpers.js';

// Import the complete user journey from stress-test to avoid code duplication
import userJourney from './stress-test.js';

export const options = {
  stages: [
    { duration: '10m', target: 1000 } // Linear ramp-up from 0 to 1000 VUs
  ],
  thresholds: {
    // No abort thresholds configured so that the test runs until physical failure
    'http_req_failed': ['rate>=0.0'],
    'http_req_duration': ['p(95)>=0']
  }
};

// Re-export the core user shopping journey as the default function
export default userJourney;

export function handleSummary(data) {
  return generateReportsSummary(data);
}
