/**
 * POST /api/products/[productId]/images/register
 *
 * Registers images that were uploaded directly from the browser to Supabase
 * Storage (bypassing the Next.js body-size limit).
 *
 * Body:
 * {
 *   images: Array<{
 *     storagePath: string;   // e.g. "product-id/0-uuid.jpg"
 *     publicUrl:   string;   // full https:// URL
 *     displayOrder: number;
 *   }>
 * }
 *
 * On success: inserts product_images rows + updates products.images[].
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface UploadedImage {
  storagePath: string;
  publicUrl: string;
  displayOrder: number;
}

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId." }, { status: 400 });
    }

    let body: { images?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "Body must include a non-empty `images` array." },
        { status: 400 }
      );
    }

    // Validate each entry
    const images = body.images as UploadedImage[];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img.storagePath !== "string" || !img.storagePath) {
        return NextResponse.json(
          { error: `Image ${i + 1}: missing storagePath.` },
          { status: 400 }
        );
      }
      if (typeof img.publicUrl !== "string" || !img.publicUrl) {
        return NextResponse.json(
          { error: `Image ${i + 1}: missing publicUrl.` },
          { status: 400 }
        );
      }
      if (typeof img.displayOrder !== "number") {
        return NextResponse.json(
          { error: `Image ${i + 1}: missing displayOrder.` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseServiceClient() as any;

    // Verify the product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Insert product_images rows
    const rows = images.map((img) => ({
      product_id: productId,
      image_url: img.publicUrl,
      image_path: img.storagePath,
      display_order: img.displayOrder,
      alt_text: product.name ?? null,
    }));

    const { error: insertError } = await supabase.from("product_images").insert(rows);

    if (insertError) {
      console.error("[register] product_images insert error:", insertError);
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Update products.images[] for backward compatibility
    const { data: allImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    const allUrls = (allImages ?? []).map((r: any) => r.image_url);

    await supabase
      .from("products")
      .update({
        images: allUrls,
        image_path: images[0]?.storagePath ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    return NextResponse.json({ success: true, registeredCount: images.length });
  } catch (err) {
    console.error("[register] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
