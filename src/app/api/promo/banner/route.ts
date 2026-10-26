/**
 * GET /api/promo/banner
 *
 * Public endpoint that returns active, in-range, show_in_banner=true promo codes.
 * Exposes safe fields including expires_at for the countdown timer.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const key = serviceKey || anonKey;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key
    );

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("code, description, discount_type, discount_value, max_discount_cap, expires_at")
      .eq("is_active", true)
      .eq("show_in_banner", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`expires_at.is.null,expires_at.gte.${nowIso}`);

    if (error) {
      console.error("[promo/banner] Query error:", error.message);
      // Fallback to view query
      const { data: viewData } = await supabase
        .from("promo_banner_view")
        .select("code, description, discount_type, discount_value, max_discount_cap");
      return NextResponse.json({ codes: viewData ?? [] });
    }

    return NextResponse.json(
      { codes: data ?? [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("[promo/banner] Unexpected error:", err);
    return NextResponse.json({ codes: [] });
  }
}
