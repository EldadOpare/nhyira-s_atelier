-- ───────────────────────────────────────────────────────────────────────────
-- Supabase Storage setup for portfolio image uploads
-- Run this ONCE in the Supabase Dashboard → SQL Editor.
-- ───────────────────────────────────────────────────────────────────────────

-- 1. Create a public bucket named "portfolio" (idempotent).
--    public = true  → images are readable by anyone via their public URL,
--    which is what the user-facing site needs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760, -- 10 MB per file
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. Allow any signed-in (authenticated) user — i.e. the admin — to upload.
drop policy if exists "portfolio_authenticated_insert" on storage.objects;
create policy "portfolio_authenticated_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio');

-- 3. Allow the admin to overwrite / replace images.
drop policy if exists "portfolio_authenticated_update" on storage.objects;
create policy "portfolio_authenticated_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio');

-- 4. Allow the admin to delete images.
drop policy if exists "portfolio_authenticated_delete" on storage.objects;
create policy "portfolio_authenticated_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio');

-- NOTE: public READ is handled by the bucket's public flag (the
-- /storage/v1/object/public/portfolio/... URLs bypass RLS), so no
-- explicit SELECT policy is required.
