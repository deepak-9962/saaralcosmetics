-- Migration: Make Combos a Real Category & Sync Combo Products
-- 1. Ensure Combos exists as a first-class product category
DO $$
DECLARE
  v_combos_cat_id UUID;
BEGIN
  -- Insert Combos category if it doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'combos') THEN
    INSERT INTO public.categories (name, slug, description, display_order, is_active)
    VALUES (
      'Combos',
      'combos',
      'Curated botanical skincare combos and handcrafted ritual sets',
      8,
      true
    ) RETURNING id INTO v_combos_cat_id;
  ELSE
    SELECT id INTO v_combos_cat_id FROM public.categories WHERE slug = 'combos' LIMIT 1;
  END IF;

  -- 2. Link Homepage Category Card for Combos to the real category record
  UPDATE public.homepage_categories
  SET
    destination_type = 'category',
    destination_id = v_combos_cat_id::text,
    category_id = v_combos_cat_id,
    category_slug = 'combos',
    link_url = '/products?category=combos',
    title = 'Combos',
    updated_at = now()
  WHERE title ILIKE '%combo%' OR link_url ILIKE '%combo%';

  -- 3. Upsert existing combos into the products table so they belong to the Combos category
  INSERT INTO public.products (
    id,
    name,
    slug,
    category,
    category_id,
    price,
    compare_price,
    description,
    images,
    stock,
    is_active,
    created_at,
    updated_at
  )
  SELECT
    c.id,
    c.name,
    c.slug,
    'combos',
    v_combos_cat_id,
    c.price,
    c.compare_price,
    c.description,
    ARRAY[c.image_url],
    50,
    c.is_active,
    c.created_at,
    now()
  FROM public.combos c
  ON CONFLICT (id) DO UPDATE SET
    category = 'combos',
    category_id = v_combos_cat_id,
    price = EXCLUDED.price,
    compare_price = EXCLUDED.compare_price,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();

  -- If any product was inserted with conflict on slug instead of id
  UPDATE public.products
  SET
    category = 'combos',
    category_id = v_combos_cat_id
  WHERE slug IN (SELECT slug FROM public.combos);

END $$;
