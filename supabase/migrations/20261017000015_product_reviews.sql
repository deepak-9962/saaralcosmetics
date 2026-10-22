-- ============================================================
-- PRODUCT REVIEWS & RATINGS SYSTEM
-- Migration: 20261017000015_product_reviews.sql
--
-- Creates:
--   • product_reviews             — product-specific reviews & ratings
--   • get_product_review_summary  — aggregation RPC for single product
--   • get_all_product_ratings     — batch aggregation RPC for product catalog
-- ============================================================

-- ── 1. Create product_reviews Table ──────────────────────────
create table if not exists public.product_reviews (
  id                uuid        primary key default gen_random_uuid(),
  product_id        uuid        not null references public.products(id) on delete cascade,
  customer_name     text        not null,
  customer_email    text        null,
  customer_phone    text        null,
  rating            smallint    not null check (rating >= 1 and rating <= 5),
  title             text        not null,
  comment           text        not null,
  status            text        not null default 'pending'
                                check (status in ('pending', 'approved', 'rejected', 'hidden')),
  verified_purchase boolean     not null default false,
  admin_notes       text        null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.product_reviews is
  'Customer & admin-managed reviews and ratings associated strictly with a specific product.';

-- ── 2. Updated_at Trigger ────────────────────────────────────
create or replace function public.trg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists product_reviews_updated_at_trig on public.product_reviews;
create trigger product_reviews_updated_at_trig
  before update on public.product_reviews
  for each row
  execute function public.trg_set_updated_at();

-- ── 3. Performance Indexes ───────────────────────────────────
create index if not exists product_reviews_product_id_idx
  on public.product_reviews (product_id);

create index if not exists product_reviews_status_idx
  on public.product_reviews (status);

create index if not exists product_reviews_prod_status_idx
  on public.product_reviews (product_id, status);

create index if not exists product_reviews_created_at_idx
  on public.product_reviews (created_at desc);

-- ── 4. Row Level Security (RLS) ──────────────────────────────
alter table public.product_reviews enable row level security;

-- Public / Anonymous: Read ONLY approved reviews
drop policy if exists "public_read_approved_reviews" on public.product_reviews;
create policy "public_read_approved_reviews"
  on public.product_reviews
  for select
  to public
  using (status = 'approved');

-- Authenticated Users (Admins): Full CRUD access
drop policy if exists "admin_all_product_reviews" on public.product_reviews;
create policy "admin_all_product_reviews"
  on public.product_reviews
  for all
  to authenticated
  using (true)
  with check (true);

-- Public / Anonymous: Can submit reviews with pending status and unverified flag
drop policy if exists "public_insert_pending_reviews" on public.product_reviews;
create policy "public_insert_pending_reviews"
  on public.product_reviews
  for insert
  to public
  with check (status = 'pending' and verified_purchase = false);

-- ── 5. Aggregation Functions (RPCs) ──────────────────────────

-- Summary for a single product (used on product detail page)
create or replace function public.get_product_review_summary(p_product_id uuid)
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'product_id', p_product_id,
    'total_reviews', coalesce(count(*), 0)::int,
    'average_rating', coalesce(round(avg(rating)::numeric, 1), 0.0),
    'five_star', coalesce(count(*) filter (where rating = 5), 0)::int,
    'four_star', coalesce(count(*) filter (where rating = 4), 0)::int,
    'three_star', coalesce(count(*) filter (where rating = 3), 0)::int,
    'two_star', coalesce(count(*) filter (where rating = 2), 0)::int,
    'one_star', coalesce(count(*) filter (where rating = 1), 0)::int
  )
  from public.product_reviews
  where product_id = p_product_id
    and status = 'approved';
$$;

-- Batch ratings summary for catalog and card listings
create or replace function public.get_all_product_ratings()
returns table (
  product_id uuid,
  total_reviews int,
  average_rating numeric
)
language sql
stable
security definer
as $$
  select
    product_id,
    count(*)::int as total_reviews,
    round(avg(rating)::numeric, 1) as average_rating
  from public.product_reviews
  where status = 'approved'
  group by product_id;
$$;
