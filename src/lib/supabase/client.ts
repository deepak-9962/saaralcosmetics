import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";
import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey, {
    isSingleton: true,
    auth: {
      lock: async (name, acquireTimeout, fn) => {
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.locks) {
          try {
            return await navigator.locks.request(
              name,
              acquireTimeout === 0
                ? { mode: "exclusive", ifAvailable: true }
                : { mode: "exclusive" },
              async (lock) => {
                if (lock) {
                  return await fn();
                }
                // If lock is held by another tab during background refresh tick,
                // don't throw an unhandled rejection
                if (acquireTimeout === 0) {
                  return undefined as any;
                }
                return await fn();
              }
            );
          } catch {
            // Fall back to direct execution if lock fails
            return await fn();
          }
        }
        return await fn();
      },
    },
  });
  return browserClient;
}
