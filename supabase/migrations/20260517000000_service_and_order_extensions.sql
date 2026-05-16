-- ============================================================================
-- Extend services with case-study fields parallel to portfolio
--   - features_ar/en, deliverables_ar/en (text arrays)
--   - timeline_ar/en (jsonb)
--   - thumbnail_url (small icon-style image used beside service name in lists)
-- Extend service_gallery to support videos.
-- Add customer_attachments to orders so a customer can upload files / a voice
-- note when submitting an order request.
-- Add a new private storage bucket `order-attachments` with RLS.
-- ============================================================================

alter table public.services
  add column if not exists features_ar text[] not null default '{}',
  add column if not exists features_en text[] not null default '{}',
  add column if not exists deliverables_ar text[] not null default '{}',
  add column if not exists deliverables_en text[] not null default '{}',
  add column if not exists thumbnail_url text,
  add column if not exists timeline_ar jsonb not null default '[]'::jsonb,
  add column if not exists timeline_en jsonb not null default '[]'::jsonb;

-- Gallery: allow videos alongside images
alter table public.service_gallery
  add column if not exists media_type text not null default 'image';

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'service_gallery_media_type_check'
  ) then
    alter table public.service_gallery
      add constraint service_gallery_media_type_check
      check (media_type in ('image', 'video'));
  end if;
end $$;

-- Orders: customer-supplied attachments at submission time
-- Each entry: { url, name, type ('file'|'audio'), mime, size }
alter table public.orders
  add column if not exists customer_attachments jsonb not null default '[]'::jsonb;

-- ============================================================================
-- Storage bucket: order-attachments
-- Made "public" so audio/file URLs can be played via <audio src> and viewed
-- via <a href> directly. URLs contain a random token + RLS still gates
-- INSERT/DELETE, so other customers cannot enumerate or modify your files.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('order-attachments', 'order-attachments', true)
on conflict (id) do update set public = true;

-- The customer who owns the order, or any staff member, may upload to
-- order-attachments/<order_id>/*
create policy "Customer/staff upload order attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'order-attachments'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );

create policy "Customer/staff read order attachments"
  on storage.objects for select
  using (
    bucket_id = 'order-attachments'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );

create policy "Customer/staff delete order attachments"
  on storage.objects for delete
  using (
    bucket_id = 'order-attachments'
    and (
      public.is_staff()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.customer_id = auth.uid()
      )
    )
  );
