/**
 * /api/cart — Persistent cart sync for authenticated users.
 *
 * GET  — Fetch the user's DB cart items
 * POST — Upsert a cart item (add or update quantity)
 * DELETE — Remove a cart item or clear all
 *
 * All endpoints verify the session server-side. Client never supplies user_id.
 */

import { NextResponse } from "next/server";
import { getSupabaseSSRClient } from "@/lib/supabase/ssr-client";

const MAX_QTY = 20;

// Validate product_id — must be a non-empty string (UUID or text ID)
function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0 && id.trim().length < 200;
}

export async function GET() {
  try {
    const supabase = await getSupabaseSSRClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const { data, error } = await (supabase as any)
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("[api/cart GET]", err);
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

    const { product_id, name, variant_name, price, quantity, image, slug, is_combo } =
      body as Record<string, unknown>;

    if (!isValidId(product_id)) return NextResponse.json({ error: "Invalid product_id." }, { status: 400 });
    if (typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "name is required." }, { status: 400 });
    if (typeof price !== "number" || price < 0) return NextResponse.json({ error: "Invalid price." }, { status: 400 });

    const qty = typeof quantity === "number" ? Math.max(1, Math.min(MAX_QTY, Math.round(quantity))) : 1;

    const { error } = await (supabase as any)
      .from("cart_items")
      .upsert(
        {
          user_id: user.id,
          product_id: (product_id as string).trim(),
          name: (name as string).trim(),
          variant_name: typeof variant_name === "string" ? variant_name : null,
          price: Math.round((price as number) * 100) / 100,
          quantity: qty,
          image: typeof image === "string" ? image : "",
          slug: typeof slug === "string" ? slug : "",
          is_combo: is_combo === true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" }
      );

    if (error) {
      console.error("[api/cart POST] upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/cart POST]", err);
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
    const clearAll = url.searchParams.get("clear") === "true";

    if (clearAll) {
      const { error } = await (supabase as any)
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (!isValidId(productId)) return NextResponse.json({ error: "product_id is required." }, { status: 400 });

    const { error } = await (supabase as any)
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId!.trim());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/cart DELETE]", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
