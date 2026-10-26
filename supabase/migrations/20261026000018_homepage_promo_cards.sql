-- Migration: 20261026000018_homepage_promo_cards.sql
-- Create table for admin-managed Homepage Quick Promo Cards (the 4 cards on the mobile homepage)

-- ─────────────────────────────────────────────────────────────
-- 1. HOMEPAGE PROMO CARDS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.homepage_promo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  link_url TEXT NOT NULL DEFAULT '/products',
  destination_type TEXT DEFAULT 'custom' CHECK (destination_type IN ('category', 'product', 'custom')),
  destination_id TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  bg_color TEXT NOT NULL DEFAULT '#F0E8CC',
  accent_color TEXT NOT NULL DEFAULT '#8B6A3A',
  botanical_accent TEXT NOT NULL DEFAULT 'leaf' CHECK (botanical_accent IN ('leaf', 'flower', 'herb', 'lavender', 'none')),
  badge_text TEXT,
  has_arrow BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for homepage_promo_cards updated_at
DROP TRIGGER IF EXISTS update_homepage_promo_cards_updated_at ON public.homepage_promo_cards;
CREATE TRIGGER update_homepage_promo_cards_updated_at
  BEFORE UPDATE ON public.homepage_promo_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for homepage_promo_cards
ALTER TABLE public.homepage_promo_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active homepage_promo_cards" ON public.homepage_promo_cards;
CREATE POLICY "Public read active homepage_promo_cards"
  ON public.homepage_promo_cards FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage homepage_promo_cards" ON public.homepage_promo_cards;
CREATE POLICY "Admin manage homepage_promo_cards"
  ON public.homepage_promo_cards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 2. SEED INITIAL 4 PROMO CARDS
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.homepage_promo_cards (
  title, subtitle, link_url, destination_type, destination_id,
  bg_color, accent_color, botanical_accent, badge_text, has_arrow, display_order, is_active
) VALUES
(
  'New\nLaunches',
  'Fresh Rituals',
  '/products?collection=new-launches&sort=newest#catalog',
  'custom',
  '/products?collection=new-launches&sort=newest#catalog',
  '#F0E8CC',
  '#8B6A3A',
  'leaf',
  NULL,
  false,
  0,
  true
),
(
  'BestSellers\nUnder 499',
  'Value Picks',
  '/products?collection=bestsellers&max_price=499#catalog',
  'custom',
  '/products?collection=bestsellers&max_price=499#catalog',
  '#F5E0E8',
  '#8B3A5E',
  'flower',
  NULL,
  true,
  1,
  true
),
(
  'Combos\nUnder 999',
  'Curated Sets',
  '/products?category=combos&max_price=999#catalog',
  'category',
  'combos',
  '#D8EDE0',
  '#2E6640',
  'herb',
  NULL,
  false,
  2,
  true
),
(
  'Gen Z\nFavourites',
  'Trending Now',
  '/products?collection=gen-z-favourites#catalog',
  'custom',
  '/products?collection=gen-z-favourites#catalog',
  '#E4DAEF',
  '#5A3A8A',
  'lavender',
  NULL,
  true,
  3,
  true
)
ON CONFLICT DO NOTHING;
