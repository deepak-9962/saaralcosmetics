/**
 * Performance Thresholds for Saaral Cosmetics k6 Performance Suite
 * 
 * Target criteria:
 * - http_req_failed (Error Rate) < 1%
 * - p95 http_req_duration < 800ms across all requests
 * - Homepage avg response < 500ms
 * - LCP / Page Load Simulation < 2s
 */

export const THRESHOLDS = {
  // Global performance thresholds
  global: {
    // Error rate must be less than 1%
    'http_req_failed': ['rate<0.01'],
    // 95% of all requests must complete within 800ms
    'http_req_duration': ['p(95)<800'],
  },

  // Targeted thresholds using custom metrics/trends
  homepage: {
    'http_req_failed': ['rate<0.01'],
    'homepage_load_duration': ['avg<500', 'p(95)<1000'],
    'image_load_duration': ['p(95)<1500'],
  },

  products: {
    'http_req_failed': ['rate<0.01'],
    'api_response_duration': ['p(95)<800'],
    'db_query_duration': ['p(95)<500'],
  },

  categories: {
    'http_req_failed': ['rate<0.01'],
    'api_response_duration': ['p(95)<800'],
    'category_switch_duration': ['p(95)<600', 'avg<300'],
    'db_query_duration': ['p(95)<500'],
  },

  productDetail: {
    'http_req_failed': ['rate<0.01'],
    'api_response_duration': ['p(95)<800'],
    'db_query_duration': ['p(95)<500'],
  },

  search: {
    'http_req_failed': ['rate<0.01'],
    'api_response_duration': ['p(95)<800'],
    'db_query_duration': ['p(95)<500'],
  },

  checkout: {
    'http_req_failed': ['rate<0.01'],
    'checkout_duration': ['p(95)<1500', 'avg<1000'],
  },

  // Extreme thresholds for Stress/Spike testing where we tolerate slightly higher degradation
  stress: {
    'http_req_failed': ['rate<0.05'], // Max 5% errors under stress
    'http_req_duration': ['p(95)<1500'],
    'api_response_duration': ['p(95)<1200'],
  }
};
