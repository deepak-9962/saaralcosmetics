/**
 * Saaral Cosmetics k6 Spike Test
 * 
 * Objectives:
 * - Simulate a sudden, extreme surge in traffic (e.g., social media mention, product launch, flash sale).
 * - Target: 400 concurrent users.
 * - Test how quickly Vercel Edge caching and Supabase scale to absorb sudden bursts of traffic.
 */
import { THRESHOLDS } from '../utils/thresholds.js';
import { generateReportsSummary } from '../utils/helpers.js';

// Import the complete user journey from stress-test to avoid code duplication
import userJourney from './stress-test.js';

export const options = {
  stages: [
    { duration: '10s', target: 300 },
    { duration: '1m', target: 300 },
    { duration: '10s', target: 0 },
  ],
  thresholds: THRESHOLDS.stress
};

// Re-export the core user shopping journey as the default function
export default userJourney;

export function handleSummary(data) {
  return generateReportsSummary(data);
}
