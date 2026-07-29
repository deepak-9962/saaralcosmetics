/**
 * PATCH /api/products/[productId]/images
 *
 * Reorders the product_images rows for a given product.
 *
 * Body: { order: string[] } — array of product_image UUIDs in the new desired order.
 * The first item in the array becomes display_order=0 (the main/thumbnail image).
 *
 * Two-phase update to avoid UNIQUE constraint violations on (product_id, display_order):
 *   Phase 1: Offset all display_orders by +1000 (avoids conflicts during reassignment)
 *   Phase 2: Set final display_orders (0, 1, 2, …)
 *
 * DELETE /api/products/[productId]/images
 *
 * Deletes a single image from product_images and Storage.
 * Body: { imageId: string; imagePath: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// ── PATCH: Reorder images ──────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    let body: { order?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!Array.isArray(body.order) || body.order.length === 0) {
      return NextResponse.json(
        { error: "Request body must include a non-empty `order` array of image IDs." },
        { status: 400 }
      );
    }

    const newOrder = body.order as string[];

    // Validate all IDs are strings
    if (newOrder.some((id) => typeof id !== "string")) {
      return NextResponse.json(
        { error: "All items in `order` must be image ID strings." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient() as any;

    // ── Phase 1: Offset existing display_orders by +1000 to avoid unique conflicts ──
    // We only offset the rows we're about to reorder.
    for (let i = 0; i < newOrder.length; i++) {
      const { error } = await supabase
        .from("product_images")
        .update({ display_order: 1000 + i })
        .eq("id", newOrder[i])
        .eq("product_id", productId); // safety: ensure we only touch this product's images

      if (error) {
        console.error(`[reorder] Phase 1 failed for image ${newOrder[i]}:`, error);
        return NextResponse.json(
          { error: `Failed to begin reorder: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // ── Phase 2: Set final display_orders (0, 1, 2, …) ────────────────────────
    for (let i = 0; i < newOrder.length; i++) {
      const { error } = await supabase
        .from("product_images")
        .update({ display_order: i })
        .eq("id", newOrder[i])
        .eq("product_id", productId);

      if (error) {
        console.error(`[reorder] Phase 2 failed for image ${newOrder[i]}:`, error);
        return NextResponse.json(
          { error: `Failed to save reorder: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // ── Update products.images[] for backward compatibility ────────────────────
    const { data: allImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    const allUrls = (allImages ?? []).map((r: any) => r.image_url);

    await supabase
      .from("products")
      .update({ images: allUrls, updated_at: new Date().toISOString() })
      .eq("id", productId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reorder] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove a single image ──────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    let body: { imageId?: unknown; imagePath?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (typeof body.imageId !== "string" || !body.imageId) {
      return NextResponse.json(
        { error: "Request body must include `imageId` (string)." },
        { status: 400 }
      );
    }
    if (typeof body.imagePath !== "string" || !body.imagePath) {
      return NextResponse.json(
        { error: "Request body must include `imagePath` (string)." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient() as any;

    // Step 1: Delete the Storage file (best-effort — don't abort if missing)
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([body.imagePath]);

    if (storageError) {
      console.warn(
        `[delete-image] Could not remove storage file "${body.imagePath}": ${storageError.message}`
      );
    }

    // Step 2: Delete the product_images row
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", body.imageId)
      .eq("product_id", productId); // safety check

    if (dbError) {
      return NextResponse.json(
        { error: `Failed to delete image record: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Step 3: Update products.images[] to remove the deleted URL
    const { data: remaining } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    const remainingUrls = (remaining ?? []).map((r: any) => r.image_url);

    await supabase
      .from("products")
      .update({ images: remainingUrls, updated_at: new Date().toISOString() })
      .eq("id", productId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-image] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
