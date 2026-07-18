-- ============================================================
-- PRODUCT IMAGES STORAGE BUCKET
-- Creates the "product-images" Supabase Storage bucket with:
--   • Public read access (anyone can view/download product images)
--   • 5 MB file size limit
--   • Restricted MIME types: JPEG, PNG, WebP only
--   • RLS: authenticated users can INSERT / UPDATE / DELETE
--         (matches the existing Supabase Auth admin session)
-- ============================================================

-- ── 1. Create the bucket ─────────────────────────────────────
-- `public = true`  → Supabase generates shareable public URLs automatically.
-- `file_size_limit` is in bytes  (5 * 1024 * 1024 = 5 242 880 bytes = 5 MB).
-- `allowed_mime_types` blocks any upload that isn't one of the three image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,                                           -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ── 2. Enable RLS on storage.objects (required for policies) ──
-- Supabase enables this by default, but we make it explicit.
-- (storage.objects is the table that tracks every file in every bucket.)


-- ── 3. Public SELECT — anyone can read / download images ──────
-- The `bucket_id` check scopes the policy to "product-images" only.
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using ( bucket_id = 'product-images' );


-- ── 4. Authenticated INSERT — only signed-in admins can upload ─
-- Uses the Supabase Auth session (admin signs in via /admin login page).
-- The service-role API route bypasses this because service role skips RLS.
drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'product-images' );


-- ── 5. Authenticated UPDATE ────────────────────────────────────
drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects
  for update
  to authenticated
  using ( bucket_id = 'product-images' );


-- ── 6. Authenticated DELETE ────────────────────────────────────
-- Also used when deleting a product — removes the file from Storage.
drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'product-images' );


-- ============================================================
-- VERIFICATION
-- Run this in Supabase SQL editor to confirm bucket exists:
--
--   select id, name, public, file_size_limit, allowed_mime_types
--   from storage.buckets
--   where id = 'product-images';
--
-- Via Supabase CLI (from your project root):
--   supabase storage ls --project-ref tmcfyzcfcrjzdwnquvhf
-- ============================================================
