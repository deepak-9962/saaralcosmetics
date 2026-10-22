-- Migration: 20261001000011_homepage_and_combos.sql
-- Create tables for admin-managed Homepage Hero Slides, Homepage Categories, and Combos with product relationships.

-- ─────────────────────────────────────────────────────────────
-- 1. HERO SLIDES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  button_text TEXT DEFAULT 'Explore Collection',
  button_link TEXT NOT NULL DEFAULT '/products',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for hero_slides updated_at
DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active hero_slides" ON public.hero_slides;
CREATE POLICY "Public read active hero_slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage hero_slides" ON public.hero_slides;
CREATE POLICY "Admin manage hero_slides"
  ON public.hero_slides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 2. HOMEPAGE CATEGORIES ("Shop by Category / Curated Rituals")
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.homepage_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '/products',
  category_slug TEXT,
  blob_color TEXT DEFAULT '#F2D5C0',
  blob_color2 TEXT DEFAULT '#EEC4A8',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for homepage_categories updated_at
DROP TRIGGER IF EXISTS update_homepage_categories_updated_at ON public.homepage_categories;
CREATE TRIGGER update_homepage_categories_updated_at
  BEFORE UPDATE ON public.homepage_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for homepage_categories
ALTER TABLE public.homepage_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active homepage_categories" ON public.homepage_categories;
CREATE POLICY "Public read active homepage_categories"
  ON public.homepage_categories FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage homepage_categories" ON public.homepage_categories;
CREATE POLICY "Admin manage homepage_categories"
  ON public.homepage_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 3. COMBOS & COMBO ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  compare_price NUMERIC CHECK (compare_price IS NULL OR compare_price >= 0),
  badge TEXT DEFAULT 'Combo Pack',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for combos updated_at
DROP TRIGGER IF EXISTS update_combos_updated_at ON public.combos;
CREATE TRIGGER update_combos_updated_at
  BEFORE UPDATE ON public.combos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for combos
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active combos" ON public.combos;
CREATE POLICY "Public read active combos"
  ON public.combos FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage combos" ON public.combos;
CREATE POLICY "Admin manage combos"
  ON public.combos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Join table: combo_items
CREATE TABLE IF NOT EXISTS public.combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (combo_id, product_id)
);

-- RLS for combo_items
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read combo_items" ON public.combo_items;
CREATE POLICY "Public read combo_items"
  ON public.combo_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage combo_items" ON public.combo_items;
CREATE POLICY "Admin manage combo_items"
  ON public.combo_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 4. SEED INITIAL DATA (Idempotent)
-- ─────────────────────────────────────────────────────────────

-- Seed Hero Slides if table is empty
INSERT INTO public.hero_slides (title, subtitle, image_url, mobile_image_url, button_text, button_link, display_order, is_active)
SELECT 'Saaral Butterfly Pea Collection', 'Luxury Botanical Skincare', '/images/NewHeader/head1.avif', '/images/slide1.avif', 'Shop Butterfly Pea', '/products?collection=butterfly-pea', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE title = 'Saaral Butterfly Pea Collection');

INSERT INTO public.hero_slides (title, subtitle, image_url, mobile_image_url, button_text, button_link, display_order, is_active)
SELECT 'Saaral Red Wine Collection', 'Anti-Aging Luxury Skincare', '/images/NewHeader/head2.avif', '/images/slide2.avif', 'Shop Red Wine', '/products?collection=red-wine', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE title = 'Saaral Red Wine Collection');

INSERT INTO public.hero_slides (title, subtitle, image_url, mobile_image_url, button_text, button_link, display_order, is_active)
SELECT 'Saaral Tamil Heritage Collection', 'Traditional Herbal Skincare', '/images/NewHeader/head3.avif', '/images/slide3.avif', 'Shop Heritage Ritual', '/products?category=nalangu-maavu', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides WHERE title = 'Saaral Tamil Heritage Collection');

-- Seed Homepage Categories if table is empty
INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Face Wash', 'Cleanse & Refresh', '/images/head-facewash-duo.avif', '/products?category=face-wash', 'face-wash', '#C8DFF0', '#B0CEEA', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Face Wash');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Soaps', 'Purify & Soften', '/images/head3.avif', '/products?category=soap', 'soap', '#F2D5C0', '#EEC4A8', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Soaps');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Herbal Care', 'Heritage Ritual', '/images/head4_v2.avif', '/products?category=nalangu-maavu', 'nalangu-maavu', '#F0E0A8', '#E8D090', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Herbal Care');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Creams', 'Nourish & Restore', '/images/head2.avif', '/products?category=face-cream', 'face-cream', '#D0E8C8', '#BCDCB0', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Creams');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Vetpalai', 'Relief & Calm', '/images/head-vetpalai.avif', '/products?collection=vetpalai', 'soap', '#D8EAD2', '#BFDCB4', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Vetpalai');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Oil', 'Intensive Nourishment', '/images/head-oil.avif', '/products?category=oil', 'oil', '#F4E3B2', '#E8CD8A', 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Oil');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Balm', 'Herbal Healing', '/images/head-balm.avif', '/products?category=balm', 'balm', '#E2ECD8', '#C5DCB2', 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Balm');

INSERT INTO public.homepage_categories (title, subtitle, image_url, link_url, category_slug, blob_color, blob_color2, display_order, is_active)
SELECT 'Best Sellers', 'Customer Favorites', '/images/head3.avif', '/products?collection=bestsellers', NULL, '#F5E0C0', '#EDD0A8', 7, true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_categories WHERE title = 'Best Sellers');

-- Seed Combos if empty
DO $$
DECLARE
  v_combo1_id UUID;
  v_combo2_id UUID;
  v_combo3_id UUID;
  v_prod_bf_fw UUID;
  v_prod_bf_sp UUID;
  v_prod_rw_fw UUID;
  v_prod_rw_sp UUID;
  v_prod_nm_bp UUID;
  v_prod_nm_sp UUID;
  v_prod_cream UUID;
BEGIN
  -- Look up existing products
  SELECT id INTO v_prod_bf_fw FROM public.products WHERE slug = 'butterfly-pea-facewash-sangoo-poo' LIMIT 1;
  SELECT id INTO v_prod_bf_sp FROM public.products WHERE slug = 'butterfly-pea-soap-sangoo-poo' LIMIT 1;
  SELECT id INTO v_prod_rw_fw FROM public.products WHERE slug = 'redwine-facewash' LIMIT 1;
  SELECT id INTO v_prod_rw_sp FROM public.products WHERE slug = 'redwine-soap' LIMIT 1;
  SELECT id INTO v_prod_nm_bp FROM public.products WHERE slug = 'nalangu-maavu-bath-powder-250g' LIMIT 1;
  SELECT id INTO v_prod_nm_sp FROM public.products WHERE slug = 'nalangu-maavu-soap' LIMIT 1;
  SELECT id INTO v_prod_cream FROM public.products WHERE slug = 'saaral-skin-whitening-cream-30g' LIMIT 1;

  -- Combo 1: Butterfly Pea Radiant Glow Combo
  IF NOT EXISTS (SELECT 1 FROM public.combos WHERE slug = 'butterfly-pea-radiant-glow-combo') THEN
    INSERT INTO public.combos (name, slug, description, image_url, price, compare_price, badge, display_order, is_active)
    VALUES (
      'Butterfly Pea Radiant Glow Combo',
      'butterfly-pea-radiant-glow-combo',
      'Infused with antioxidant-rich Clitoria Ternatea (Sangoo Poo), this duo gently purifies and revitalizes dull skin for a luminous, dewy finish.',
      '/images/NewHeader/head1.avif',
      429,
      469,
      'Bestseller Combo',
      0,
      true
    ) RETURNING id INTO v_combo1_id;

    IF v_prod_bf_fw IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo1_id, v_prod_bf_fw, 1, 0) ON CONFLICT DO NOTHING;
    END IF;
    IF v_prod_bf_sp IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo1_id, v_prod_bf_sp, 1, 1) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Combo 2: Red Wine Youthful Elixir Combo
  IF NOT EXISTS (SELECT 1 FROM public.combos WHERE slug = 'red-wine-youthful-elixir-combo') THEN
    INSERT INTO public.combos (name, slug, description, image_url, price, compare_price, badge, display_order, is_active)
    VALUES (
      'Red Wine Youthful Elixir Combo',
      'red-wine-youthful-elixir-combo',
      'Packed with resveratrol and natural fruit acids, this luxurious combo promotes skin elasticity, combats fine lines, and leaves skin supple and toned.',
      '/images/NewHeader/head2.avif',
      449,
      499,
      'Anti-Aging Duo',
      1,
      true
    ) RETURNING id INTO v_combo2_id;

    IF v_prod_rw_fw IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo2_id, v_prod_rw_fw, 1, 0) ON CONFLICT DO NOTHING;
    END IF;
    IF v_prod_rw_sp IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo2_id, v_prod_rw_sp, 1, 1) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Combo 3: Tamil Heritage Bridal Radiance Ritual
  IF NOT EXISTS (SELECT 1 FROM public.combos WHERE slug = 'tamil-heritage-bridal-radiance-ritual') THEN
    INSERT INTO public.combos (name, slug, description, image_url, price, compare_price, badge, display_order, is_active)
    VALUES (
      'Tamil Heritage Bridal Radiance Ritual',
      'tamil-heritage-bridal-radiance-ritual',
      'A centuries-old Tamil herbal ritual featuring authentic Nalangu Maavu bath powder, cold-pressed herbal soap, and pure skin brightening cream.',
      '/images/NewHeader/head3.avif',
      1099,
      1218,
      'Complete Ritual',
      2,
      true
    ) RETURNING id INTO v_combo3_id;

    IF v_prod_nm_bp IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo3_id, v_prod_nm_bp, 1, 0) ON CONFLICT DO NOTHING;
    END IF;
    IF v_prod_nm_sp IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo3_id, v_prod_nm_sp, 1, 1) ON CONFLICT DO NOTHING;
    END IF;
    IF v_prod_cream IS NOT NULL THEN
      INSERT INTO public.combo_items (combo_id, product_id, quantity, display_order)
      VALUES (v_combo3_id, v_prod_cream, 1, 2) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

END $$;
