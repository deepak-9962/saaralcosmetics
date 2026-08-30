-- ============================================================
-- MIGRATION: Add Oil and Balm Categories to Products Check Constraint
-- File: 20260830000010_add_oil_balm_categories.sql
--
-- Updates the products_category_check constraint on public.products
-- to allow 'oil' and 'balm' as valid category values alongside
-- 'face-cream', 'face-wash', 'soap', and 'nalangu-maavu'.
--
-- RUN INSTRUCTIONS:
--   1. Paste this SQL into the Supabase SQL Editor and execute.
--   2. Also updates the category of existing Balm products.
-- ============================================================

-- 1. Drop existing constraint if present
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_check;

-- 2. Add updated check constraint with 'oil' and 'balm'
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN (
    'face-cream',
    'face-wash',
    'soap',
    'nalangu-maavu',
    'oil',
    'balm'
  ));

-- 3. Update existing Balm products in database to 'balm' category
UPDATE public.products
SET category = 'balm', updated_at = now()
WHERE slug IN (
  'advanced-foot-repair-balm',
  'advanced-vetpalai-itching-balm'
);
