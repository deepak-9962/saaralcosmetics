-- =============================================================================
-- MIGRATION: 20261101000019_orders_rls_and_atomic_inventory.sql
-- Saaral Cosmetics — Fix Orders RLS & Atomic Race-Safe Inventory Management
-- =============================================================================

-- =============================================================================
-- PART 1: SECURE ROW LEVEL SECURITY ON PUBLIC.ORDERS
-- =============================================================================

-- Ensure RLS is enabled and strictly enforced
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop all legacy or overly-permissive policies on orders
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "public read orders" ON public.orders;
DROP POLICY IF EXISTS "orders: owner read" ON public.orders;
DROP POLICY IF EXISTS "orders: client insert" ON public.orders;
DROP POLICY IF EXISTS "orders: customer select" ON public.orders;
DROP POLICY IF EXISTS "orders: admin select" ON public.orders;
DROP POLICY IF EXISTS "orders: admin update" ON public.orders;
DROP POLICY IF EXISTS "admin_all_orders" ON public.orders;

-- Helper function to identify authenticated store administrators
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') IN ('admin@saaralcosmetics.com', 'saaralcosmetics@gmail.com')
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true,
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 1. Customer SELECT Policy: Authenticated customers can ONLY view their own orders
CREATE POLICY "orders: customer select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- 2. Admin SELECT Policy: Store administrators can view all orders
CREATE POLICY "orders: admin select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
  );

-- 3. Admin UPDATE Policy: Store administrators can update order status and notes
CREATE POLICY "orders: admin update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- 4. Checkout INSERT Policy: Clients can insert orders upon checkout
-- Guests can only insert orders with user_id = NULL
-- Logged-in customers can insert orders where user_id matches their auth.uid()
CREATE POLICY "orders: client insert"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- =============================================================================
-- PART 2: ATOMIC INVENTORY & IDEMPOTENT PAYMENT RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_order_payment(
  p_order_id UUID,
  p_razorpay_payment_id TEXT,
  p_order_status TEXT DEFAULT 'new'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item JSONB;
  v_product_id UUID;
  v_qty INT;
  v_current_stock INT;
  v_product_name TEXT;
BEGIN
  -- 1. Acquire row-level lock on the order (FOR UPDATE) to serialize concurrent callbacks
  SELECT id, payment_status, items, promo_code_snapshot
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'order_not_found');
  END IF;

  -- 2. Idempotency Guard: If the order was already marked paid, return success immediately
  -- This prevents double-decrementing when both client verify-payment and server webhook arrive.
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'already_processed',
      'order_id', p_order_id
    );
  END IF;

  -- 3. Atomic Stock Check & Decrement with Row-Level Locking (FOR UPDATE)
  -- Items are ordered by product_id to guarantee deadlock-free locking across concurrent transactions.
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items) ORDER BY (value->>'product_id')
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := COALESCE((v_item->>'qty')::INT, (v_item->>'quantity')::INT, 1);

    -- Lock product row
    SELECT id, name, stock
    INTO v_product_id, v_product_name, v_current_stock
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF FOUND AND v_current_stock IS NOT NULL THEN
      IF v_current_stock < v_qty THEN
        -- Prevent overselling: Flag order as stock exhausted and do NOT decrement
        UPDATE public.orders
        SET payment_status = 'paid_stock_exhausted',
            razorpay_payment_id = p_razorpay_payment_id,
            notes = COALESCE(notes || E'\n', '') || 'Oversell prevented: insufficient stock for ' || v_product_name || ' (requested: ' || v_qty || ', available: ' || v_current_stock || ')'
        WHERE id = p_order_id;

        RETURN jsonb_build_object(
          'success', false,
          'error', 'insufficient_stock',
          'product_name', v_product_name,
          'available', v_current_stock,
          'requested', v_qty
        );
      END IF;

      -- Atomically decrement stock
      UPDATE public.products
      SET stock = stock - v_qty,
          updated_at = NOW()
      WHERE id = v_product_id;
    END IF;
  END LOOP;

  -- 4. Mark order as successfully paid
  UPDATE public.orders
  SET payment_status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      order_status = p_order_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 5. Increment promo code usage counter if applicable
  IF v_order.promo_code_snapshot IS NOT NULL THEN
    UPDATE public.promo_codes
    SET times_used = COALESCE(times_used, 0) + 1,
        updated_at = NOW()
    WHERE code = v_order.promo_code_snapshot;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'paid_and_inventory_decremented',
    'order_id', p_order_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_order_payment(UUID, TEXT, TEXT) TO service_role, authenticated;

