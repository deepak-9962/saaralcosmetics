-- ============================================================
-- MIGRATION: Multi-Image Support for Products
-- File: 20260719000007_multi_image_support.sql
--
-- ⚠️  SAFETY NOTE — existing data is NOT modified or lost:
--   • The products.images[]  column is kept as-is (deprecated but intact)
--   • The products.image_path column is kept as-is (deprecated but intact)
--   • This migration only ADDS a new product_images table and migrates
--     the first URL from images[] into it with display_order = 0
--   • Run the verification query at the bottom before dropping old columns
--
-- RUN ORDER:
--   1. Take a manual Supabase backup (Dashboard → Database → Backups)
--   2. Paste this entire file into the Supabase SQL Editor and execute
--   3. Verify with the SELECT at the bottom
--   4. Regenerate TypeScript types (see command in implementation plan)
-- ============================================================


-- ── Part 1: Create product_images table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_images (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url      text          NOT NULL,
  image_path     text          NOT NULL,  -- storage path (bucket-relative), needed for deletion
  display_order  int           NOT NULL DEFAULT 0,  -- 0 = main/thumbnail image
  alt_text       text,
  created_at     timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.product_images IS
  'One row per product image. display_order=0 is the main/thumbnail image shown on '
  'listing pages. Higher values are gallery images. ON DELETE CASCADE ensures all '
  'image rows are removed when the parent product is deleted.';

COMMENT ON COLUMN public.product_images.image_path IS
  'Supabase Storage bucket-relative path. e.g. "{product_id}/{order}-{uuid}.webp". '
  'Used to delete the file from Storage when the image row is deleted.';

COMMENT ON COLUMN public.product_images.display_order IS
  '0 = main/thumbnail (shown on listing pages and as the first gallery image). '
  '1..5 = gallery images. Maximum 6 images per product (orders 0-5).';


-- ── Part 2: Indexes ───────────────────────────────────────────────────────────

-- Fast lookups of all images for a given product
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON public.product_images(product_id);

-- Enforce one image per display_order slot per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_order
  ON public.product_images(product_id, display_order);


-- ── Part 3: DATA MIGRATION ───────────────────────────────────────────────────
--
-- For every existing product that has at least one image in the images[] array,
-- we create one row in product_images with display_order = 0 (the main image).
--
-- HOW image_path IS DERIVED from a Supabase public URL:
--   Public URL format:
--     https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
--   We extract everything AFTER "/product-images/" using regexp_replace.
--
--   Priority: use the existing products.image_path column when available (most
--   accurate), falling back to URL extraction for older products.
--
-- ON CONFLICT DO NOTHING makes this idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.product_images (
  product_id,
  image_url,
  image_path,
  display_order,
  alt_text
)
SELECT
  p.id                   AS product_id,
  p.images[1]            AS image_url,
  COALESCE(
    -- Prefer the existing dedicated image_path column (most accurate bucket path)
    NULLIF(p.image_path, ''),
    -- Fall back: extract path from the public URL
    -- Strip everything up to and including "/product-images/" in the URL
    regexp_replace(p.images[1], '^.*/product-images/', '', 'g')
  )                      AS image_path,
  0                      AS display_order,
  p.name                 AS alt_text
FROM public.products p
WHERE
  p.images IS NOT NULL
  AND array_length(p.images, 1) > 0
  AND p.images[1] IS NOT NULL
  AND p.images[1] <> ''
  -- Skip known placeholder/test image hosts — these are not real assets
  AND p.images[1] NOT LIKE '%via.placeholder.com%'
  AND p.images[1] NOT LIKE '%placehold.co%'
  AND p.images[1] NOT LIKE '%placehold.it%'
ON CONFLICT (product_id, display_order)
DO NOTHING;  -- idempotent: skip if this product already has a display_order=0 row


-- ── Part 4: Deprecation notices on old columns ───────────────────────────────
--
-- We intentionally do NOT drop these columns yet.
-- Keep them until the new product_images system is verified working in production.
-- Once verified, drop them with:
--
--   ALTER TABLE public.products DROP COLUMN images;
--   ALTER TABLE public.products DROP COLUMN image_path;
--
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON COLUMN public.products.images IS
  '[DEPRECATED — do not write new data here] Legacy images text[] column. '
  'Kept temporarily as read fallback while product_images table is being adopted. '
  'Drop this column after verifying product_images is fully live.';

COMMENT ON COLUMN public.products.image_path IS
  '[DEPRECATED — do not write new data here] Legacy storage path for the single '
  'primary image. Replaced by product_images.image_path per row. '
  'Drop this column after verifying product_images is fully live.';


-- ── Part 5: Enable RLS on product_images ─────────────────────────────────────

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;


-- ── Part 6: RLS Policies ─────────────────────────────────────────────────────

-- Public read — the storefront (anon) and admins (authenticated) can SELECT
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
CREATE POLICY "product_images_public_read"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated INSERT — signed-in admins can add images
-- (service_role bypasses RLS so the upload API route always works regardless)
DROP POLICY IF EXISTS "product_images_auth_insert" ON public.product_images;
CREATE POLICY "product_images_auth_insert"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated UPDATE — signed-in admins can reorder images
DROP POLICY IF EXISTS "product_images_auth_update" ON public.product_images;
CREATE POLICY "product_images_auth_update"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated DELETE — signed-in admins can remove individual images
DROP POLICY IF EXISTS "product_images_auth_delete" ON public.product_images;
CREATE POLICY "product_images_auth_delete"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (true);


-- ── Part 7: Verification ──────────────────────────────────────────────────────
-- Run these queries in the SQL Editor after migration to confirm success.

-- A) Check table was created:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'product_images'
-- ORDER BY ordinal_position;

-- B) Check how many products were migrated (both counts should match):
-- SELECT
--   (SELECT count(*) FROM products
--    WHERE images IS NOT NULL AND array_length(images,1) > 0
--      AND images[1] NOT LIKE '%placeholder%') AS products_with_images,
--   (SELECT count(*) FROM product_images WHERE display_order = 0) AS migrated_main_images;

-- C) Spot-check a few rows:
-- SELECT pi.display_order, pi.image_url, pi.image_path, p.name
-- FROM product_images pi
-- JOIN products p ON p.id = pi.product_id
-- ORDER BY pi.created_at DESC
-- LIMIT 10;

-- D) Confirm indexes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'product_images';
