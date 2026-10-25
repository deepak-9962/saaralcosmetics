-- Migration: 20261025000017_transformations_and_testimonials.sql
-- Create tables for admin-managed Customer Transformations and Homepage Testimonials

-- ─────────────────────────────────────────────────────────────
-- 1. CUSTOMER TRANSFORMATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer TEXT NOT NULL,
  location TEXT,
  duration TEXT NOT NULL DEFAULT '6 weeks',
  product TEXT NOT NULL,
  product_href TEXT NOT NULL DEFAULT '/products',
  product1_label TEXT NOT NULL,
  product_href2 TEXT,
  product2_label TEXT,
  concerns TEXT[] NOT NULL DEFAULT '{}',
  result TEXT NOT NULL,
  before_src TEXT,
  after_src TEXT,
  accent_color TEXT DEFAULT '#7A2040',
  tag_label TEXT DEFAULT 'Transformation',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for customer_transformations updated_at
DROP TRIGGER IF EXISTS update_customer_transformations_updated_at ON public.customer_transformations;
CREATE TRIGGER update_customer_transformations_updated_at
  BEFORE UPDATE ON public.customer_transformations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for customer_transformations
ALTER TABLE public.customer_transformations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active customer_transformations" ON public.customer_transformations;
CREATE POLICY "Public read active customer_transformations"
  ON public.customer_transformations FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage customer_transformations" ON public.customer_transformations;
CREATE POLICY "Admin manage customer_transformations"
  ON public.customer_transformations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 2. HOMEPAGE TESTIMONIALS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.homepage_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar TEXT,
  quote TEXT NOT NULL,
  products TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for homepage_testimonials updated_at
DROP TRIGGER IF EXISTS update_homepage_testimonials_updated_at ON public.homepage_testimonials;
CREATE TRIGGER update_homepage_testimonials_updated_at
  BEFORE UPDATE ON public.homepage_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for homepage_testimonials
ALTER TABLE public.homepage_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active homepage_testimonials" ON public.homepage_testimonials;
CREATE POLICY "Public read active homepage_testimonials"
  ON public.homepage_testimonials FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage homepage_testimonials" ON public.homepage_testimonials;
CREATE POLICY "Admin manage homepage_testimonials"
  ON public.homepage_testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 3. SEED INITIAL CUSTOMER TRANSFORMATIONS
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.customer_transformations (
  customer, location, duration, product, product_href, product1_label, product_href2, product2_label,
  concerns, result, before_src, after_src, accent_color, tag_label, display_order, is_active
) VALUES
(
  'Chitra',
  'Chennai, Tamil Nadu',
  '6 weeks',
  'Skin Whitening Cream + Redwine Face Wash',
  '/products/saaral-skin-whitening-cream-15g',
  'Whitening Cream',
  '/products/redwine-facewash',
  'Redwine Wash',
  ARRAY['Skin Whitening', 'Dullness', 'Uneven Skin Tone'],
  'Skin tone visibly brightened and face appeared more radiant. Redwine Face Wash helped deeply cleanse and enhance glow.',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-before.avif',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/2-after.avif',
  '#7A2040',
  'Glow & Radiance',
  0,
  true
),
(
  'Kavitha',
  'Madurai, Tamil Nadu',
  '10 weeks',
  'Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash',
  '/products/saaral-anti-aging-pigmentation-cream-15g',
  'Anti-Aging Cream',
  '/products/butterfly-pea-facewash-sangoo-poo',
  'Sangupoo Wash',
  ARRAY['Pigmentation', 'Anti-Aging', 'Skin Brightening'],
  'Significant reduction in pigmentation and fine lines. Butterfly Pea Face Wash visibly revived and refreshed the complexion.',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-before.avif',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/3-after.avif',
  '#4A7C59',
  'Anti-Aging',
  1,
  true
),
(
  'Prema',
  'Thirupathi, Andhra Pradesh',
  '8 weeks',
  'Skin Whitening Cream + Anti Aging & Pigmentation Cream',
  '/products/saaral-skin-whitening-cream-15g',
  'Whitening Cream',
  '/products/saaral-anti-aging-pigmentation-cream-15g',
  'Anti-Aging Cream',
  ARRAY['Skin Whitening', 'Pigmentation', 'Natural Glow'],
  'Complete clearance of persistent dark patches and uneven tone. Both creams worked synergistically to restore natural luminosity.',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/4-before.avif',
  'https://tmcfyzcfcrjzdwnquvhf.supabase.co/storage/v1/object/public/customer-transformations/4-after.avif',
  '#C9A74D',
  'Dual Action',
  2,
  true
);

-- ─────────────────────────────────────────────────────────────
-- 4. SEED INITIAL HOMEPAGE TESTIMONIALS
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.homepage_testimonials (
  name, location, rating, avatar, quote, products, display_order, is_active
) VALUES
(
  'Agalya Saravanan',
  'Kerala',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=agalya2024&backgroundColor=c8deff',
  'Hii mam, unga product nalla work aguthu. Face la irukka pigmentation nallave reduce agi iruku mam. Thank you mam. Enakku romba naala pimples problem irundhuchu, but ipo nallave reduce agi irukku mam. Enna try pannalum pola, unga cream try panna appo nalla different irundhuchu mam.',
  ARRAY['Pigmentation Cream', 'Sangupoo Face Wash'],
  0,
  true
),
(
  'Kavitha',
  'Thiruchendur',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=kavitha2024&backgroundColor=ffd9b8',
  'Romba romba thanks mam. Enga amma ku mangu problem 10 years ah irukku. Na neraya products vangi use panna edhuvum result tharala. Kitta thatta 10k selavu panniyum result illa. Oru naal unga video Instagram la paatha. Nambikkai illama than unga Pigmentation Cream and Sangupoo Face Wash vangunen. Price kammiya irundhuchu, result varuma varadhanu yosichen. Once try pannalam nu vangunen. Enga amma use panna sonnen. 7 days use pannadhum result light ah theriyaramichuchu. One month regular ah use panna sonnen. Inniku one month aaguthu mam, semma result. Thank you so much mam.',
  ARRAY['Pigmentation Cream', 'Sangupoo Face Wash'],
  1,
  true
),
(
  'Rehana',
  'Cuddalore',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=rehana2024&backgroundColor=d4cafe',
  'Enaku 2 days la skin glow ah erukku mam. Best product mam.',
  ARRAY['Skin Whitening Cream', 'Redwine Face Wash'],
  2,
  true
),
(
  'Priya Murugan',
  'Mumbai',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=priyamuruga2024&backgroundColor=b8edd8',
  'Unga product super ah work aguthu. TQ.',
  ARRAY['Pigmentation Cream', 'Skin Whitening Cream', 'Redwine Face Wash'],
  3,
  true
),
(
  'Jayasudha',
  'Thanjavur',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=jayasudha2024&backgroundColor=ffecc8',
  'Sangupoo Face Wash super mam.',
  ARRAY['Sangupoo Face Wash'],
  4,
  true
),
(
  'Sowmiya Prakash',
  'Villupuram',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=sowmiya2024&backgroundColor=fccfda',
  '2 days ah tha use pandra. Nalla changes theriyudhu. Face wash super.',
  ARRAY['Redwine Face Wash'],
  5,
  true
),
(
  'Latha',
  'Paramakudi',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=latha2024&backgroundColor=c8e8d0',
  'First time one bottle use panni irukken. Result super mam.',
  ARRAY['Sangupoo Face Wash'],
  6,
  true
),
(
  'Vaidhehi',
  'Thuraiyur',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=vaidhehi2024&backgroundColor=c8deff',
  'Semma result face wash + cream. Thank you so much. So happy mam. Nalla result irku. Ennoda daughter ku nallave face la result therinjurku mam.',
  ARRAY['Skin Whitening Cream', 'Redwine Face Wash'],
  7,
  true
),
(
  'Shruthika',
  'Chennai',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=shruthika2024&backgroundColor=ffd9b8',
  'Unga Saaral Face Whitening Cream romba nallaa irukku sister. Naa morning and night use panren. Face la difference nallaa theriyudhu. Cream apply pannadhuku apram glowing ah irukku. One time use pannaale nalla result irukku. Skin Whitening Cream and Sangupoo Face Wash order pottu 2 days la receive aachi. Romba thanks sister. Naa continue ah upcoming la unga Saaral Cosmetics than use panna poren. Romba super ah irukku.',
  ARRAY['Skin Whitening Cream', 'Sangupoo Face Wash'],
  8,
  true
),
(
  'Suresh Sudha',
  'Kanchipuram',
  5,
  'https://api.dicebear.com/9.x/lorelei/svg?seed=sureshsudha2024&backgroundColor=d4cafe',
  'Hii mam, very nice product. Love you mam. All super. Yellow products use panniruken, no use. Unga products pola nice ah illa. Happy.',
  ARRAY['Skin Whitening Cream', 'Pigmentation Cream', 'Redwine Face Wash', 'Sangupoo Soap'],
  9,
  true
);
