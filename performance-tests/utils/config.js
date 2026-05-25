/**
 * Global Configuration for Saaral Cosmetics k6 Performance Suite
 */

// Determine the target environment (development, staging, production)
const TARGET_ENV = __ENV.TARGET_ENV || 'development';

const ENVIRONMENTS = {
  development: {
    baseUrl: __ENV.BASE_URL || 'http://localhost:3000',
    supabaseUrl: __ENV.NEXT_PUBLIC_SUPABASE_URL || 'https://tmcfyzcfcrjzdwnquvhf.supabase.co',
    supabaseAnonKey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg3NTIsImV4cCI6MjA5NDI2NDc1Mn0.jOOlylmKaw-CKAbzV6tKmK_1tW2yrgmrMnK_eiva7M0',
  },
  staging: {
    baseUrl: __ENV.BASE_URL || 'https://saaral-staging.vercel.app',
    supabaseUrl: __ENV.NEXT_PUBLIC_SUPABASE_URL || 'https://tmcfyzcfcrjzdwnquvhf.supabase.co',
    supabaseAnonKey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg3NTIsImV4cCI6MjA5NDI2NDc1Mn0.jOOlylmKaw-CKAbzV6tKmK_1tW2yrgmrMnK_eiva7M0',
  },
  production: {
    baseUrl: __ENV.BASE_URL || 'https://saaral.in', // Or the actual live production URL
    supabaseUrl: __ENV.NEXT_PUBLIC_SUPABASE_URL || 'https://tmcfyzcfcrjzdwnquvhf.supabase.co',
    supabaseAnonKey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY2Z5emNmY3JqemR3bnF1dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODg3NTIsImV4cCI6MjA5NDI2NDc1Mn0.jOOlylmKaw-CKAbzV6tKmK_1tW2yrgmrMnK_eiva7M0',
  }
};

const currentEnv = ENVIRONMENTS[TARGET_ENV] || ENVIRONMENTS.development;

export const CONFIG = {
  env: TARGET_ENV,
  baseUrl: currentEnv.baseUrl,
  supabaseUrl: currentEnv.supabaseUrl,
  supabaseAnonKey: currentEnv.supabaseAnonKey,
  
  // Timeout settings
  timeouts: {
    pageLoad: 15000,   // 15s for full page load
    apiCall: 10000,    // 10s for API endpoints
    staticAsset: 5000, // 5s for images/fonts/css/js
  },

  // Standard browser headers
  headers: {
    common: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 k6-perf-test',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
    // Supabase PostgREST Headers
    supabase: {
      'apikey': currentEnv.supabaseAnonKey,
      'Authorization': `Bearer ${currentEnv.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    }
  }
};
