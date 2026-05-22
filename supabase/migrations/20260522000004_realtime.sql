-- ============================================================
-- ENABLE SUPABASE REALTIME
-- Adds products, orders, and customers to the realtime
-- publication so changes are broadcast to subscribed clients.
-- ============================================================

-- The default Supabase publication is called "supabase_realtime"
-- We add our tables to it so Realtime broadcasts row-level events.

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.customers;
