/**
 * deleteProductImages.ts
 *
 * Deletes ALL images for a product from Supabase Storage, then deletes the
 * product DB row (which ON DELETE CASCADE removes all product_images rows too).
 *
 * Handles both storage layouts:
 *  • New  → files stored under "{product_id}/" folder prefix
 *  • Legacy → single file stored flat at bucket root via image_path
 *
 * Why per-product folder deletion is easy:
 *   supabase.storage.list(productId) returns all files under that prefix in
 *   one call. We then pass all their paths to a single remove() call — no
 *   N+1 deletes, no need to know individual filenames upfront.
 */

import { getSupabaseBrowserClient } from "./client";

/**
 * Removes all Storage files for a product, then deletes the product DB row.
 *
 * @param productId       UUID of the product to delete
 * @param legacyImagePath Fallback: the products.image_path value for products
 *                        that were uploaded before the folder-per-product layout.
 *                        Pass product?.image_path from the admin UI.
 */
export async function deleteProductImages(
  productId: string,
  legacyImagePath?: string | null
): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  // ── Step 1: Delete files from the new folder-per-product layout ────────────
  // List all files stored under "product-images/{productId}/"
  const { data: folderFiles, error: listError } = await supabase.storage
    .from("product-images")
    .list(productId, { limit: 100 });

  if (!listError && folderFiles && folderFiles.length > 0) {
    // Build full bucket-relative paths: "{productId}/{filename}"
    const paths = folderFiles.map((f) => `${productId}/${f.name}`);
    const { error: removeError } = await supabase.storage
      .from("product-images")
      .remove(paths);

    if (removeError) {
      // Log but do not abort — we still want to delete the DB row
      console.warn(
        `[deleteProductImages] Could not remove folder files for product ${productId}: ${removeError.message}`
      );
    }
  } else if (legacyImagePath) {
    // ── Step 2: Fall back to legacy flat-bucket path (old single-image format) ─
    // Legacy images were stored as "{uuid}.ext" at the bucket root, NOT in a subfolder.
    const { error: legacyRemoveError } = await supabase.storage
      .from("product-images")
      .remove([legacyImagePath]);

    if (legacyRemoveError) {
      console.warn(
        `[deleteProductImages] Could not remove legacy file "${legacyImagePath}": ${legacyRemoveError.message}`
      );
    }
  }

  // ── Step 3: Delete the product DB row ──────────────────────────────────────
  // ON DELETE CASCADE in the FK automatically removes all product_images rows.
  const { error: dbError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (dbError) throw new Error(dbError.message);
}
