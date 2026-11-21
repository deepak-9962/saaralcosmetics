-- =============================================================================
-- MIGRATION: 20261121000023_admin_email_deepak.sql
-- Saaral Cosmetics — Add deepak5122d@gmail.com to is_admin() function
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') IN ('admin@saaralcosmetics.com', 'saaralcosmetics@gmail.com', 'deepak5122d@gmail.com')
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true,
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
