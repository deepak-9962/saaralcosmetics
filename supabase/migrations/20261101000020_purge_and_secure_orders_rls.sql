-- =============================================================================
-- MIGRATION: 20261101000020_purge_and_secure_orders_rls.sql
-- Saaral Cosmetics — Dynamically Purge ALL Legacy Policies on public.orders
-- =============================================================================

-- 1. Create diagnostic function to view active policies on public.orders
CREATE OR REPLACE FUNCTION public.get_orders_policies()
RETURNS TABLE (
  policyname NAME,
  roles NAME[],
  cmd TEXT,
  qual TEXT,
  with_check TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT policyname, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'orders';
$$;

GRANT EXECUTE ON FUNCTION public.get_orders_policies() TO service_role;

-- 2. Dynamically DROP EVERY policy currently on public.orders
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'orders'
  LOOP
    RAISE NOTICE 'Dropping policy % on public.orders', pol.policyname;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
  END LOOP;
END
$$;

-- 3. Explicitly enable and force RLS on public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Customer SELECT policy: Authenticated users can ONLY view their own orders
CREATE POLICY "orders: customer select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- 5. Admin SELECT policy: Administrators can view all orders
CREATE POLICY "orders: admin select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
  );

-- 6. Admin UPDATE policy: Administrators can update orders
CREATE POLICY "orders: admin update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- 7. Client INSERT policy: Checkouts can insert orders (guest or customer)
CREATE POLICY "orders: client insert"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

