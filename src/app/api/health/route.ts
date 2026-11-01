import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const supabase = getSupabaseServiceClient();
    const queryStart = Date.now();
    const { error } = await (supabase as any)
      .from("categories")
      .select("id")
      .limit(1);

    dbLatencyMs = Date.now() - queryStart;

    if (error) {
      dbStatus = "error";
      dbError = error.message;
    } else {
      dbStatus = "healthy";
    }
  } catch (err: any) {
    dbStatus = "unreachable";
    dbError = err.message || "Failed to query database";
  }

  const isHealthy = dbStatus === "healthy";
  const totalDuration = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      server: {
        uptimeSeconds: Math.floor(process.uptime()),
        env: process.env.NODE_ENV,
        nodeVersion: process.version,
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      durationMs: totalDuration,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
