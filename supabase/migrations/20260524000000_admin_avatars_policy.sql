-- ============================================================================
-- Fix: allow admins to write to the `avatars` storage bucket.
--
-- The original migration (20260516000002_storage_setup.sql) only added a
-- policy that lets a user upload to their own auth.uid() folder under
-- `avatars`. That blocks the admin upload action used by /admin/team when
-- saving team-member profile pictures.
--
-- Mirroring the "Admin write public buckets" policies that already exist
-- for service-images / portfolio-images / blog-images, we add admin
-- insert/update/delete policies for `avatars`.
--
-- DROP IF EXISTS first so this migration is idempotent.
-- ============================================================================

drop policy if exists "Admin uploads avatars" on storage.objects;
create policy "Admin uploads avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "Admin updates avatars" on storage.objects;
create policy "Admin updates avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "Admin deletes avatars" on storage.objects;
create policy "Admin deletes avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and public.is_admin());
