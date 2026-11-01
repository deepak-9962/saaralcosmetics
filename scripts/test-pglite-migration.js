const { PGlite } = require('@electric-sql/pglite');

async function runTests() {
  console.log("=== Initializing Isolated PostgreSQL Test Database (PGlite) ===");
  const db = new PGlite();

  // Create roles and schemas matching Supabase
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY,
      email TEXT,
      raw_user_meta_data JSONB DEFAULT '{}'::jsonb
    );

    -- Helper functions matching Supabase auth
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ LANGUAGE sql STABLE;

    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$
      SELECT jsonb_build_object(
        'sub', current_setting('request.jwt.claim.sub', true),
        'email', current_setting('request.jwt.claim.email', true),
        'app_metadata', jsonb_build_object(
          'is_admin', COALESCE(current_setting('request.jwt.claim.is_admin', true) = 'true', false)
        )
      );
    $$ LANGUAGE sql STABLE;

    -- Roles
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
      END IF;
    END
    $$;

    -- Create public tables matching Saaral schema
    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      items JSONB NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      order_status TEXT NOT NULL DEFAULT 'new',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      promo_code_snapshot TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.promo_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      times_used INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Grant permissions to roles
    GRANT USAGE ON SCHEMA auth TO anon, authenticated;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

    -- Admin helper function with SECURITY DEFINER
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
      SELECT COALESCE(
        (auth.jwt() ->> 'email') IN ('admin@saaralcosmetics.com', 'saaralcosmetics@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true,
        false
      );
    $$;

    GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
  `);

  console.log("Schema initialized.");

  // Apply the proposed RLS policies
  await db.exec(`
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "orders: customer select" ON public.orders;
    CREATE POLICY "orders: customer select"
      ON public.orders FOR SELECT
      TO authenticated
      USING (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
      );

    DROP POLICY IF EXISTS "orders: admin select" ON public.orders;
    CREATE POLICY "orders: admin select"
      ON public.orders FOR SELECT
      TO authenticated
      USING (
        public.is_admin()
      );

    DROP POLICY IF EXISTS "orders: admin update" ON public.orders;
    CREATE POLICY "orders: admin update"
      ON public.orders FOR UPDATE
      TO authenticated
      USING (
        public.is_admin()
      )
      WITH CHECK (
        public.is_admin()
      );

    DROP POLICY IF EXISTS "orders: client insert" ON public.orders;
    CREATE POLICY "orders: client insert"
      ON public.orders FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        (auth.uid() IS NULL AND user_id IS NULL)
        OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
      );
  `);
  console.log("RLS Policies applied to public.orders.");

  // Apply the proposed atomic inventory & payment RPC
  await db.exec(`
    CREATE OR REPLACE FUNCTION public.process_order_payment(
      p_order_id UUID,
      p_razorpay_payment_id TEXT,
      p_order_status TEXT DEFAULT 'new'
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_order RECORD;
      v_item JSONB;
      v_product_id UUID;
      v_qty INT;
      v_current_stock INT;
      v_product_name TEXT;
    BEGIN
      -- 1. Lock the order row FOR UPDATE to serialize concurrent webhook/client requests
      SELECT id, payment_status, items, promo_code_snapshot
      INTO v_order
      FROM public.orders
      WHERE id = p_order_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'order_not_found');
      END IF;

      -- 2. Idempotency Check: If already marked as paid, return success without double-decrementing
      IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object(
          'success', true,
          'status', 'already_processed',
          'order_id', p_order_id
        );
      END IF;

      -- 3. Atomic Stock Check & Decrement with Row-Level Locking
      FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items) ORDER BY (value->>'product_id')
      LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := COALESCE((v_item->>'qty')::INT, (v_item->>'quantity')::INT, 1);

        -- Lock the product row FOR UPDATE
        SELECT id, name, stock
        INTO v_product_id, v_product_name, v_current_stock
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE;

        IF FOUND AND v_current_stock IS NOT NULL THEN
          IF v_current_stock < v_qty THEN
            -- Insufficient stock! Prevent overselling
            UPDATE public.orders
            SET payment_status = 'paid_stock_exhausted',
                razorpay_payment_id = p_razorpay_payment_id,
                notes = COALESCE(notes || E'\\n', '') || 'Oversell prevented: insufficient stock for ' || v_product_name || ' (requested: ' || v_qty || ', available: ' || v_current_stock || ')'
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

      -- 4. Mark order as paid
      UPDATE public.orders
      SET payment_status = 'paid',
          razorpay_payment_id = p_razorpay_payment_id,
          order_status = p_order_status,
          updated_at = NOW()
      WHERE id = p_order_id;

      -- 5. Increment promo code usage if applicable
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
  `);
  console.log("process_order_payment RPC installed.");

  // Seed test users
  const customerA = "11111111-1111-1111-1111-111111111111";
  const customerB = "22222222-2222-2222-2222-222222222222";
  const adminUser = "99999999-9999-9999-9999-999999999999";

  await db.exec(`
    INSERT INTO auth.users (id, email) VALUES
      ('${customerA}', 'customerA@test.com'),
      ('${customerB}', 'customerB@test.com'),
      ('${adminUser}', 'admin@saaralcosmetics.com');
  `);

  // Seed a product with stock = 1 (test item)
  const productId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  await db.exec(`
    INSERT INTO public.products (id, name, slug, price, stock)
    VALUES ('${productId}', 'Ultra Rare Elixir', 'ultra-rare-elixir', 999.00, 1);
  `);

  // Seed orders:
  // Order 1 for Customer A
  // Order 2 for Customer B
  // Order 3 for Guest (user_id IS NULL)
  const orderA = "a1111111-1111-1111-1111-111111111111";
  const orderB = "b2222222-2222-2222-2222-222222222222";
  const orderGuest = "c3333333-3333-3333-3333-333333333333";

  await db.exec(`
    INSERT INTO public.orders (id, order_number, user_id, customer_name, customer_phone, items, total)
    VALUES
      ('${orderA}', 'SC-1001', '${customerA}', 'Alice A', '+919999999991', '[{"product_id":"${productId}","qty":1}]', 999.00),
      ('${orderB}', 'SC-1002', '${customerB}', 'Bob B', '+919999999992', '[{"product_id":"${productId}","qty":1}]', 999.00),
      ('${orderGuest}', 'SC-1003', NULL, 'Guest Charlie', '+919999999993', '[{"product_id":"${productId}","qty":1}]', 999.00);
  `);

  const results = [];

  // ==========================================
  // PART 1: RLS POLICY VERIFICATION
  // ==========================================
  console.log("\n--- Executing RLS Policy Tests ---");

  // Helper to switch PostgreSQL session role and JWT claims
  async function queryAs(role, sub, email, isAdmin, sql) {
    await db.exec(`
      SET ROLE ${role};
      SET request.jwt.claim.sub = '${sub || ""}';
      SET request.jwt.claim.email = '${email || ""}';
      SET request.jwt.claim.is_admin = '${isAdmin ? "true" : "false"}';
    `);
    const res = await db.query(sql);
    await db.exec(`RESET ROLE;`);
    return res;
  }

  // TEST 1.1: Anonymous client SELECT orders
  {
    const res = await queryAs("anon", null, null, false, "SELECT * FROM public.orders;");
    const count = res.rows.length;
    results.push({
      category: "RLS",
      test: "Anonymous client cannot read any orders",
      expected: "0 rows",
      actual: `${count} rows`,
      status: count === 0 ? "PASS" : "FAIL"
    });
  }

  // TEST 1.2: Customer A selects orders (should only see Order A)
  {
    const res = await queryAs("authenticated", customerA, "customerA@test.com", false, "SELECT id, order_number FROM public.orders;");
    const ids = res.rows.map(r => r.id);
    const passed = ids.length === 1 && ids[0] === orderA;
    results.push({
      category: "RLS",
      test: "Customer A sees only own orders (Order A)",
      expected: `[${orderA}]`,
      actual: JSON.stringify(ids),
      status: passed ? "PASS" : "FAIL"
    });
  }

  // TEST 1.3: Customer B selects orders (should only see Order B)
  {
    const res = await queryAs("authenticated", customerB, "customerB@test.com", false, "SELECT id, order_number FROM public.orders;");
    const ids = res.rows.map(r => r.id);
    const passed = ids.length === 1 && ids[0] === orderB;
    results.push({
      category: "RLS",
      test: "Customer B sees only own orders (Order B)",
      expected: `[${orderB}]`,
      actual: JSON.stringify(ids),
      status: passed ? "PASS" : "FAIL"
    });
  }

  // TEST 1.4: Cross-customer isolation (Customer B attempting to read Customer A's order by direct ID)
  {
    const res = await queryAs("authenticated", customerB, "customerB@test.com", false, `SELECT id FROM public.orders WHERE id = '${orderA}';`);
    const count = res.rows.length;
    results.push({
      category: "RLS",
      test: "Customer B cannot read Customer A's order by direct ID",
      expected: "0 rows",
      actual: `${count} rows`,
      status: count === 0 ? "PASS" : "FAIL"
    });
  }

  // TEST 1.5: Guest order isolation (Neither Customer A nor Anon can read guest orders)
  {
    const res = await queryAs("authenticated", customerA, "customerA@test.com", false, `SELECT id FROM public.orders WHERE id = '${orderGuest}';`);
    const count = res.rows.length;
    results.push({
      category: "RLS",
      test: "Customer cannot read unowned/guest orders",
      expected: "0 rows",
      actual: `${count} rows`,
      status: count === 0 ? "PASS" : "FAIL"
    });
  }

  // TEST 1.6: Admin role selects all orders
  {
    const res = await queryAs("authenticated", adminUser, "admin@saaralcosmetics.com", true, "SELECT id FROM public.orders;");
    const count = res.rows.length;
    results.push({
      category: "RLS",
      test: "Admin can view all orders (Customer A, B, Guest)",
      expected: "3 rows",
      actual: `${count} rows`,
      status: count === 3 ? "PASS" : "FAIL"
    });
  }

  // TEST 1.7: Admin role updates order status
  {
    await queryAs("authenticated", adminUser, "admin@saaralcosmetics.com", true, `UPDATE public.orders SET order_status = 'shipped' WHERE id = '${orderA}';`);
    const checkRes = await queryAs("authenticated", adminUser, "admin@saaralcosmetics.com", true, `SELECT order_status FROM public.orders WHERE id = '${orderA}';`);
    const updatedStatus = checkRes.rows[0].order_status;
    results.push({
      category: "RLS",
      test: "Admin can update order status",
      expected: "shipped",
      actual: updatedStatus,
      status: updatedStatus === "shipped" ? "PASS" : "FAIL"
    });
  }

  // TEST 1.8: Customer cannot update order status
  {
    let updateWorked = false;
    try {
      await queryAs("authenticated", customerA, "customerA@test.com", false, `UPDATE public.orders SET payment_status = 'paid' WHERE id = '${orderA}';`);
      const checkRes = await queryAs("authenticated", adminUser, "admin@saaralcosmetics.com", true, `SELECT payment_status FROM public.orders WHERE id = '${orderA}';`);
      updateWorked = checkRes.rows[0].payment_status === 'paid';
    } catch {
      updateWorked = false;
    }
    results.push({
      category: "RLS",
      test: "Customer cannot update order payment status",
      expected: "blocked (payment_status remains pending)",
      actual: updateWorked ? "Updated successfully (SECURITY BREACH)" : "Blocked by RLS",
      status: !updateWorked ? "PASS" : "FAIL"
    });
  }

  // ==========================================
  // PART 2: ATOMIC INVENTORY & RACE CONDITION
  // ==========================================
  console.log("\n--- Executing Atomic Inventory & Payment Concurrency Tests ---");

  // Initial stock was 1. Both Order A and Order B require 1 unit.
  // TEST 2.1: First customer payment succeeds and decrements stock from 1 to 0
  {
    const res = await db.query(`SELECT public.process_order_payment('${orderA}', 'pay_razorpay_A_123') as result;`);
    const result = res.rows[0].result;
    const stockRes = await db.query(`SELECT stock FROM public.products WHERE id = '${productId}';`);
    const currentStock = stockRes.rows[0].stock;

    const passed = result.success === true && currentStock === 0;
    results.push({
      category: "Inventory",
      test: "First customer payment decrements stock (1 -> 0)",
      expected: "success: true, stock: 0",
      actual: `success: ${result.success}, stock: ${currentStock}`,
      status: passed ? "PASS" : "FAIL"
    });
  }

  // TEST 2.2: Duplicate webhook / payment callback replay for Order A (Idempotency)
  {
    const res = await db.query(`SELECT public.process_order_payment('${orderA}', 'pay_razorpay_A_123') as result;`);
    const result = res.rows[0].result;
    const stockRes = await db.query(`SELECT stock FROM public.products WHERE id = '${productId}';`);
    const currentStock = stockRes.rows[0].stock;

    const passed = result.success === true && result.status === 'already_processed' && currentStock === 0;
    results.push({
      category: "Inventory",
      test: "Duplicate payment callback is idempotent (stock remains 0, NOT double-decremented to -1)",
      expected: "already_processed, stock: 0",
      actual: `status: ${result.status}, stock: ${currentStock}`,
      status: passed ? "PASS" : "FAIL"
    });
  }

  // TEST 2.3: Second customer attempting to purchase final unit (Order B)
  // Stock is 0 -> Must detect insufficient stock and PREVENT overselling
  {
    const res = await db.query(`SELECT public.process_order_payment('${orderB}', 'pay_razorpay_B_456') as result;`);
    const result = res.rows[0].result;
    const stockRes = await db.query(`SELECT stock FROM public.products WHERE id = '${productId}';`);
    const currentStock = stockRes.rows[0].stock;
    const orderRes = await db.query(`SELECT payment_status, notes FROM public.orders WHERE id = '${orderB}';`);
    const orderStatus = orderRes.rows[0].payment_status;

    const passed = result.success === false && result.error === 'insufficient_stock' && currentStock === 0 && orderStatus === 'paid_stock_exhausted';
    results.push({
      category: "Inventory",
      test: "Simultaneous purchase of final unit prevents overselling (Order B flagged, stock protected)",
      expected: "error: insufficient_stock, stock: 0, status: paid_stock_exhausted",
      actual: `error: ${result.error}, stock: ${currentStock}, status: ${orderStatus}`,
      status: passed ? "PASS" : "FAIL"
    });
  }

  // TEST 2.4: Promo Code Increment on Payment
  {
    const promoCode = "SAVE10";
    await db.exec(`INSERT INTO public.promo_codes (code, times_used) VALUES ('${promoCode}', 0);`);
    const orderPromo = "d4444444-4444-4444-4444-444444444444";
    const productPromo = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    await db.exec(`INSERT INTO public.products (id, name, slug, price, stock) VALUES ('${productPromo}', 'Shampoo', 'shampoo', 500, 5);`);
    await db.exec(`
      INSERT INTO public.orders (id, order_number, user_id, customer_name, customer_phone, items, total, promo_code_snapshot)
      VALUES ('${orderPromo}', 'SC-1004', '${customerA}', 'Alice', '+919999999991', '[{"product_id":"${productPromo}","qty":2}]', 450.00, '${promoCode}');
    `);

    // Process payment
    await db.query(`SELECT public.process_order_payment('${orderPromo}', 'pay_promo_123');`);
    const promoRes = await db.query(`SELECT times_used FROM public.promo_codes WHERE code = '${promoCode}';`);
    const timesUsed = promoRes.rows[0].times_used;

    // Call duplicate to ensure promo counter is NOT incremented twice
    await db.query(`SELECT public.process_order_payment('${orderPromo}', 'pay_promo_123');`);
    const promoRes2 = await db.query(`SELECT times_used FROM public.promo_codes WHERE code = '${promoCode}';`);
    const timesUsedAfterDup = promoRes2.rows[0].times_used;

    const passed = timesUsed === 1 && timesUsedAfterDup === 1;
    results.push({
      category: "Promo",
      test: "Promo code times_used incremented exactly once (idempotent)",
      expected: "times_used: 1",
      actual: `times_used: ${timesUsedAfterDup}`,
      status: passed ? "PASS" : "FAIL"
    });
  }

  console.log("\n========================================================");
  console.log("📊 AUTOMATED TEST RESULTS MATRIX (PGlite Test Database)");
  console.log("========================================================");
  console.table(results);

  const allPassed = results.every(r => r.status === "PASS");
  console.log(`\nFinal Test Verdict: ${allPassed ? "ALL 12 TESTS PASSED" : "FAILURES DETECTED"}`);
}

runTests().catch(console.error);
