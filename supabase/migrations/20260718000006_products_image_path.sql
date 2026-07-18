-- ============================================================
-- ADD image_path TO products TABLE
-- This is a non-breaking, additive migration.
-- The existing `images text[]` column is preserved — the upload
-- API route will push the new public URL into that array AND
-- store the bucket-relative storage path here so we can delete
-- the file from Storage later.
--
-- Example value: "product-images/3f8b2c1a-uuid.webp"
--   (just the path within the bucket, not the full URL)
-- ============================================================

alter table public.products
  add column if not exists image_path text;

comment on column public.products.image_path is
  'Supabase Storage path (bucket-relative) of the primary uploaded image. '
  'Used to delete the file from Storage when the product is deleted. '
  'Format: <uuid>.<ext>  (no bucket prefix)';


-- ── No new trigger needed ─────────────────────────────────────
-- trg_products_updated_at already fires on every UPDATE
-- (defined in 20260522000003_triggers.sql)


-- ============================================================
-- VERIFICATION
-- Run in Supabase SQL editor:
--
--   select column_name, data_type, is_nullable
--   from information_schema.columns
--   where table_schema = 'public'
--     and table_name   = 'products'
--     and column_name  = 'image_path';
-- ============================================================
