-- =============================================================================
-- MIGRATION: 001_customer_account_system
-- Saaral Cosmetics — Customer Account System
--
-- Run this in Supabase Dashboard → SQL Editor.
-- All changes are additive; no existing data is dropped.
-- =============================================================================

-- =============================================================================
-- 1. PROFILES TABLE
--    Stores customer display data tied to auth.users.
--    One row per auth user, created on registration.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create a profile row whenever a new auth user signs up.
-- Uses coalesce so it never crashes when raw_user_meta_data is null or
-- the full_name key is missing (e.g. OAuth signups in the future).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. CART_ITEMS TABLE
--    Persistent per-user cart. One row per (user_id, product_id) pair.
--    product_id is intentionally not a FK so deleted products don't break carts.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,          -- references products.id (text UUID)
  name        TEXT NOT NULL,
  variant_name TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 20),
  image       TEXT NOT NULL DEFAULT '',
  slug        TEXT NOT NULL DEFAULT '',
  is_combo    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items (user_id);

DROP TRIGGER IF EXISTS cart_items_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 3. WISHLIST_ITEMS TABLE
--    Persistent per-user wishlist. One row per (user_id, product_id).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,          -- references products.id (text UUID)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items (user_id);

-- =============================================================================
-- 4. ALTER ORDERS TABLE — add nullable user_id
--    Existing rows remain NULL. New orders placed while logged in
--    will have user_id set by the server-side checkout handler.
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id)
  WHERE user_id IS NOT NULL;

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- A customer may only read their own profile
DROP POLICY IF EXISTS "profiles: owner read" ON public.profiles;
CREATE POLICY "profiles: owner read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- A customer may only update their own profile; they cannot change the id
DROP POLICY IF EXISTS "profiles: owner update" ON public.profiles;
CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is handled only by the server-side trigger (handle_new_user, SECURITY DEFINER)
-- No customer INSERT policy needed; the trigger runs as the definer role.

-- ── cart_items ────────────────────────────────────────────────────────────────

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items: owner select" ON public.cart_items;
CREATE POLICY "cart_items: owner select"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items: owner insert" ON public.cart_items;
CREATE POLICY "cart_items: owner insert"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items: owner update" ON public.cart_items;
CREATE POLICY "cart_items: owner update"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items: owner delete" ON public.cart_items;
CREATE POLICY "cart_items: owner delete"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ── wishlist_items ────────────────────────────────────────────────────────────

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_items: owner select" ON public.wishlist_items;
CREATE POLICY "wishlist_items: owner select"
  ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_items: owner insert" ON public.wishlist_items;
CREATE POLICY "wishlist_items: owner insert"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_items: owner delete" ON public.wishlist_items;
CREATE POLICY "wishlist_items: owner delete"
  ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- ── orders ───────────────────────────────────────────────────────────────────
-- Customers can READ their own orders. They cannot INSERT, UPDATE, or DELETE
-- orders — those operations only happen through server-side API routes using
-- the service role key, which bypasses RLS entirely.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow existing service-role inserts/updates to continue working
-- (service role always bypasses RLS, so no explicit policy is needed for it)

DROP POLICY IF EXISTS "orders: owner read" ON public.orders;
CREATE POLICY "orders: owner read"
  ON public.orders FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- Allow authenticated & guest clients to insert orders upon checkout
-- Ensures authenticated users cannot inject a user_id other than their own,
-- and unauthenticated guests can only insert rows with user_id = NULL.
DROP POLICY IF EXISTS "orders: client insert" ON public.orders;
CREATE POLICY "orders: client insert"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- Note: UPDATE and DELETE on orders remain locked to service role only (payment verification, status updates)
-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
