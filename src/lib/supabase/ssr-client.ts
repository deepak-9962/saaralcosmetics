/**
 * ssr-client.ts — Supabase client with cookie-based session management.
 *
 * Use this in:
 *  - Next.js Route Handlers (API routes) that need the authenticated user's session
 *  - Server Components that need the authenticated user
 *  - The auth callback route
 *
 * This client reads and writes session cookies correctly for Next.js 16 App Router.
 * It uses the anon key (not service role); RLS applies normally.
 *
 * Do NOT use this for admin operations — use getSupabaseServiceClient() for those.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";
import type { Database } from "./database.types";

export async function getSupabaseSSRClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method is called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
