/**
 * /api/wishlist — Persistent wishlist sync for authenticated users.
 *
 * GET    — Fetch the user's DB wishlist product_ids
 * POST   — Add a product to wishlist
 * DELETE — Remove a product from wishlist
 */

import { NextResponse } from "next/server";
import { getSupabaseSSRClient } from "@/lib/supabase/ssr-client";

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0 && id.trim().length < 200;
}

export async function GET() {
  try {
    const supabase = await getSupabaseSSRClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const { data, error } = await (supabase as any)
      .from("wishlist_items")
      .select("product_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: (data ?? []).map((r: any) => r.product_id) });
  } catch (err) {
    console.error("[api/wishlist GET]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseSSRClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const { product_id } = body as Record<string, unknown>;
    if (!isValidId(product_id)) return NextResponse.json({ error: "Invalid product_id." }, { status: 400 });

    const { error } = await (supabase as any)
      .from("wishlist_items")
      .upsert(
        { user_id: user.id, product_id: (product_id as string).trim() },
        { onConflict: "user_id,product_id", ignoreDuplicates: true }
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/wishlist POST]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await getSupabaseSSRClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");
    if (!isValidId(productId)) return NextResponse.json({ error: "product_id is required." }, { status: 400 });

    const { error } = await (supabase as any)
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId!.trim());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/wishlist DELETE]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
