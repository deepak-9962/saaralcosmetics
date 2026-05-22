-- ============================================================
-- CUSTOMERS TABLE
-- Phone number is the primary identity (guest checkout model)
-- Auto-upserted by a trigger every time an order is placed
-- ============================================================

create table if not exists public.customers (
  id             uuid        primary key default gen_random_uuid(),
  phone          text        unique not null,
  name           text,
  email          text,
  order_count    int         not null default 0,
  total_spent    numeric(10,2) not null default 0,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

comment on table public.customers is 'One row per unique customer phone number. Kept in sync by the sync_customer_on_order trigger.';

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists customers_phone_idx on public.customers (phone);

-- ── Row Level Security ────────────────────────────────────────
alter table public.customers enable row level security;

-- Allow anon to insert (needed when trigger runs during order placement)
create policy "anon_insert_customers"
  on public.customers for insert
  to anon, authenticated
  with check (true);

-- Allow anon to update (trigger needs update)
create policy "anon_update_customers"
  on public.customers for update
  to anon, authenticated
  using (true)
  with check (true);

-- Only authenticated users (admin) can read
create policy "admin_select_customers"
  on public.customers for select
  to authenticated
  using (true);
