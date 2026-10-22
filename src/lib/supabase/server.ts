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
import fs from "fs";
import path from "path";
import type { Database } from "./database.types";

function getEnvFallback(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match && match[1].trim() === key) {
          const val = match[2].trim().replace(/^["']|["']$/g, "");
          process.env[key] = val;
          return val;
        }
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Returns a Supabase client authenticated as service_role.
 * Call this only inside Next.js API routes (route.ts) or Server Actions.
 *
 * @throws if NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing.
 */
export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || getEnvFallback("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || getEnvFallback("SUPABASE_SERVICE_ROLE_KEY");

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
  // Server-side clients do not use Realtime. Providing a stub transport prevents Node 20
  // native WebSocket errors from @supabase/realtime-js.
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: typeof WebSocket !== "undefined" ? WebSocket : (class WebSocketStub {} as any),
    },
  });
}
