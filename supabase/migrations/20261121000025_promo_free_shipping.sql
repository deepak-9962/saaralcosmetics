-- ============================================================
-- MIGRATION: 20261121000025_promo_free_shipping.sql
--
-- Adds 'free_shipping' discount type support to promo_codes table
-- and allows discount_value to be >= 0 (since free_shipping has discount_value 0).
-- ============================================================

ALTER TABLE public.promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_discount_type_check;

ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_discount_type_check
    CHECK (discount_type IN ('percentage', 'flat', 'free_shipping'));

ALTER TABLE public.promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_discount_value_check;

ALTER TABLE public.promo_codes
  ADD CONSTRAINT promo_codes_discount_value_check
    CHECK (discount_value >= 0);
