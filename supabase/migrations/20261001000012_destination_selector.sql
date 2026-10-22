-- Migration: 20261001000012_destination_selector.sql
-- Add structured destination columns to hero_slides and homepage_categories with referential integrity

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS destination_type TEXT NOT NULL DEFAULT 'category',
  ADD COLUMN IF NOT EXISTS destination_id TEXT,
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.homepage_categories
  ADD COLUMN IF NOT EXISTS destination_type TEXT NOT NULL DEFAULT 'category',
  ADD COLUMN IF NOT EXISTS destination_id TEXT,
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Backfill existing hero_slides based on button_link
UPDATE public.hero_slides
SET 
  destination_type = CASE
    WHEN button_link LIKE '%category=%' THEN 'category'
    WHEN button_link LIKE '/products/%' THEN 'product'
    ELSE 'custom'
  END,
  destination_id = CASE
    WHEN button_link LIKE '%category=%' THEN substring(button_link from 'category=([^&]+)')
    WHEN button_link LIKE '/products/%' THEN substring(button_link from '/products/([^/?#]+)')
    ELSE button_link
  END
WHERE destination_id IS NULL;

-- If destination was a product, associate product_id
UPDATE public.hero_slides s
SET product_id = p.id
FROM public.products p
WHERE s.destination_type = 'product'
  AND (s.destination_id = p.id::text OR s.destination_id = p.slug)
  AND s.product_id IS NULL;

-- Backfill existing homepage_categories based on category_slug and link_url
UPDATE public.homepage_categories
SET 
  destination_type = CASE
    WHEN category_slug IS NOT NULL AND category_slug <> '' THEN 'category'
    WHEN link_url LIKE '%category=%' THEN 'category'
    WHEN link_url LIKE '/products/%' THEN 'product'
    ELSE 'custom'
  END,
  destination_id = CASE
    WHEN category_slug IS NOT NULL AND category_slug <> '' THEN category_slug
    WHEN link_url LIKE '%category=%' THEN substring(link_url from 'category=([^&]+)')
    WHEN link_url LIKE '/products/%' THEN substring(link_url from '/products/([^/?#]+)')
    ELSE link_url
  END
WHERE destination_id IS NULL;
