-- =============================================================================
-- MIGRATION: 20261107000021_other_info_and_store_settings.sql
-- Saaral Cosmetics — Product "Other Information" specifications & Store Settings
-- =============================================================================

-- 1. Add other_info column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS other_info jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.other_info IS
  'Custom product specifications (e.g. Quantity, pH, Targets, Suitable for, Foam/Lather, Fragrance, Storage, Shelf life) stored as an array of objects: [{"label": "...", "value": "..."}].';

-- 2. Create store_settings table for payment flow and store-wide controls
CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  payments_enabled boolean NOT NULL DEFAULT true,
  payments_disabled_message text NOT NULL DEFAULT 'Online payments are temporarily paused for maintenance. You can still browse and add items to your cart, or contact us directly on WhatsApp to place orders.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.store_settings IS
  'Global site and storefront operational settings, including payment master killswitch.';

-- 3. Ensure default row exists
INSERT INTO public.store_settings (id, payments_enabled, payments_disabled_message)
VALUES ('default', true, 'Online payments are temporarily paused for maintenance. You can still browse and add items to your cart, or contact us directly on WhatsApp to place orders.')
ON CONFLICT (id) DO NOTHING;

-- 4. Row Level Security
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (public / anon / authenticated) can read store settings
DROP POLICY IF EXISTS "public_read_store_settings" ON public.store_settings;
CREATE POLICY "public_read_store_settings"
  ON public.store_settings FOR SELECT
  TO public
  USING (true);

-- Authenticated admins can update store settings
DROP POLICY IF EXISTS "admin_manage_store_settings" ON public.store_settings;
CREATE POLICY "admin_manage_store_settings"
  ON public.store_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

