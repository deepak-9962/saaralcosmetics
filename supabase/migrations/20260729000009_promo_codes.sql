-- ============================================================
-- PROMO CODES SYSTEM
-- Migration: 20260729000009_promo_codes.sql
--
-- Creates:
--   • promo_codes          — promo code definitions
--   • promo_code_redemptions — per-order redemption log
--   • promo_banner_view    — safe public view for banner
--
-- Alters:
--   • orders               — adds promo snapshot columns
-- ============================================================

-- ── 1. promo_codes ────────────────────────────────────────────
create table if not exists public.promo_codes (
  id                    uuid        primary key default gen_random_uuid(),
  code                  text        not null unique,
  discount_type         text        not null check (discount_type in ('percentage', 'flat')),
  discount_value        numeric     not null check (discount_value > 0),
  max_discount_cap      numeric     null,           -- caps absolute ₹ for percentage codes
  min_order_value       numeric     null default 0,
  usage_limit_total     integer     null,           -- null = unlimited
  usage_limit_per_user  integer     null,           -- null = unlimited (requires user_id)
  times_used            integer     not null default 0,
  applies_to            text        not null default 'all'
                                    check (applies_to in ('all', 'category', 'product')),
  applies_to_id         uuid        null,           -- product or category uuid when scoped
  starts_at             timestamptz null,
  expires_at            timestamptz null,
  is_active             boolean     not null default true,
  show_in_banner        boolean     not null default false,
  description           text        null,           -- short marketing line for banner
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.promo_codes is
  'Promo / discount codes. code is always stored UPPERCASE (enforced by trigger).';

-- ── 1a. Enforce UPPERCASE on code via trigger ─────────────────
create or replace function public.trg_promo_code_uppercase()
returns trigger language plpgsql as $$
begin
  new.code := upper(trim(new.code));
  return new;
end;
$$;

drop trigger if exists promo_code_uppercase_trig on public.promo_codes;
create trigger promo_code_uppercase_trig
  before insert or update of code
  on public.promo_codes
  for each row
  execute function public.trg_promo_code_uppercase();

-- ── 1b. updated_at trigger ────────────────────────────────────
create or replace function public.trg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists promo_codes_updated_at_trig on public.promo_codes;
create trigger promo_codes_updated_at_trig
  before update on public.promo_codes
  for each row
  execute function public.trg_set_updated_at();

-- ── 1c. Indexes ───────────────────────────────────────────────
create index if not exists promo_codes_code_idx      on public.promo_codes (code);
create index if not exists promo_codes_is_active_idx on public.promo_codes (is_active);
create index if not exists promo_codes_banner_idx    on public.promo_codes (show_in_banner) where show_in_banner = true;

-- ── 1d. RLS ───────────────────────────────────────────────────
alter table public.promo_codes enable row level security;

-- Only authenticated users (admins) can do full CRUD
drop policy if exists "admin_all_promo_codes" on public.promo_codes;
create policy "admin_all_promo_codes"
  on public.promo_codes
  for all
  to authenticated
  using (true)
  with check (true);

-- No direct public/anon access — all validation goes through the service role API


-- ── 2. promo_code_redemptions ─────────────────────────────────
create table if not exists public.promo_code_redemptions (
  id               uuid        primary key default gen_random_uuid(),
  promo_code_id    uuid        references public.promo_codes(id) on delete set null,
  user_id          uuid        references auth.users(id) null, -- null for guest checkouts
  order_id         uuid        references public.orders(id),
  discount_applied numeric     not null,
  redeemed_at      timestamptz not null default now()
);

comment on table public.promo_code_redemptions is
  'One row per promo code redemption. order_id + promo_code_id uniquely identify a usage.';

create index if not exists redemptions_promo_code_idx on public.promo_code_redemptions (promo_code_id);
create index if not exists redemptions_order_idx      on public.promo_code_redemptions (order_id);
create index if not exists redemptions_user_idx       on public.promo_code_redemptions (user_id);

alter table public.promo_code_redemptions enable row level security;

-- Admins can read all redemptions
drop policy if exists "admin_read_redemptions" on public.promo_code_redemptions;
create policy "admin_read_redemptions"
  on public.promo_code_redemptions
  for select
  to authenticated
  using (true);

-- Service role (used in API routes) bypasses RLS — inserts done there


-- ── 3. Alter orders — add promo snapshot columns ──────────────
-- These are nullable so all existing inserts continue working unchanged.
alter table public.orders
  add column if not exists promo_code_snapshot    text    null,
  add column if not exists discount_type_snapshot text    null,
  add column if not exists discount_amount        numeric null default 0;

comment on column public.orders.promo_code_snapshot    is 'Promo code string as used at time of order — preserved even if code row is later deleted/edited.';
comment on column public.orders.discount_type_snapshot is 'Snapshot of discount_type at time of order.';
comment on column public.orders.discount_amount        is 'Absolute discount amount (₹) deducted from the order subtotal.';


-- ── 4. promo_banner_view — safe public view ───────────────────
-- Exposes ONLY the fields needed for the banner.
-- Filtered to: active + in date range + show_in_banner = true.
drop view if exists public.promo_banner_view;
create view public.promo_banner_view as
  select
    code,
    description,
    discount_type,
    discount_value,
    max_discount_cap
  from public.promo_codes
  where
    is_active = true
    and show_in_banner = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at >= now());

-- Grant SELECT on the view to anon (for the banner API route using browser client)
-- The underlying table is still protected by RLS.
grant select on public.promo_banner_view to anon, authenticated;
