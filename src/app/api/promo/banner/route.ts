/**
 * GET /api/promo/banner
 *
 * Public endpoint that returns active, in-range, show_in_banner=true promo codes.
 * Reads from the `promo_banner_view` — exposes ONLY safe fields.
 * Uses the anonymous client (no secrets exposed).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // ISR: re-fetch at most once per minute

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("promo_banner_view")
      .select("code, description, discount_type, discount_value, max_discount_cap");

    if (error) {
      console.error("[promo/banner] View query error:", error.message);
      return NextResponse.json({ codes: [] });
    }

    return NextResponse.json({ codes: data ?? [] });
  } catch (err) {
    console.error("[promo/banner] Unexpected error:", err);
    return NextResponse.json({ codes: [] });
  }
}
