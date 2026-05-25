/**
 * Saaral Cosmetics k6 Soak Test
 * 
 * Objectives:
 * - Test system stability over an extended period.
 * - Detect memory leaks in the Next.js server processes.
 * - Identify gradual connection leakage in database connection pools.
 * - Monitor database table lock escalation on the Supabase PostgreSQL backend.
 */
import { THRESHOLDS } from '../utils/thresholds.js';
import { generateReportsSummary } from '../utils/helpers.js';

// Import the complete user journey from stress-test to avoid code duplication
import userJourney from './stress-test.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up to moderate load
    { duration: '10m', target: 50 },   // Soak/Sustain load for 10 minutes (normally hours in production runs)
    { duration: '1m', target: 0 }      // Cool down
  ],
  thresholds: THRESHOLDS.api // Require standard high-performance response times
};

// Re-export the core user shopping journey as the default function
export default userJourney;

export function handleSummary(data) {
  return generateReportsSummary(data);
}
