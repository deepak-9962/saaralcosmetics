-- ============================================================
-- MIGRATION: 20261120000022_promo_multi_target.sql
--
-- Adds multi-target support to promo codes.
-- • applies_to_ids  text[]  — array of slugs/UUIDs/combo-ids
-- • extends applies_to check to also allow 'combo'
--
-- Fully additive — existing single-target codes keep working via
-- the backward-compat view logic in the application layer.
-- ============================================================

-- 1. Add the array column (nullable, default empty array)
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS applies_to_ids text[] NOT NULL DEFAULT '{}';

-- 2. Extend applies_to check constraint to include 'combo'
-- Drop old constraint and recreate (Postgres requires this)
ALTER TABLE public.promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_applies_to_check;

ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_applies_to_check
    CHECK (applies_to IN ('all', 'category', 'product', 'combo'));

-- 3. Back-fill: for any existing codes that have applies_to_id set,
--    copy it into applies_to_ids so old codes still validate correctly.
UPDATE public.promo_codes
  SET applies_to_ids = ARRAY[applies_to_id::text]
  WHERE applies_to_id IS NOT NULL
    AND applies_to != 'all'
    AND (applies_to_ids IS NULL OR applies_to_ids = '{}');

-- 4. Index on applies_to for fast lookups
CREATE INDEX IF NOT EXISTS promo_codes_applies_to_idx
  ON public.promo_codes (applies_to);
