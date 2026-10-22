-- Migration: 20261001000013_connect_categories_everywhere.sql
-- Establish public.categories as the dynamic single source of truth for categories across the entire system.
-- Connects products, hero_slides, and homepage_categories via foreign keys and removes hardcoded category constraints.

-- ─────────────────────────────────────────────────────────────
-- 1. CENTRAL CATEGORIES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for categories updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 2. SEED INITIAL CANONICAL CATEGORIES
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, display_order, is_active)
VALUES
  ('Face Cream', 'face-cream', 'Nourishing herbal facial creams and butters', 1, true),
  ('Face Wash', 'face-wash', 'Gentle herbal face washes for pure, radiant skin', 2, true),
  ('Soap', 'soap', 'Artisanal cold-processed herbal cleansing bars', 3, true),
  ('Nalangu Maavu', 'nalangu-maavu', 'Traditional herbal bath powders & skin polishers', 4, true),
  ('Herbal Oil', 'oil', 'Traditional cold-pressed hair & body herbal oils', 5, true),
  ('Herbal Balm', 'balm', 'Intensive healing herbal balms and ointments', 6, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insert any additional categories from existing products table if not present
INSERT INTO public.categories (name, slug, display_order, is_active)
SELECT DISTINCT
  initcap(replace(category, '-', ' ')) AS name,
  category AS slug,
  10 AS display_order,
  true AS is_active
FROM public.products
WHERE category IS NOT NULL
  AND category <> ''
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. REMOVE RESTRICTIVE CHECK CONSTRAINT ON PRODUCTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_check;

-- ─────────────────────────────────────────────────────────────
-- 4. LINK PRODUCTS TO CATEGORIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Backfill products.category_id based on category slug
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.slug
  AND p.category_id IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 5. LINK HERO_SLIDES TO CATEGORIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS destination_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Backfill hero_slides.destination_category_id
UPDATE public.hero_slides s
SET 
  destination_category_id = c.id,
  destination_id = c.id::text
FROM public.categories c
WHERE s.destination_type = 'category'
  AND (s.destination_id = c.slug OR s.destination_id = c.id::text)
  AND s.destination_category_id IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 6. LINK HOMEPAGE_CATEGORIES TO CATEGORIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.homepage_categories
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Backfill homepage_categories.category_id
UPDATE public.homepage_categories h
SET 
  category_id = c.id,
  destination_id = c.id::text
FROM public.categories c
WHERE (h.category_slug = c.slug OR h.destination_id = c.slug OR h.destination_id = c.id::text)
  AND h.category_id IS NULL;
