-- Storage setup for portfolio image uploads.
-- We ran this once in the Supabase SQL editor.

-- Made a public bucket so the site could read images by their URL. Capped each
-- file at 20 MB and only allowed image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  20971520,
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Let a signed-in admin upload, replace, and delete images in this bucket.
drop policy if exists "portfolio_authenticated_insert" on storage.objects;
create policy "portfolio_authenticated_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio');

drop policy if exists "portfolio_authenticated_update" on storage.objects;
create policy "portfolio_authenticated_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio');

drop policy if exists "portfolio_authenticated_delete" on storage.objects;
create policy "portfolio_authenticated_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio');

-- The public bucket flag already handled reads, so we did not need a select policy.
