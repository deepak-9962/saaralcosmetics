/**
 * Saaral Cosmetics k6 Moderate Load Test
 * 
 * Objectives:
 * - Validate normal peak traffic scalability.
 * - Test concurrent user behaviors under average operating conditions (up to 50 VUs).
 */
import { THRESHOLDS } from '../utils/thresholds.js';
import { generateReportsSummary } from '../utils/helpers.js';

// Import the complete user journey from stress-test to avoid code duplication
import userJourney from './stress-test.js';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: THRESHOLDS.stress
};

// Re-export the core user shopping journey as the default function
export default userJourney;

export function handleSummary(data) {
  return generateReportsSummary(data);
}
