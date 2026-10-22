/**
 * GET /api/products/ratings — returns map of approved average ratings and review counts by productId
 */

import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // Try RPC first
    try {
      const { data, error } = await (supabase as any).rpc("get_all_product_ratings");
      if (!error && Array.isArray(data)) {
        const map: Record<string, { product_id: string; total_reviews: number; average_rating: number }> = {};
        data.forEach((row: any) => {
          map[row.product_id] = {
            product_id: row.product_id,
            total_reviews: Number(row.total_reviews),
            average_rating: Number(row.average_rating),
          };
        });
        return NextResponse.json({ ratings: map });
      }
    } catch {
      // ignore, use fallback
    }

    // Fallback aggregation
    const { data, error } = await (supabase as any)
      .from("product_reviews")
      .select("product_id, rating")
      .eq("status", "approved");

    if (error) {
      console.error("[products/ratings GET error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const map: Record<string, { product_id: string; total_reviews: number; average_rating: number }> = {};
    const grouped: Record<string, number[]> = {};

    (data ?? []).forEach((r: any) => {
      if (!grouped[r.product_id]) grouped[r.product_id] = [];
      grouped[r.product_id].push(Number(r.rating));
    });

    for (const [prodId, ratings] of Object.entries(grouped)) {
      const total = ratings.length;
      const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / total) * 10) / 10;
      map[prodId] = {
        product_id: prodId,
        total_reviews: total,
        average_rating: avg,
      };
    }

    return NextResponse.json({ ratings: map });
  } catch (err) {
    console.error("[products/ratings GET]", err);
    return NextResponse.json({ error: "Failed to fetch product ratings." }, { status: 500 });
  }
}
