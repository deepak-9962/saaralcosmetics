/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a sliding window per IP address.
 *
 * This runs in the same Node.js process as the route handlers,
 * so state is shared across requests while the server is alive.
 * For production at scale, replace with Redis/Upstash.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Global store: ip -> { count, windowStart }
const store = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now - entry.windowStart > 60_000) {
      store.delete(ip);
    }
  }
}, 60_000);

/**
 * Check if the given IP has exceeded the allowed request count
 * within the time window.
 *
 * @param ip          - Client IP address
 * @param maxRequests - Max allowed requests in the window
 * @param windowMs    - Window size in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Extract the real client IP from the request headers.
 * Works with Vercel, Cloudflare, and direct connections.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
