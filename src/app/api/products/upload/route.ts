/**
 * POST /api/products/upload
 *
 * Handles product image uploads. Called from the admin new-product form.
 *
 * Steps:
 *  1. Parse multipart/form-data (file + optional product metadata)
 *  2. Validate file type and size server-side (defence-in-depth on top of client checks)
 *  3. Upload to the "product-images" Supabase Storage bucket using SERVICE_ROLE_KEY
 *     — the service role bypasses RLS so this works even if the admin session cookie
 *       is not forwarded to this Route Handler.
 *  4. Get the public URL of the uploaded file
 *  5. Insert a new row into public.products (or update if productId is provided)
 *  6. Return { success, product } or { error }
 *
 * Security note:
 *  - SUPABASE_SERVICE_ROLE_KEY is a server-only env var (no NEXT_PUBLIC_ prefix).
 *    It is never sent to the browser.
 *  - The anon/browser client is NOT used here.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

/** Allowed MIME types (mirrors the bucket's allowed_mime_types setting) */
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
/** Max file size in bytes — must match the bucket's file_size_limit (5 MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Map MIME type → file extension */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    // ── Parse multipart form data ────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid request — expected multipart/form-data." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
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

    // ── Server-side validation ────────────────────────────────
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }
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

    // ── Initialise service-role Supabase client ───────────────
    // This uses SUPABASE_SERVICE_ROLE_KEY (server-only, never exposed to client).
    const supabase = getSupabaseServiceClient();

    // ── Generate unique storage path ──────────────────────────
    // crypto.randomUUID() is available in Node 18+ and on Vercel Edge/Node runtimes.
    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const storagePath = `${crypto.randomUUID()}.${ext}`;

    // ── Upload file to "product-images" bucket ────────────────
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        // upsert: false ensures we never silently overwrite (UUID collision is astronomically unlikely)
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── Get the public URL of the uploaded image ──────────────
    // getPublicUrl() is synchronous and never throws — it just constructs the URL.
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // ── Insert product row into the database ──────────────────
    // We use the service role client so RLS doesn't block the insert.
    const slug = generateSlug(name);
    const stock = Number(stockRaw) || 0;
    const isActive = isActiveRaw === "false" ? false : true;
    const comparePriceNum = comparePrice ? Number(comparePrice) : null;

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category: category as "face-cream" | "face-wash" | "soap" | "nalangu-maavu",
        variant_name: variantName,
        price,
        compare_price: comparePriceNum && Number.isFinite(comparePriceNum) ? comparePriceNum : null,
        description,
        ingredients,
        how_to_use: howToUse,
        // Push the uploaded image URL as the first (and primary) image in the array
        images: [publicUrl],
        // Store the storage path so we can delete the file from Storage later
        image_path: storagePath,
        stock,
        is_active: isActive,
      })
      .select()
      .single();

    if (insertError) {
      // Upload succeeded but DB insert failed — clean up the orphaned Storage file
      console.error("[upload] DB insert error:", insertError);
      await supabase.storage.from("product-images").remove([storagePath]);
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, product, publicUrl, storagePath },
      { status: 201 }
    );
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
