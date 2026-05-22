-- ============================================================
-- TRIGGERS
-- 1. auto_update_updated_at  → keeps updated_at current on products & orders
-- 2. sync_customer_on_order  → upserts customers row on every new order
-- ============================================================

-- ── Helper function: touch updated_at ────────────────────────
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to products
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.fn_set_updated_at();

-- Apply to orders
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.fn_set_updated_at();

-- ── Customer sync: fires AFTER every new order ────────────────
create or replace function public.fn_sync_customer_on_order()
returns trigger
language plpgsql
security definer   -- runs with owner privileges so RLS doesn't block it
as $$
begin
  insert into public.customers (phone, name, email, order_count, total_spent, first_seen_at, last_seen_at)
  values (
    new.customer_phone,
    new.customer_name,
    new.customer_email,
    1,
    new.total,
    now(),
    now()
  )
  on conflict (phone) do update set
    name          = excluded.name,
    email         = coalesce(excluded.email, public.customers.email),
    order_count   = public.customers.order_count + 1,
    total_spent   = public.customers.total_spent + excluded.total_spent,
    last_seen_at  = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_customer_on_order on public.orders;
create trigger trg_sync_customer_on_order
  after insert on public.orders
  for each row execute function public.fn_sync_customer_on_order();
