-- =============================================================================
-- MIGRATION: 20261121000024_purchase_limits.sql
-- Saaral Cosmetics — Advanced Product Purchase Limit Management System
-- =============================================================================

-- 1. Create public.purchase_limits table
CREATE TABLE IF NOT EXISTS public.purchase_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  restriction_type TEXT NOT NULL CHECK (restriction_type IN ('all', 'category', 'product', 'combo')),
  target_ids TEXT[] NOT NULL DEFAULT '{}',
  max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
  period TEXT NOT NULL CHECK (period IN ('per_order', 'daily', 'weekly', 'monthly', 'lifetime')),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_purchase_limits_updated_at ON public.purchase_limits;
CREATE TRIGGER update_purchase_limits_updated_at
  BEFORE UPDATE ON public.purchase_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_limits_active ON public.purchase_limits (is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_limits_type ON public.purchase_limits (restriction_type);
CREATE INDEX IF NOT EXISTS idx_purchase_limits_period ON public.purchase_limits (period);

-- 2. Row Level Security
ALTER TABLE public.purchase_limits ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if any
DROP POLICY IF EXISTS "Admin full manage purchase_limits" ON public.purchase_limits;
DROP POLICY IF EXISTS "Public read active purchase_limits" ON public.purchase_limits;

-- Admin: full management rights
CREATE POLICY "Admin full manage purchase_limits"
  ON public.purchase_limits FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers and store clients: read active rules
CREATE POLICY "Public read active purchase_limits"
  ON public.purchase_limits FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
