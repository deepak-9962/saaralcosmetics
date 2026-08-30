/**
 * POST /api/products/upload
 *
 * Creates a new product with up to 6 images, OR adds images to an existing
 * product (when `product_id` is provided in the form data).
 *
 * Multi-file upload flow:
 *  1. Parse multipart/form-data — expects files named file_0, file_1, … file_N
 *  2. Validate every file (type + size) before any upload starts
 *  3. If creating a new product: insert the products row first to get the UUID
 *     (needed for the storage folder path {product_id}/{order}-{uuid}.ext)
 *  4. Upload each file to product-images/{product_id}/{order}-{uuid}.ext
 *  5. Insert one product_images row per image with correct display_order
 *  6. Update products.images[] with all URLs (backward-compat for existing code)
 *
 * Rollback on failure:
 *  If any Storage upload or DB insert fails mid-way, ALL already-uploaded files
 *  for that product are deleted from Storage, and the product row is deleted
 *  (if it was created in this request). A clear error is returned.
 *
 * Security note:
 *  - SUPABASE_SERVICE_ROLE_KEY is server-only (no NEXT_PUBLIC_ prefix).
 *  - The service-role client bypasses RLS — safe inside this Route Handler.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import type { Product } from "@/lib/types";


/** Allowed MIME types (mirrors the bucket's allowed_mime_types setting) */
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
/** Max file size in bytes — must match the bucket's file_size_limit (5 MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
/** Maximum images per product */
const MAX_IMAGES = 6;

/** Map MIME type → file extension */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    // ── Parse multipart form data ──────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid request — expected multipart/form-data." },
        { status: 400 }
      );
    }

    // ── Collect files (file_0, file_1, …, file_5) ─────────────────────────
    const files: File[] = [];
    for (let i = 0; i < MAX_IMAGES; i++) {
      const f = formData.get(`file_${i}`) as File | null;
      if (f) files.push(f);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image files provided. Please select at least one image." },
        { status: 400 }
      );
    }

    // ── Server-side validation (all files, before any upload) ─────────────
    // Fail fast: validate every file before touching Storage.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Image ${i + 1}: file type "${file.type}" not allowed. Upload JPG, PNG, or WebP only.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Image ${i + 1} (${file.name}) exceeds 5 MB limit.` },
          { status: 400 }
        );
      }
    }

    // ── Parse product metadata ─────────────────────────────────────────────
    const existingProductId = (formData.get("product_id") as string | null)?.trim() || null;
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const description = (formData.get("description") as string | null)?.trim() ?? null;
    const priceRaw = formData.get("price") as string | null;
    const category = (formData.get("category") as string | null) ?? "face-cream";
    const variantName = (formData.get("variant_name") as string | null)?.trim() || null;
    const comparePrice = formData.get("compare_price") as string | null;
    const ingredients = (formData.get("ingredients") as string | null)?.trim() || null;
    const howToUse = (formData.get("how_to_use") as string | null)?.trim() || null;
    const stockRaw = formData.get("stock") as string | null;
    const isActiveRaw = formData.get("is_active") as string | null;

    // Product name and price are only required when creating a new product
    if (!existingProductId) {
      if (!name) {
        return NextResponse.json(
          { error: "Product name is required." },
          { status: 400 }
        );
      }
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: "A valid price is required." },
          { status: 400 }
        );
      }
    }

    // ── Initialise service-role Supabase client ────────────────────────────
    const supabase = getSupabaseServiceClient() as any;

    let productId: string;
    let productCreatedInThisRequest = false;

    if (existingProductId) {
      // ── Adding images to an existing product ─────────────────────────────
      productId = existingProductId;
    } else {
      // ── Create a new product row first to get the UUID ───────────────────
      // We need the UUID before uploads so we can use it in the storage path.
      const price = Number(priceRaw);
      const stock = Number(stockRaw) || 0;
      const isActive = isActiveRaw === "false" ? false : true;
      const comparePriceNum = comparePrice ? Number(comparePrice) : null;
      const slug = generateSlug(name, variantName ?? undefined);

      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          category: category as Product["category"],
          variant_name: variantName,
          price,
          compare_price: comparePriceNum && Number.isFinite(comparePriceNum) ? comparePriceNum : null,
          description: description || null,
          ingredients: ingredients || null,
          how_to_use: howToUse || null,
          images: [],     // will be updated after all uploads succeed
          image_path: null,
          stock,
          is_active: isActive,
        })
        .select("id")
        .single();

      if (insertError || !newProduct) {
        console.error("[upload] Product insert error:", insertError);
        return NextResponse.json(
          { error: `Database error creating product: ${insertError?.message ?? "unknown"}` },
          { status: 500 }
        );
      }

      productId = newProduct.id;
      productCreatedInThisRequest = true;
    }

    // ── Upload each file ───────────────────────────────────────────────────
    // Track what we've uploaded so we can roll back on partial failure.
    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    // Determine starting display_order for existing product (append after current max)
    let startOrder = 0;
    if (existingProductId) {
      const { data: existing } = await supabase
        .from("product_images")
        .select("display_order")
        .eq("product_id", productId)
        .order("display_order", { ascending: false })
        .limit(1);
      if (existing && existing.length > 0) {
        startOrder = (existing[0].display_order ?? -1) + 1;
      }
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = MIME_TO_EXT[file.type] ?? "jpg";
      const displayOrder = startOrder + i;

      // Path: product-images/{product_id}/{displayOrder}-{uuid}.{ext}
      const storagePath = `${productId}/${displayOrder}-${crypto.randomUUID()}.${ext}`;

      // Upload to Storage
      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        // ── ROLLBACK: delete already-uploaded files ──────────────────────
        console.error(`[upload] Storage error on image ${i + 1}:`, uploadError);
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("product-images").remove(uploadedPaths);
        }
        // Delete product row if we created it in this request
        if (productCreatedInThisRequest) {
          await supabase.from("products").delete().eq("id", productId);
        }
        return NextResponse.json(
          { error: `Storage upload failed for image ${i + 1}: ${uploadError.message}. All changes have been rolled back.` },
          { status: 500 }
        );
      }

      uploadedPaths.push(storagePath);

      // Get public URL (synchronous — no network call)
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);
      imageUrls.push(urlData.publicUrl);

      // Insert product_images row
      const { error: imgInsertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          image_path: storagePath,
          display_order: displayOrder,
          alt_text: name || null,
        });

      if (imgInsertError) {
        // ── ROLLBACK ─────────────────────────────────────────────────────
        console.error(`[upload] product_images insert error for image ${i + 1}:`, imgInsertError);
        await supabase.storage.from("product-images").remove(uploadedPaths);
        if (productCreatedInThisRequest) {
          await supabase.from("products").delete().eq("id", productId);
        }
        return NextResponse.json(
          { error: `Database error saving image ${i + 1}: ${imgInsertError.message}. All changes have been rolled back.` },
          { status: 500 }
        );
      }
    }

    // ── Update products.images[] for backward compatibility ────────────────
    // Existing frontend code reads product.images[0] — keep it populated.
    // Fetch all current URLs (existing + newly uploaded) in order.
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
        // Keep image_path pointing to the main image (display_order=0) for legacy deletion code
        image_path: uploadedPaths[0] ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    // ── Fetch and return the final product ────────────────────────────────
    const { data: finalProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    return NextResponse.json(
      { success: true, product: finalProduct, uploadedCount: files.length },
      { status: existingProductId ? 200 : 201 }
    );
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
