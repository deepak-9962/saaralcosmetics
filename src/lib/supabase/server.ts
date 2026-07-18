/**
 * server.ts — Supabase client for server-side use ONLY.
 *
 * Uses the SERVICE_ROLE_KEY which grants full database access and BYPASSES
 * Row Level Security (RLS). This must NEVER be imported or used in any
 * client component or client-side module.
 *
 * Use cases:
 *  - Uploading product images (API route: /api/products/upload)
 *  - Any admin write operations that need to bypass RLS
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Returns a Supabase client authenticated as service_role.
 * Call this only inside Next.js API routes (route.ts) or Server Actions.
 *
 * @throws if NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing.
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY — " +
        "add it to .env.local and Vercel project settings (server-only)."
    );
  }

  // auth.persistSession = false is required for server-side clients so
  // Supabase doesn't try to persist a session to browser storage.
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
