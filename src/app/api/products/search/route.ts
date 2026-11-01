import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(Number(searchParams.get("limit") || 10), 20);

    const products = await searchProducts(q, limit);

    return NextResponse.json({
      products,
      query: q,
      count: products.length,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("API /api/products/search error:", error);
    return NextResponse.json(
      { error: "Failed to search products", products: [] },
      { status: 500 }
    );
  }
}
