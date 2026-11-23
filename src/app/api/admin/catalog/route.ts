import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient() as any;

    const [productsRes, combosRes, prodCombosRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, variant_name, is_active, category, category_id, price, images")
        .order("name", { ascending: true }),
      supabase
        .from("combos")
        .select("id, name, slug, is_active, image_url, price, compare_price")
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("id, name, slug, variant_name, is_active, category, price, images")
        .eq("category", "combos")
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("id, name, slug, display_order, is_active")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    // Format products
    const products = productsRes.data ?? [];

    // Format combos (merging combos table + products with category = 'combos')
    const comboMap = new Map<string, any>();
    (combosRes.data ?? []).forEach((c: any) => {
      comboMap.set(c.id, {
        id: c.id,
        name: c.name,
        slug: c.slug,
        is_active: c.is_active ?? true,
        image_url: c.image_url,
        price: c.price,
      });
    });
    (prodCombosRes.data ?? []).forEach((p: any) => {
      if (!comboMap.has(p.id)) {
        comboMap.set(p.id, {
          id: p.id,
          name: p.name,
          slug: p.slug,
          is_active: p.is_active ?? true,
          image_url: p.images?.[0] ?? null,
          price: p.price,
        });
      }
    });
    const combos = Array.from(comboMap.values());

    // Format categories
    let categories = categoriesRes.data ?? [];
    if (categories.length === 0) {
      categories = CATEGORIES.map((c) => ({
        id: c.slug,
        name: c.label,
        slug: c.slug,
        display_order: 0,
        is_active: true,
      }));
    }

    return NextResponse.json({
      success: true,
      products,
      combos,
      categories,
      count: {
        products: products.length,
        combos: combos.length,
        categories: categories.length,
      },
    });
  } catch (err: any) {
    console.error("[admin/catalog GET] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to load catalog data",
        products: [],
        combos: [],
        categories: CATEGORIES.map((c) => ({
          id: c.slug,
          name: c.label,
          slug: c.slug,
          display_order: 0,
          is_active: true,
        })),
      },
      { status: 500 }
    );
  }
}
