-- ============================================================================
-- Storage buckets and policies
-- ============================================================================

-- Public buckets
insert into storage.buckets (id, name, public)
values
  ('service-images', 'service-images', true),
  ('portfolio-images', 'portfolio-images', true),
  ('avatars', 'avatars', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Private buckets (RLS-controlled)
insert into storage.buckets (id, name, public)
values
  ('order-deliverables', 'order-deliverables', false),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- ============================================================================
-- Storage policies
-- ============================================================================

-- Public read for public buckets
create policy "Public bucket read"
  on storage.objects for select
  using (bucket_id in ('service-images', 'portfolio-images', 'avatars', 'blog-images'));

-- Admin write to public buckets
create policy "Admin write public buckets"
  on storage.objects for insert
  with check (
    bucket_id in ('service-images', 'portfolio-images', 'blog-images')
    and public.is_admin()
  );

create policy "Admin update public buckets"
  on storage.objects for update
  using (
    bucket_id in ('service-images', 'portfolio-images', 'blog-images')
    and public.is_admin()
  );

create policy "Admin delete public buckets"
  on storage.objects for delete
  using (
    bucket_id in ('service-images', 'portfolio-images', 'blog-images')
    and public.is_admin()
  );

-- Avatars: user uploads own
create policy "User uploads own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "User updates own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "User deletes own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Order deliverables: staff write, customer of order reads
create policy "Staff uploads deliverables"
  on storage.objects for insert
  with check (bucket_id = 'order-deliverables' and public.is_staff());

create policy "Customer/staff read deliverables"
  on storage.objects for select
  using (
    bucket_id = 'order-deliverables'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );

create policy "Staff manages deliverables"
  on storage.objects for update
  using (bucket_id = 'order-deliverables' and public.is_staff());

create policy "Staff deletes deliverables"
  on storage.objects for delete
  using (bucket_id = 'order-deliverables' and public.is_staff());

-- Payment receipts: customer uploads for own order, staff reads all
create policy "Customer uploads receipt for own order"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-receipts'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );

create policy "Customer/staff read receipts"
  on storage.objects for select
  using (
    bucket_id = 'payment-receipts'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );

create policy "Staff manages receipts"
  on storage.objects for update
  using (bucket_id = 'payment-receipts' and public.is_staff());
