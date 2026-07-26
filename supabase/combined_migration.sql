-- === 20260516000000_initial_schema.sql ===
-- ============================================================================
-- Initial Schema for Company Platform
-- Creates: profiles, categories, services, portfolio, orders, payments,
-- reviews, blog, notifications, settings
-- ============================================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.user_role as enum ('customer', 'sales', 'staff', 'admin');

create type public.order_status as enum (
  'pending_review',
  'under_negotiation',
  'awaiting_customer_approval',
  'awaiting_payment',
  'in_progress',
  'delivered',
  'completed',
  'cancelled',
  'refunded'
);

create type public.milestone_status as enum ('pending', 'in_progress', 'done');

create type public.payment_method as enum (
  'paymob',
  'bank_transfer',
  'cash',
  'instapay',
  'vodafone_cash'
);

create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');

create type public.post_status as enum ('draft', 'published');

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  whatsapp_number text,
  avatar_url text,
  locale text default 'ar',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_email_idx on public.profiles(email);

-- ============================================================================
-- CATEGORIES (hierarchical)
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete cascade,
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  image_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_parent_idx on public.categories(parent_id);
create index categories_slug_idx on public.categories(slug);
create index categories_visible_idx on public.categories(is_visible);

-- ============================================================================
-- SERVICES
-- ============================================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  short_description_ar text,
  short_description_en text,
  full_description_ar text,
  full_description_en text,
  estimated_price_min numeric(12, 2),
  estimated_price_max numeric(12, 2),
  currency text not null default 'EGP',
  estimated_duration_days int,
  cover_image text,
  video_url text,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_idx on public.services(category_id);
create index services_slug_idx on public.services(slug);
create index services_visible_idx on public.services(is_visible);
create index services_featured_idx on public.services(is_featured);

-- Gallery for service images (besides cover)
create table public.service_gallery (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index service_gallery_service_idx on public.service_gallery(service_id);

-- Service implementation stages (informational, shown on service page)
create table public.service_stages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  sort_order int not null default 0
);

create index service_stages_service_idx on public.service_stages(service_id);

-- ============================================================================
-- PORTFOLIO
-- ============================================================================

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  client_name text,
  delivery_date date,
  cover_image text,
  project_url text,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolio_visible_idx on public.portfolio_projects(is_visible);
create index portfolio_featured_idx on public.portfolio_projects(is_featured);

create table public.portfolio_gallery (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0
);

create index portfolio_gallery_portfolio_idx on public.portfolio_gallery(portfolio_id);

create table public.portfolio_services (
  portfolio_id uuid not null references public.portfolio_projects(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (portfolio_id, service_id)
);

create index portfolio_services_service_idx on public.portfolio_services(service_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

create sequence public.orders_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default 'ORD-' || lpad(nextval('public.orders_seq')::text, 6, '0'),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  status public.order_status not null default 'pending_review',
  estimated_price numeric(12, 2),
  final_price numeric(12, 2),
  currency text not null default 'EGP',
  estimated_duration_days int,
  final_duration_days int,
  customer_message text,
  admin_notes text,
  sales_id uuid references public.profiles(id) on delete set null,
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders(customer_id);
create index orders_service_idx on public.orders(service_id);
create index orders_status_idx on public.orders(status);
create index orders_sales_idx on public.orders(sales_id);
create index orders_staff_idx on public.orders(assigned_staff_id);

-- Status history
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index osh_order_idx on public.order_status_history(order_id);

-- Execution milestones (set per-order by admin/staff)
create table public.order_milestones (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title_ar text not null,
  title_en text,
  description text,
  status public.milestone_status not null default 'pending',
  sort_order int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index milestones_order_idx on public.order_milestones(order_id);

-- Deliverables (files / links uploaded by staff)
create table public.order_deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  description text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index deliverables_order_idx on public.order_deliverables(order_id);

-- In-platform messaging (per-order thread)
create table public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  attachment_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_order_idx on public.order_messages(order_id);
create index messages_sender_idx on public.order_messages(sender_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  bank_name text not null,
  account_number text,
  iban text,
  account_holder text,
  notes text,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  amount numeric(12, 2) not null,
  currency text not null default 'EGP',
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  transaction_id text,
  paymob_order_id text,
  receipt_url text,
  verified_by uuid references public.profiles(id) on delete set null,
  customer_note text,
  admin_note text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_idx on public.payments(order_id);
create index payments_status_idx on public.payments(status);

-- ============================================================================
-- REVIEWS
-- ============================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  admin_reply text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_service_idx on public.reviews(service_id);
create index reviews_visible_idx on public.reviews(is_visible);

-- ============================================================================
-- BLOG
-- ============================================================================

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  excerpt_ar text,
  excerpt_en text,
  content_ar text,
  content_en text,
  cover_image text,
  author_id uuid references public.profiles(id) on delete set null,
  status public.post_status not null default 'draft',
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_slug_idx on public.blog_posts(slug);
create index blog_posts_status_idx on public.blog_posts(status);
create index blog_posts_published_idx on public.blog_posts(published_at);

create table public.blog_post_categories (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  category_id uuid not null references public.blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id);
create index notifications_read_idx on public.notifications(is_read);

-- ============================================================================
-- SETTINGS (singleton keys)
-- ============================================================================

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger categories_touch_updated_at before update on public.categories
  for each row execute function public.touch_updated_at();
create trigger services_touch_updated_at before update on public.services
  for each row execute function public.touch_updated_at();
create trigger portfolio_touch_updated_at before update on public.portfolio_projects
  for each row execute function public.touch_updated_at();
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger payments_touch_updated_at before update on public.payments
  for each row execute function public.touch_updated_at();
create trigger blog_touch_updated_at before update on public.blog_posts
  for each row execute function public.touch_updated_at();
create trigger settings_touch_updated_at before update on public.settings
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- AUTH USER → PROFILE TRIGGER
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ORDER STATUS HISTORY TRIGGER
-- ============================================================================

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_status_change
  after update on public.orders
  for each row execute function public.log_order_status_change();


-- === 20260516000001_rls_policies.sql ===
-- ============================================================================
-- Row Level Security policies
-- Pattern: enable RLS on every table, then grant access by role.
-- Roles are read from public.profiles via a helper function.
-- ============================================================================

-- Helper: get the role of the current user
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: is current user admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Helper: is current user staff (sales, staff, or admin)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('admin', 'sales', 'staff') from public.profiles where id = auth.uid()), false);
$$;

-- ============================================================================
-- PROFILES
-- ============================================================================
alter table public.profiles enable row level security;

create policy "Profiles: read own or admin reads all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles: insert is handled by trigger"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: update own (no role escalation) or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    auth.uid() = id and role = (select role from public.profiles where id = auth.uid())
    or public.is_admin()
  );

create policy "Profiles: admin can delete"
  on public.profiles for delete
  using (public.is_admin());

-- ============================================================================
-- CATEGORIES (publicly readable when visible; admin writes)
-- ============================================================================
alter table public.categories enable row level security;

create policy "Categories: public read visible"
  on public.categories for select
  using (is_visible = true or public.is_admin());

create policy "Categories: admin write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- SERVICES + GALLERY + STAGES
-- ============================================================================
alter table public.services enable row level security;

create policy "Services: public read visible"
  on public.services for select
  using (is_visible = true or public.is_admin());

create policy "Services: admin write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

alter table public.service_gallery enable row level security;

create policy "Service gallery: public read"
  on public.service_gallery for select using (true);

create policy "Service gallery: admin write"
  on public.service_gallery for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.service_stages enable row level security;

create policy "Service stages: public read"
  on public.service_stages for select using (true);

create policy "Service stages: admin write"
  on public.service_stages for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- PORTFOLIO
-- ============================================================================
alter table public.portfolio_projects enable row level security;

create policy "Portfolio: public read visible"
  on public.portfolio_projects for select
  using (is_visible = true or public.is_admin());

create policy "Portfolio: admin write"
  on public.portfolio_projects for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.portfolio_gallery enable row level security;

create policy "Portfolio gallery: public read"
  on public.portfolio_gallery for select using (true);

create policy "Portfolio gallery: admin write"
  on public.portfolio_gallery for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.portfolio_services enable row level security;

create policy "Portfolio services: public read"
  on public.portfolio_services for select using (true);

create policy "Portfolio services: admin write"
  on public.portfolio_services for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- ORDERS
-- Customer: read/write own orders (limited fields)
-- Sales/Staff/Admin: read/write all
-- ============================================================================
alter table public.orders enable row level security;

create policy "Orders: customer reads own; staff reads all"
  on public.orders for select
  using (customer_id = auth.uid() or public.is_staff());

create policy "Orders: customer creates own"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "Orders: customer updates own (limited), staff updates all"
  on public.orders for update
  using (customer_id = auth.uid() or public.is_staff());

create policy "Orders: admin can delete"
  on public.orders for delete
  using (public.is_admin());

-- Order status history
alter table public.order_status_history enable row level security;

create policy "Order history: customer reads own; staff reads all"
  on public.order_status_history for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Order history: server inserts via trigger"
  on public.order_status_history for insert
  with check (auth.role() = 'authenticated');

-- Order milestones
alter table public.order_milestones enable row level security;

create policy "Milestones: customer reads own order; staff reads all"
  on public.order_milestones for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Milestones: staff write"
  on public.order_milestones for all
  using (public.is_staff()) with check (public.is_staff());

-- Order deliverables
alter table public.order_deliverables enable row level security;

create policy "Deliverables: customer reads own order; staff reads all"
  on public.order_deliverables for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Deliverables: staff write"
  on public.order_deliverables for all
  using (public.is_staff()) with check (public.is_staff());

-- Order messages
alter table public.order_messages enable row level security;

create policy "Messages: customer reads own order; staff reads all"
  on public.order_messages for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Messages: participants can post"
  on public.order_messages for insert
  with check (
    sender_id = auth.uid()
    and (
      public.is_staff()
      or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
    )
  );

create policy "Messages: sender can update own"
  on public.order_messages for update
  using (sender_id = auth.uid());

-- ============================================================================
-- PAYMENTS
-- ============================================================================
alter table public.payments enable row level security;

create policy "Payments: customer reads own; staff reads all"
  on public.payments for select
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Payments: customer creates for own order; staff for any"
  on public.payments for insert
  with check (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "Payments: staff update"
  on public.payments for update
  using (public.is_staff()) with check (public.is_staff());

alter table public.bank_accounts enable row level security;

create policy "Bank accounts: public read visible"
  on public.bank_accounts for select using (is_visible = true or public.is_admin());

create policy "Bank accounts: admin write"
  on public.bank_accounts for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- REVIEWS
-- ============================================================================
alter table public.reviews enable row level security;

create policy "Reviews: public read visible"
  on public.reviews for select
  using (is_visible = true or customer_id = auth.uid() or public.is_admin());

create policy "Reviews: customer creates for own completed order"
  on public.reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.customer_id = auth.uid()
        and o.status in ('completed', 'delivered')
    )
  );

create policy "Reviews: customer updates own; admin updates any"
  on public.reviews for update
  using (customer_id = auth.uid() or public.is_admin());

create policy "Reviews: admin delete"
  on public.reviews for delete
  using (public.is_admin());

-- ============================================================================
-- BLOG
-- ============================================================================
alter table public.blog_posts enable row level security;

create policy "Blog: public read published"
  on public.blog_posts for select
  using (status = 'published' or public.is_admin());

create policy "Blog: admin write"
  on public.blog_posts for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.blog_categories enable row level security;

create policy "Blog categories: public read"
  on public.blog_categories for select using (true);

create policy "Blog categories: admin write"
  on public.blog_categories for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.blog_post_categories enable row level security;

create policy "Blog post-cats: public read"
  on public.blog_post_categories for select using (true);

create policy "Blog post-cats: admin write"
  on public.blog_post_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
alter table public.notifications enable row level security;

create policy "Notifications: user reads own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Notifications: user updates own (mark read)"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Notifications: staff can insert for any user"
  on public.notifications for insert
  with check (public.is_staff() or user_id = auth.uid());

-- ============================================================================
-- SETTINGS
-- ============================================================================
alter table public.settings enable row level security;

create policy "Settings: public read"
  on public.settings for select using (true);

create policy "Settings: admin write"
  on public.settings for all
  using (public.is_admin()) with check (public.is_admin());


-- === 20260516000002_storage_setup.sql ===
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


-- === 20260516000003_seed_settings.sql ===
-- ============================================================================
-- Seed default settings
-- ============================================================================

insert into public.settings (key, value) values
  ('site', jsonb_build_object(
    'name_ar', 'منصة الشركة',
    'name_en', 'Company Platform',
    'description_ar', 'منصة متكاملة لخدمات البرمجة والتصميم',
    'description_en', 'A complete platform for programming and design services',
    'logo_url', null,
    'favicon_url', null
  )),
  ('whatsapp', jsonb_build_object(
    'business_number', '201000000000',
    'show_floating_button', true,
    'default_message_ar', 'مرحباً، أرغب في الاستفسار عن خدماتكم.',
    'default_message_en', 'Hello, I would like to inquire about your services.'
  )),
  ('seo', jsonb_build_object(
    'default_title_ar', 'منصة الشركة - خدمات برمجة وتصميم',
    'default_title_en', 'Company Platform - Programming & Design Services',
    'default_description_ar', 'نقدم خدمات برمجة وتصميم احترافية',
    'default_description_en', 'We provide professional programming and design services',
    'og_image', null,
    'twitter_handle', null
  )),
  ('contact', jsonb_build_object(
    'email', 'info@example.com',
    'phone', '+20 100 000 0000',
    'address_ar', '',
    'address_en', '',
    'social', jsonb_build_object(
      'facebook', null,
      'instagram', null,
      'twitter', null,
      'linkedin', null,
      'youtube', null
    )
  )),
  ('payments', jsonb_build_object(
    'paymob_enabled', false,
    'offline_enabled', true,
    'currency', 'EGP',
    'currency_symbol_ar', 'ج.م',
    'currency_symbol_en', 'EGP'
  ))
on conflict (key) do nothing;


-- === 20260516010000_portfolio_extended_fields.sql ===
-- ============================================================================
-- Extend portfolio_projects with rich case-study fields
--   - features (what the project offers)
--   - problems solved (pain points the project addresses)
--   - technologies (stack used)
--   - timeline (execution phases with dates)
--   - SEO metadata
-- Extend portfolio_gallery to support video media in addition to images.
-- ============================================================================

alter table public.portfolio_projects
  add column if not exists features_ar text[] not null default '{}',
  add column if not exists features_en text[] not null default '{}',
  add column if not exists problems_solved_ar text[] not null default '{}',
  add column if not exists problems_solved_en text[] not null default '{}',
  add column if not exists technologies text[] not null default '{}',
  add column if not exists timeline_ar jsonb not null default '[]'::jsonb,
  add column if not exists timeline_en jsonb not null default '[]'::jsonb,
  add column if not exists seo_title_ar text,
  add column if not exists seo_title_en text,
  add column if not exists seo_description_ar text,
  add column if not exists seo_description_en text,
  add column if not exists seo_keywords text;

-- Helpful index for searching by tag
create index if not exists portfolio_technologies_idx
  on public.portfolio_projects using gin (technologies);

-- Gallery: allow video items alongside images
alter table public.portfolio_gallery
  add column if not exists media_type text not null default 'image';

-- Backfill + constraint (skip if it already exists)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'portfolio_gallery_media_type_check'
  ) then
    alter table public.portfolio_gallery
      add constraint portfolio_gallery_media_type_check
      check (media_type in ('image', 'video'));
  end if;
end $$;


-- === 20260517000000_service_and_order_extensions.sql ===
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


-- === 20260518000000_message_attachments.sql ===
-- ============================================================================
-- Add attachment metadata to order_messages so messages can carry an audio
-- voice note (or a file/image) alongside or instead of text.
--
-- attachment_url already exists; this migration adds the metadata needed to
-- render the right UI for each attachment kind (inline audio player vs.
-- download link), and relaxes the `content` NOT-NULL implicitly by allowing
-- empty strings when only an attachment is sent.
-- ============================================================================

alter table public.order_messages
  add column if not exists attachment_kind text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_size int,
  add column if not exists attachment_name text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_messages_attachment_kind_check'
  ) then
    alter table public.order_messages
      add constraint order_messages_attachment_kind_check
      check (attachment_kind is null or attachment_kind in ('audio', 'image', 'file'));
  end if;
end $$;

-- Allow empty content when the message is audio-only
alter table public.order_messages
  alter column content drop not null;

-- Ensure that a message has SOMETHING — either text or an attachment.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_messages_payload_check'
  ) then
    alter table public.order_messages
      add constraint order_messages_payload_check
      check (
        (content is not null and length(trim(content)) > 0)
        or attachment_url is not null
      );
  end if;
end $$;


-- === 20260519000000_cms_pages_and_user_groups.sql ===
-- ============================================================================
-- CMS Pages + User Groups + Extra Settings
-- Adds:
--   - cms_pages table (privacy/terms/refund/etc as DB-backed pages)
--   - user_groups + user_group_members (named groups for fine-grained access)
--   - default seed pages
--   - settings: telegram, orders_policy, business_hours; extended contact/social
-- ============================================================================

-- ============================================================================
-- CMS PAGES
-- ============================================================================
create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  content_ar text,
  content_en text,
  status public.post_status not null default 'draft',
  show_in_footer boolean not null default false,
  sort_order int not null default 0,
  is_system boolean not null default false, -- system pages cannot be deleted
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cms_pages_slug_idx on public.cms_pages(slug);
create index cms_pages_status_idx on public.cms_pages(status);
create index cms_pages_show_in_footer_idx on public.cms_pages(show_in_footer);

create trigger cms_pages_touch_updated_at
  before update on public.cms_pages
  for each row execute function public.touch_updated_at();

alter table public.cms_pages enable row level security;

create policy "CMS pages: public read published"
  on public.cms_pages for select
  using (status = 'published' or public.is_admin());

create policy "CMS pages: admin write"
  on public.cms_pages for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- USER GROUPS (named collections of users with optional permissions json)
-- Examples: VIP customers, Beta testers, Partners, Internal QA
-- ============================================================================
create table public.user_groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  -- Free-form permissions object — readable by app code that decides what each
  -- key means. E.g. { "can_skip_review": true, "discount_percent": 10 }
  permissions jsonb not null default '{}'::jsonb,
  color text, -- optional UI color tag (hex)
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_groups_slug_idx on public.user_groups(slug);

create trigger user_groups_touch_updated_at
  before update on public.user_groups
  for each row execute function public.touch_updated_at();

alter table public.user_groups enable row level security;

create policy "User groups: admin read"
  on public.user_groups for select
  using (public.is_admin() or public.is_staff());

create policy "User groups: admin write"
  on public.user_groups for all
  using (public.is_admin()) with check (public.is_admin());

-- Junction: user ↔ group
create table public.user_group_members (
  group_id uuid not null references public.user_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index user_group_members_user_idx on public.user_group_members(user_id);

alter table public.user_group_members enable row level security;

create policy "User group members: staff read; user reads own"
  on public.user_group_members for select
  using (public.is_staff() or user_id = auth.uid());

create policy "User group members: admin write"
  on public.user_group_members for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- SEED: default CMS pages (privacy, terms, refund-policy, about-us, faq)
-- Marked is_system=true so they can't be deleted from the UI (only edited).
-- ============================================================================

insert into public.cms_pages
  (slug, title_ar, title_en, content_ar, content_en, status, show_in_footer, sort_order, is_system, published_at)
values
  (
    'privacy',
    'سياسة الخصوصية',
    'Privacy Policy',
    E'# سياسة الخصوصية\n\nنحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تشاركها معنا.\n\n## المعلومات التي نجمعها\n\n- المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف.\n- معلومات الطلبات والمدفوعات.\n- بيانات الاستخدام والتفاعل مع الموقع.\n\n## كيف نستخدم بياناتك\n\n- لتقديم الخدمات والرد على استفساراتك.\n- لتحسين تجربة الاستخدام.\n- لإرسال إشعارات وتحديثات متعلقة بطلباتك.\n\n## مشاركة البيانات\n\nلا نشارك بياناتك مع أي طرف ثالث إلا بموافقتك أو لتنفيذ خدمات الموقع (مثل بوابات الدفع).\n\n## حقوقك\n\nيحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت.\n\n## التواصل\n\nلأي استفسار حول هذه السياسة، تواصل معنا عبر صفحة "اتصل بنا".',
    E'# Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard the information you share with us.\n\n## Information We Collect\n\n- Personal information: name, email, phone number.\n- Order and payment information.\n- Usage data and site interactions.\n\n## How We Use Your Data\n\n- To provide services and respond to inquiries.\n- To improve your experience.\n- To send notifications and updates related to your orders.\n\n## Sharing Data\n\nWe do not share your data with any third party except with your consent or to fulfil site services (e.g. payment gateways).\n\n## Your Rights\n\nYou may request access, correction, or deletion of your data at any time.\n\n## Contact\n\nFor questions about this policy, reach us via the Contact page.',
    'published',
    true,
    10,
    true,
    now()
  ),
  (
    'terms',
    'شروط الاستخدام',
    'Terms of Service',
    E'# شروط الاستخدام\n\nباستخدام هذا الموقع فإنك توافق على الالتزام بالشروط التالية.\n\n## الخدمات\n\nنوفر خدمات برمجية وتصميمية بناءً على الطلبات المقدمة عبر الموقع. التفاصيل الكاملة لكل خدمة تظهر في صفحة الخدمة قبل تقديم الطلب.\n\n## الطلبات والدفع\n\n- يجب على العميل تقديم معلومات دقيقة عند الطلب.\n- يتم تأكيد السعر النهائي والمدة بعد التفاوض.\n- الدفع يكون عبر الطرق المتاحة في الموقع.\n\n## الإلغاء والاسترداد\n\nيمكن إلغاء الطلب قبل بدء التنفيذ. تفاصيل الاسترداد موضحة في "سياسة الاسترداد".\n\n## الملكية الفكرية\n\nجميع المحتويات والتصاميم المنتجة تُعتبر ملكاً للعميل بعد سداد كامل المستحقات.\n\n## تعديل الشروط\n\nنحتفظ بحق تعديل هذه الشروط في أي وقت، وسيتم إخطار المستخدمين بأي تغييرات جوهرية.',
    E'# Terms of Service\n\nBy using this site you agree to the following terms.\n\n## Services\n\nWe provide programming and design services based on requests submitted via the site. Full details of each service appear on its page before you place an order.\n\n## Orders & Payment\n\n- Customers must provide accurate information when ordering.\n- The final price and timeline are confirmed after negotiation.\n- Payment is made via the methods available on the site.\n\n## Cancellation & Refunds\n\nOrders may be cancelled before execution begins. Refund details are in the Refund Policy.\n\n## Intellectual Property\n\nAll content and designs produced become the customer''s property after full payment is received.\n\n## Modifications\n\nWe reserve the right to modify these terms at any time, with notice of any material changes.',
    'published',
    true,
    20,
    true,
    now()
  ),
  (
    'refund-policy',
    'سياسة الاسترداد',
    'Refund Policy',
    E'# سياسة الاسترداد\n\n## متى يحق لك الاسترداد؟\n\n- إذا لم يتم بدء العمل على الطلب بعد.\n- إذا فشل فريقنا في تسليم الخدمة وفق المتفق عليه.\n- في حالة عدم تحقق المخرجات المتفق عليها وعدم القدرة على الإصلاح خلال مدة معقولة.\n\n## متى لا يحق الاسترداد؟\n\n- بعد البدء الفعلي في تنفيذ الطلب يتم احتساب نسبة العمل المنجز.\n- لا يتم استرداد قيمة الخدمات الاستشارية أو التحليلية المنجزة.\n\n## آلية الاسترداد\n\n- يُقدّم العميل طلب الاسترداد عبر صفحة الطلب أو بريد الدعم.\n- تتم المراجعة خلال 3-5 أيام عمل.\n- يُعاد المبلغ بنفس وسيلة الدفع الأصلية.',
    E'# Refund Policy\n\n## When can you request a refund?\n\n- If work on the order has not yet started.\n- If our team fails to deliver the service as agreed.\n- If the agreed outcomes are not met and cannot be remedied within a reasonable time.\n\n## When refunds do not apply\n\n- After work has actually begun, a percentage based on completed work is deducted.\n- Completed consulting or analytical services are non-refundable.\n\n## How to claim a refund\n\n- Submit a refund request via the order page or support email.\n- Review takes 3–5 business days.\n- Refunds are returned via the original payment method.',
    'published',
    true,
    30,
    true,
    now()
  ),
  (
    'about-us',
    'من نحن',
    'About Us',
    E'# من نحن\n\nنحن فريق متخصص في تقديم حلول برمجية وتصميمية احترافية للشركات والأفراد.\n\n## رسالتنا\n\nتمكين عملائنا من تحقيق أهدافهم الرقمية من خلال منتجات وحلول عالية الجودة.\n\n## رؤيتنا\n\nأن نكون الخيار الأول للشركات الناشئة والمتوسطة في المنطقة العربية في مجال البرمجة والتصميم.\n\n## قيمنا\n\n- الجودة قبل السرعة.\n- الشفافية الكاملة مع العميل.\n- الاستمرارية في التعلم والتطور.',
    E'# About Us\n\nWe are a team specialized in delivering professional programming and design solutions for businesses and individuals.\n\n## Mission\n\nTo enable our customers to achieve their digital goals through high-quality products and solutions.\n\n## Vision\n\nTo be the first choice for startups and SMEs across the Arab region in programming and design.\n\n## Values\n\n- Quality before speed.\n- Full transparency with the client.\n- Continuous learning and growth.',
    'published',
    true,
    40,
    true,
    now()
  ),
  (
    'faq',
    'الأسئلة الشائعة',
    'FAQ',
    E'# الأسئلة الشائعة\n\n## كم يستغرق تنفيذ المشروع؟\n\nيختلف وقت التنفيذ حسب نوع الخدمة وحجم المشروع، ويتم تحديد المدة الدقيقة في مرحلة التفاوض.\n\n## ما هي طرق الدفع المتاحة؟\n\nنقبل الدفع عبر بوابات الدفع الإلكتروني، التحويل البنكي، فودافون كاش، وإنستاباي.\n\n## هل يمكنني تعديل الطلب بعد تقديمه؟\n\nنعم، يمكنك التواصل مع فريقنا لمناقشة أي تعديلات قبل البداية أو خلال مراحل التنفيذ المتفق عليها.\n\n## هل تقدّمون دعمًا بعد التسليم؟\n\nنعم، نقدم فترة دعم مجانية بعد التسليم تختلف مدتها حسب نوع الخدمة.\n\n## كيف يمكنني تتبع تقدم العمل؟\n\nمن خلال صفحة الطلب في حسابك يمكنك رؤية المراحل والتحديثات والملفات المرفوعة لحظياً.',
    E'# Frequently Asked Questions\n\n## How long does a project take?\n\nIt depends on the service type and project size. The exact timeline is set during the negotiation phase.\n\n## What payment methods do you accept?\n\nWe accept online payment gateways, bank transfer, Vodafone Cash, and InstaPay.\n\n## Can I modify my order after submitting it?\n\nYes — contact our team to discuss changes before work starts or during agreed milestones.\n\n## Do you provide post-delivery support?\n\nYes, we offer a free support window after delivery; its duration varies by service.\n\n## How can I track progress?\n\nFrom the order page in your account you can see milestones, updates, and uploaded files in real time.',
    'published',
    true,
    50,
    true,
    now()
  )
on conflict (slug) do nothing;

-- ============================================================================
-- SEED: extra settings (telegram, orders_policy, business_hours)
-- ============================================================================
insert into public.settings (key, value) values
  ('telegram', jsonb_build_object(
    'enabled', false,
    'bot_token', '',
    'admin_chat_id', '',
    'events', jsonb_build_object(
      'new_order', true,
      'order_status_changed', false,
      'payment_received', true,
      'payment_failed', true,
      'new_review', true,
      'new_message_from_customer', false,
      'order_cancelled', true
    ),
    'templates', jsonb_build_object(
      'new_order', E'🆕 *طلب جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالخدمة: {service_name}\nالسعر التقديري: {estimated_price} {currency}\n\n[فتح الطلب]({order_url})',
      'order_status_changed', E'🔄 *تحديث حالة الطلب*\n\n`{order_number}`\nالحالة الجديدة: *{new_status}*\nالعميل: {customer_name}',
      'payment_received', E'💰 *دفعة جديدة*\n\nرقم الطلب: `{order_number}`\nالمبلغ: *{amount} {currency}*\nالعميل: {customer_name}\nطريقة الدفع: {method}',
      'payment_failed', E'❌ *فشل دفع*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nسبب الفشل: {reason}',
      'new_review', E'⭐ *تقييم جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالتقييم: {rating}/5\n\n{comment}',
      'new_message_from_customer', E'💬 *رسالة جديدة من عميل*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\n\n{preview}',
      'order_cancelled', E'🚫 *تم إلغاء طلب*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}'
    )
  )),
  ('orders_policy', jsonb_build_object(
    'max_pending_per_customer', 3,
    'pending_statuses', jsonb_build_array('pending_review', 'under_negotiation'),
    'require_phone_on_signup', false,
    'auto_assign_sales', false
  )),
  ('business_hours', jsonb_build_object(
    'timezone', 'Africa/Cairo',
    'sunday',    jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'monday',    jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'tuesday',   jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'wednesday', jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'thursday',  jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'friday',    jsonb_build_object('open', '00:00', 'close', '00:00', 'closed', true),
    'saturday',  jsonb_build_object('open', '09:00', 'close', '14:00', 'closed', false)
  ))
on conflict (key) do nothing;

-- Extend `contact` setting with extra social channels + map link
update public.settings
set value = value
  || jsonb_build_object(
       'address_link', coalesce(value->>'address_link', ''),
       'working_hours_note_ar', coalesce(value->>'working_hours_note_ar', ''),
       'working_hours_note_en', coalesce(value->>'working_hours_note_en', '')
     )
  || jsonb_build_object(
       'social', coalesce(value->'social', '{}'::jsonb)
         || jsonb_build_object(
              'tiktok', coalesce(value->'social'->>'tiktok', ''),
              'snapchat', coalesce(value->'social'->>'snapchat', ''),
              'github', coalesce(value->'social'->>'github', ''),
              'behance', coalesce(value->'social'->>'behance', ''),
              'dribbble', coalesce(value->'social'->>'dribbble', ''),
              'telegram', coalesce(value->'social'->>'telegram', '')
            )
     )
where key = 'contact';

-- ============================================================================
-- Seed: a couple of default user groups
-- ============================================================================
insert into public.user_groups (slug, name_ar, name_en, description_ar, description_en, color, is_system, permissions)
values
  ('vip',      'عملاء VIP',       'VIP Customers', 'عملاء مميزون يحصلون على أولوية في التنفيذ',  'Priority customers with faster turnaround', '#fbbf24', true,  jsonb_build_object('priority', true, 'discount_percent', 10)),
  ('beta',     'مختبرو النسخة التجريبية', 'Beta Testers',  'يرون الميزات قبل إطلاقها', 'See features before public release',   '#8b5cf6', false, jsonb_build_object('beta_features', true)),
  ('partners', 'شركاء',            'Partners',      'شركاء تجاريون',                  'Business partners',                     '#10b981', false, jsonb_build_object('partner', true))
on conflict (slug) do nothing;


-- === 20260520000000_faq_team_milestones_payment_plan.sql ===
-- ============================================================
-- 2026-05-20: FAQ, Team Members, Milestone Sign-off, Payment Plan
-- ============================================================

-- 1. Service FAQs
CREATE TABLE IF NOT EXISTS service_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  question_ar text NOT NULL,
  question_en text NOT NULL,
  answer_ar   text NOT NULL,
  answer_en   text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_faqs_service_id_idx ON service_faqs(service_id);

ALTER TABLE service_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_faqs_public_read" ON service_faqs
  FOR SELECT USING (true);

CREATE POLICY "service_faqs_admin_all" ON service_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff', 'sales')
    )
  );

-- 2. Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar     text NOT NULL,
  name_en     text NOT NULL,
  role_ar     text NOT NULL,
  role_en     text NOT NULL,
  bio_ar      text,
  bio_en      text,
  avatar_url  text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_public_read" ON team_members
  FOR SELECT USING (is_visible = true);

CREATE POLICY "team_members_admin_all" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff', 'sales')
    )
  );

CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_team_members_updated_at();

-- 3. Milestone customer sign-off column
ALTER TABLE order_milestones
  ADD COLUMN IF NOT EXISTS customer_approved_at timestamptz;

-- 4. Payment plan on orders (jsonb array of installments)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_plan jsonb;

-- 5. About page settings seed (only if key not present)
INSERT INTO settings (key, value)
VALUES ('about', '{"mission_ar":"","mission_en":"","vision_ar":"","vision_en":"","stats":[]}')
ON CONFLICT (key) DO NOTHING;


-- === 20260521000000_soft_delete_categories.sql ===
-- Allow services to outlive their category. Deleting a category now orphans
-- its services (category_id = null) instead of being blocked by the FK.
alter table public.services
  alter column category_id drop not null;

alter table public.services
  drop constraint services_category_id_fkey;

alter table public.services
  add constraint services_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;

-- When a parent category is deleted, promote its children to root-level
-- (parent_id = null) instead of cascading the delete to them.
alter table public.categories
  drop constraint categories_parent_id_fkey;

alter table public.categories
  add constraint categories_parent_id_fkey
  foreign key (parent_id) references public.categories(id) on delete set null;


-- === 20260522000000_seed_catalog.sql ===
-- ============================================================================
-- Seed catalog: 7 root categories, 3 sub-categories, 37 services
-- All inserts are idempotent (ON CONFLICT (slug) DO NOTHING).
-- Run once on a fresh DB or after the soft_delete_categories migration.
-- ============================================================================

-- ─── ROOT CATEGORIES ─────────────────────────────────────────────────────────
insert into public.categories
  (slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, sort_order, is_visible)
values
  ('programming', null,
   'البرمجة والتطوير', 'Programming & Development',
   'حلول برمجية متكاملة تحوّل أفكارك إلى منتجات رقمية تعمل بكفاءة وأمان — من المواقع والتطبيقات إلى الأنظمة المخصصة وأدوات الأتمتة.',
   'End-to-end software solutions that turn your ideas into reliable, secure digital products — from websites and mobile apps to custom systems and automation tools.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
   10, true),

  ('design', null,
   'التصميم', 'Design',
   'تصميم بصري يحكي قصة علامتك ويجذب جمهورك — من الهوية والشعار إلى واجهات المنتج والمحتوى البصري لمواقع التواصل.',
   'Visual design that tells your brand story and engages your audience — from identity and logo to product interfaces and social-ready visual content.',
   'https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=800&q=80',
   20, true),

  ('hosting', null,
   'الاستضافة والبنية التحتية', 'Hosting & Infrastructure',
   'بنية تحتية موثوقة وآمنة لاستضافة موقعك أو تطبيقك — مراقبة على مدار الساعة، نسخ احتياطي تلقائي، وإدارة كاملة للخوادم والنطاقات.',
   'Reliable, secure infrastructure to host your site or app — 24/7 monitoring, automated backups, and full server and domain management.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
   30, true),

  ('social-media', null,
   'السوشيال ميديا', 'Social Media',
   'إدارة احترافية لحضورك على منصات التواصل — محتوى مدروس، تفاعل حقيقي، وتقارير تكشف عائد كل جنيه أنفقته.',
   'Professional management of your social presence — thoughtful content, real engagement, and reports showing the ROI of every dollar spent.',
   'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
   40, true),

  ('digital-marketing', null,
   'التسويق الرقمي', 'Digital Marketing',
   'حملات مبنية على البيانات — SEO، إعلانات مدفوعة، بريد إلكتروني، وتحليل منافسين تجلب لك عملاء حقيقيين لا مجرد أرقام.',
   'Data-driven campaigns — SEO, paid ads, email, and competitor analysis that bring real customers, not just vanity metrics.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
   50, true),

  ('support-training', null,
   'الدعم الفني والتدريب', 'Support & Training',
   'دعم فني سريع وتدريب عملي على الأنظمة — لكي يستفيد فريقك من كل ميزة، ولا يتوقف عملك أبداً بسبب مشكلة تقنية.',
   'Fast technical support and hands-on system training — so your team uses every feature and a technical glitch never stops your work.',
   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
   60, true),

  ('testing-qa', null,
   'الاختبارات وضمان الجودة', 'Testing & QA',
   'نختبر منتجك قبل أن يختبره عملاؤك — اختبارات وظيفية، أداء، أمان، وتجربة استخدام تكشف العيوب قبل الإطلاق.',
   'We test your product before your customers do — functional, performance, security, and usability tests that catch issues before launch.',
   'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
   70, true)
on conflict (slug) do nothing;

-- ─── SUB-CATEGORIES (Testing only) ───────────────────────────────────────────
insert into public.categories
  (slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, sort_order, is_visible)
values
  ('testing-functional',
   (select id from public.categories where slug = 'testing-qa'),
   'اختبارات وظيفية', 'Functional Testing',
   'نتأكد أن كل وظيفة تعمل كما هو متوقع — من زر التسجيل إلى دورة الدفع الكاملة، نختبر كل سيناريو يستخدمه عميلك.',
   'Verifying every function works as expected — from the signup button to the full checkout flow, every scenario your users will hit.',
   'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
   10, true),

  ('testing-non-functional',
   (select id from public.categories where slug = 'testing-qa'),
   'اختبارات غير وظيفية', 'Non-Functional Testing',
   'اختبار جودة التجربة — السرعة، الاستقرار تحت الضغط، التوافق مع كل الأجهزة، وسهولة الاستخدام.',
   'Quality-of-experience testing — speed, stability under load, cross-device compatibility, and overall usability.',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
   20, true),

  ('testing-execution',
   (select id from public.categories where slug = 'testing-qa'),
   'طريقة التنفيذ', 'Execution Method',
   'تنفيذ يدوي (بعين بشرية للتفاصيل الدقيقة) أو آلي (آلاف الحالات في دقائق) — أيًّا كان الأنسب لمشروعك.',
   'Manual execution (human eye for nuance) or automated (thousands of cases in minutes) — whichever fits your project.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
   30, true)
on conflict (slug) do nothing;

-- ─── SERVICES ────────────────────────────────────────────────────────────────
insert into public.services
  (category_id, slug, name_ar, name_en, short_description_ar, short_description_en,
   full_description_ar, full_description_en,
   estimated_price_min, estimated_price_max, currency, estimated_duration_days,
   cover_image, features_ar, features_en, deliverables_ar, deliverables_en,
   sort_order, is_visible, is_featured)
values

-- ═══ PROGRAMMING (7 services) ═══════════════════════════════════════════════

((select id from public.categories where slug = 'programming'),
 'web-development', 'برمجة وتطوير المواقع', 'Web Development',
 'مواقع احترافية من صفحة هبوط بسيطة إلى تطبيقات ويب متكاملة، Frontend و Backend بتقنيات حديثة.',
 'Professional websites from simple landing pages to full-stack web apps, built with modern stacks.',
 'نطوّر مواقع وتطبيقات ويب باستخدام Next.js و React في الواجهة، و Node.js مع PostgreSQL في الخلفية. كل مشروع يبدأ بفهم احتياجك، يمر بتصميم تجربة المستخدم، ثم التطوير والتسليم مع وثائق فنية كاملة. سواء كان موقعك تعريفياً، متجراً، أو تطبيقاً للحجوزات — نضمن أداءً سريعاً وتصميماً متجاوباً.',
 'We build web applications with Next.js + React on the frontend and Node.js + PostgreSQL on the backend. Each project starts with discovery, moves through UX design, then development and deploy-ready delivery with full technical docs. Whether brochure, store, or booking app — fast performance and responsive design guaranteed.',
 8000, 80000, 'EGP', 30,
 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
 array['تصميم متجاوب مع كل الأجهزة','تحسين SEO أساسي مدمج','لوحة تحكم محتوى (CMS)','دعم بعد التسليم لمدة 30 يومًا','كود نظيف وقابل للصيانة']::text[],
 array['Fully responsive on every device','Built-in basic SEO','Content management dashboard','30-day post-delivery support','Clean, maintainable code']::text[],
 array['موقع منشور على نطاقك','كود المصدر كاملاً','وثائق فنية للنشر والصيانة','تدريب على لوحة التحكم']::text[],
 array['Production-deployed site on your domain','Full source code','Technical docs for deployment','Admin-panel training session']::text[],
 10, true, true),

((select id from public.categories where slug = 'programming'),
 'mobile-development', 'برمجة تطبيقات الجوال', 'Mobile Apps',
 'تطبيقات iOS و Android بتقنية React Native — كود واحد، تجربة أصلية على المتجرين، نشر سريع.',
 'iOS and Android apps with React Native — one codebase, native UX on both stores, faster launch.',
 'نطوّر تطبيقات Mobile متعددة المنصات بتقنية React Native، مما يوفر 40-50% من تكلفة نسختين منفصلتين. التطبيق يستخدم مكونات أصلية فيبدو طبيعياً على كل نظام. نتولى النشر على App Store و Google Play، وندمج خدمات الإشعارات، المدفوعات، الخرائط، وتسجيل الدخول الاجتماعي.',
 'Cross-platform mobile apps with React Native, saving 40-50% versus two native builds. Native components mean each platform feels right. We handle App Store and Google Play submission plus integrations like push notifications, payments, maps, and social login.',
 25000, 150000, 'EGP', 60,
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
 array['تطبيق على iOS و Android معاً','إشعارات Push فورية','تكامل مع بوابات الدفع','وضع غير متصل (Offline)','تحديثات OTA بدون مراجعة المتجر']::text[],
 array['Single project ships to iOS and Android','Real-time push notifications','Payment gateway integration','Offline mode','Over-the-air updates without store review']::text[],
 array['تطبيق منشور على المتجرين','كود المصدر بصلاحيات كاملة','حسابات على App Store و Google Play','دليل التحديث والإصدار']::text[],
 array['Published apps on both stores','Full source code ownership','App Store and Play Console accounts','Release and update playbook']::text[],
 20, true, true),

((select id from public.categories where slug = 'programming'),
 'ecommerce-development', 'تطوير المتاجر الإلكترونية', 'E-commerce Stores',
 'متجر إلكتروني كامل: سلة شراء، دفع، إدارة منتجات، شحن، وتقارير — جاهز لاستقبال أول طلب اليوم.',
 'Complete e-commerce: cart, checkout, product management, shipping, reports — ready for your first order today.',
 'متاجر إلكترونية مبنية على Shopify، WooCommerce، أو حلول مخصصة بـ Next.js. تشمل كتالوج بمتغيرات (لون/مقاس)، سلة، دفع آمن (PayMob، Stripe، تحويل بنكي)، حسابات عملاء، إدارة شحن، أكواد خصم، تقارير مبيعات، وتكامل مع المحاسبة والشحن المحلي.',
 'Online stores built on Shopify, WooCommerce, or custom Next.js. Includes catalog with variants, cart, secure checkout (PayMob, Stripe, bank transfer), customer accounts, shipping management, discount codes, sales reports, and integrations with accounting and local carriers.',
 15000, 100000, 'EGP', 45,
 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
 array['كتالوج منتجات بمتغيرات','سلة شراء وحساب عميل','بوابات دفع محلية وعالمية','إدارة شحن وأكواد خصم','تقارير مبيعات وتحليلات']::text[],
 array['Product catalog with variants','Cart and customer accounts','Local plus international payment gateways','Shipping management and discount codes','Sales reports and analytics']::text[],
 array['متجر مفعّل ومنشور','تدريب على إدارة المنتجات والطلبات','تكامل وسائل الدفع والشحن','وثائق فنية للموظفين']::text[],
 array['Live, configured storefront','Product and order management training','Payment and shipping integrations','Staff documentation']::text[],
 30, true, true),

((select id from public.categories where slug = 'programming'),
 'cms-development', 'تطوير أنظمة إدارة المحتوى', 'Custom CMS',
 'نظام محتوى مخصص — صفحات، مقالات، صور، فيديو، وأقسام — قابل للإدارة بدون مبرمج.',
 'Custom content management — pages, posts, images, videos, sections — manageable without a developer.',
 'أنظمة محتوى تتيح لفريقك تحديث الموقع دون لمس كود. سواء كان Strapi، Sanity، WordPress، أو CMS مخصص — نختار الأنسب لحجم محتواك وعدد محرريه. كل نظام يشمل صلاحيات للأدوار، حفظ تلقائي للمسودات، معاينة قبل النشر، وسجل تغييرات كامل.',
 'CMSs that let your team update the site without touching code. Strapi, Sanity, WordPress, or a bespoke build — we pick what fits your content volume and editor count. Every system includes role permissions, draft auto-save, preview before publish, and a full change log.',
 12000, 60000, 'EGP', 25,
 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80',
 array['محرر مرئي للمحتوى (WYSIWYG)','صلاحيات لكل دور (محرر، مراجع، ناشر)','حفظ تلقائي ومعاينة قبل النشر','سجل تغييرات كامل','API للوصول من تطبيقات أخرى']::text[],
 array['Visual content editor (WYSIWYG)','Role-based permissions','Auto-save and pre-publish preview','Full change log','API for external apps']::text[],
 array['CMS منشور على خوادمك','حسابات للمحررين بصلاحياتها','تدريب وأدلة استخدام','دعم لمدة شهر بعد التسليم']::text[],
 array['Deployed CMS on your servers','Editor accounts with proper permissions','Training and user guides','30 days of post-launch support']::text[],
 40, true, false),

((select id from public.categories where slug = 'programming'),
 'bots-automation', 'برمجة الأدوات والبوتات', 'Bots and Automation',
 'بوتات WhatsApp، Telegram، Discord، وأدوات أتمتة توفر لفريقك ساعات من العمل اليدوي يومياً.',
 'WhatsApp, Telegram, and Discord bots plus automation tools that save hours of manual work daily.',
 'أتمتة العمليات المتكررة باستخدام بوتات ذكية وسكريبتات Python و Node.js. أمثلة: بوت WhatsApp يردّ على استفسارات العملاء مع تكامل CRM، بوت Telegram للتنبيهات، أداة تجمع البيانات من مصادر متعددة في Google Sheets، أو تكامل بين أنظمتك (نمط Zapier) لإنهاء العمل تلقائياً.',
 'Automate repetitive operations with smart bots and Python/Node.js scripts. Examples: a WhatsApp bot answering customer queries via CRM integration, a Telegram alerts bot, a scraper feeding Google Sheets from multiple sources, or Zapier-style integration between your systems.',
 5000, 40000, 'EGP', 15,
 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80',
 array['بوتات WhatsApp و Telegram و Discord','تكامل مع CRM والـ APIs الخارجية','جدولة وتشغيل تلقائي (Cron)','تقارير دورية بالبريد','لوحة تحكم لرصد الأداء']::text[],
 array['WhatsApp, Telegram, Discord bots','CRM and external API integrations','Scheduled and cron automation','Periodic email reports','Monitoring dashboard']::text[],
 array['البوت أو الأداة جاهزة للعمل','وثائق التشغيل والصيانة','أرشيف الكود المصدري','تدريب لمشغل الأداة']::text[],
 array['Operational bot or tool','Operation and maintenance docs','Source code archive','Operator training']::text[],
 50, true, false),

((select id from public.categories where slug = 'programming'),
 'bi-dashboards', 'حلول ذكاء الأعمال ولوحات البيانات', 'BI and Dashboards',
 'لوحات بيانات تفاعلية تحوّل أرقام شركتك المتناثرة إلى قرارات واضحة في ثوانٍ.',
 'Interactive dashboards that turn scattered numbers into clear decisions in seconds.',
 'لوحات ذكاء أعمال تجمع البيانات من قاعدة بياناتك، Google Analytics، CRM، Excel، أو أي مصدر آخر، وتعرضها كرسوم بيانية ومؤشرات أداء تفاعلية. نستخدم Metabase، Looker Studio، أو لوحات مخصصة بـ Recharts. تشمل التصفية بالتاريخ، التصدير لـ Excel و PDF، وتنبيهات تلقائية.',
 'BI dashboards that pull from your database, Google Analytics, CRM, Excel, or any other source and render them as interactive charts and KPIs. Built on Metabase, Looker Studio, or custom Recharts. Includes date filtering, Excel/PDF export, and threshold-based alerts.',
 10000, 60000, 'EGP', 20,
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
 array['دمج مصادر بيانات متعددة','رسوم بيانية تفاعلية وتصفية','مؤشرات أداء مع تنبيهات','تصدير لـ Excel و PDF','صلاحيات عرض حسب الدور']::text[],
 array['Unified view across data sources','Interactive charts and filtering','KPIs with smart alerts','Excel and PDF export','Role-based view permissions']::text[],
 array['لوحة بيانات منشورة','تكامل مع مصادر بياناتك','وثائق إضافة لوحات جديدة','تدريب لفريق القرار']::text[],
 array['Deployed dashboard','Source-system integrations','Docs for adding new dashboards','Training for decision makers']::text[],
 60, true, false),

((select id from public.categories where slug = 'programming'),
 'app-security', 'أمن وحماية التطبيقات', 'App Security',
 'حماية تطبيقك من الاختراقات: مراجعة أمنية، اختبار اختراق، إصلاح الثغرات، وتشفير البيانات الحساسة.',
 'Protect your app from breaches: security audit, penetration testing, vulnerability fixes, and sensitive-data encryption.',
 'مراجعة أمنية شاملة على ضوء OWASP Top 10: SQL Injection، XSS، CSRF، رفع ملفات غير آمن، صلاحيات معطّلة، ومشاكل المصادقة. نسلّم تقريراً مفصلاً بكل ثغرة وتأثيرها وخطوات الإصلاح. ثم نطبّق الإصلاحات (اختياري) ونعيد الاختبار للتأكد.',
 'End-to-end audit against OWASP Top 10: SQL Injection, XSS, CSRF, insecure upload, broken access control, and auth issues. You receive a detailed per-vulnerability report with impact and remediation steps. Optional remediation phase, followed by re-testing.',
 8000, 40000, 'EGP', 14,
 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
 array['مراجعة كاملة لقائمة OWASP Top 10','اختبار اختراق يدوي وآلي','تقرير مفصل بكل ثغرة وتأثيرها','إصلاح الثغرات (اختياري)','شهادة أمان بعد الإصلاح']::text[],
 array['Full OWASP Top 10 review','Manual and automated penetration testing','Detailed per-vulnerability report','Optional remediation phase','Security certificate post-fix']::text[],
 array['تقرير الأمان الشامل','خطة إصلاح بأولويات','إصلاح الثغرات الحرجة','إعادة اختبار بعد الإصلاح']::text[],
 array['Comprehensive security report','Prioritized remediation plan','Critical-vulnerability fixes','Post-fix re-test']::text[],
 70, true, false),

-- ═══ DESIGN (5 services) ═════════════════════════════════════════════════════

((select id from public.categories where slug = 'design'),
 'ux-prototyping', 'تجربة المستخدم والنماذج الأولية', 'UX and Prototyping',
 'نرسم رحلة المستخدم قبل أن نلمس البكسل — أبحاث، نماذج أولية تفاعلية، واختبار مع مستخدمين حقيقيين.',
 'We map the user journey before touching a pixel — research, interactive prototypes, and real-user testing.',
 'تبدأ خدمة تجربة المستخدم بفهم جمهورك وأهدافك التجارية. نُنتج خرائط رحلة المستخدم (user flows)، wireframes، ونماذج أولية تفاعلية في Figma يمكنك تجربتها كأنها تطبيق حقيقي قبل بدء التطوير. ثم نختبر النموذج مع 5-7 مستخدمين ونوثّق النتائج.',
 'UX work starts with understanding your audience and business goals. We deliver user-flow maps, wireframes, and clickable Figma prototypes you can experience like a real app before development. Then we test with 5-7 real users and document the findings.',
 6000, 25000, 'EGP', 15,
 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
 array['أبحاث مستخدمين ومقابلات','user flows و wireframes','نموذج أولي تفاعلي في Figma','اختبار مع 5-7 مستخدمين','تقرير نتائج مفصل']::text[],
 array['User research and interviews','User flows and wireframes','Clickable Figma prototype','Usability test with 5-7 users','Detailed findings report']::text[],
 array['وثائق رحلة المستخدم','ملفات Figma مفتوحة','نموذج أولي قابل للمشاركة','تقرير اختبار المستخدمين']::text[],
 array['User journey documents','Editable Figma files','Shareable interactive prototype','User-testing report']::text[],
 10, true, false),

((select id from public.categories where slug = 'design'),
 'ui-design', 'تصميم واجهات المواقع والتطبيقات', 'UI Design',
 'واجهات حديثة جذابة، متجاوبة، وملتزمة بمعايير الوصول (Accessibility) — جاهزة للتطوير مباشرة.',
 'Modern, attractive, responsive interfaces meeting accessibility standards — ready for developer handoff.',
 'تصميم واجهات يبدأ بنظام تصميم (Design System) موحّد: ألوان، خطوط، أزرار، حقول، أيقونات. ثم نطبّق النظام على كل شاشات منتجك في Figma، نراعي حالات الفراغ والخطأ والتحميل، ونلتزم بمعايير WCAG للوصول. التسليم يشمل ملفات تطوير جاهزة (specs، assets، CSS variables).',
 'UI work starts with a unified design system: colors, typography, buttons, fields, icons. We then apply the system across every product screen in Figma, covering empty/error/loading states, and following WCAG accessibility standards. Handoff includes developer-ready specs, assets, and CSS variables.',
 8000, 35000, 'EGP', 18,
 'https://images.unsplash.com/photo-1545665277-5937489579f2?auto=format&fit=crop&w=1200&q=80',
 array['نظام تصميم موحّد (Design System)','كل شاشات المنتج بحالاتها المختلفة','التزام بمعايير الوصول WCAG','أيقونات وأصول جاهزة','ملف تطوير جاهز (specs و assets)']::text[],
 array['Unified design system','All product screens with every state','WCAG-compliant accessibility','Icons and ready assets','Developer-ready specs and assets']::text[],
 array['ملف Figma كامل','مكتبة نظام التصميم','حزمة أيقونات وأصول','وثائق التسليم للمطور']::text[],
 array['Complete Figma file','Design-system library','Icon and asset package','Developer handoff documentation']::text[],
 20, true, true),

((select id from public.categories where slug = 'design'),
 'brand-identity', 'تصميم الهوية البصرية', 'Brand Identity',
 'هوية كاملة: شعار، ألوان، خطوط، أيقونات، وأنماط استخدام — كل ما تحتاجه ليتذكرك جمهورك.',
 'Full identity: logo, colors, typography, icons, and usage guidelines — everything to make your brand memorable.',
 'بناء هوية بصرية متكاملة لعلامتك التجارية. نبدأ بورشة استكشاف لفهم شخصية الماركة وجمهورها، ثم نقترح 3 اتجاهات للشعار، نختار الأنسب ونطوّره بدقة. الناتج هو دليل هوية (Brand Book) يحوي الشعار بكل صيغه، نظام الألوان، الخطوط، الأيقونات، والقواعد البصرية لاستخدامها على كل المنصات.',
 'A complete visual identity for your brand. We start with a discovery workshop to understand brand personality and audience, then propose 3 logo directions, refine the best one, and deliver a Brand Book covering logo in all variants, color system, typography, icons, and visual rules for every platform.',
 10000, 50000, 'EGP', 21,
 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
 array['ورشة استكشاف للماركة','3 اتجاهات شعار للاختيار','نظام ألوان وخطوط','حزمة أيقونات أساسية','دليل هوية (Brand Book) كامل']::text[],
 array['Brand discovery workshop','3 logo directions to choose from','Color and typography system','Core icon set','Comprehensive Brand Book']::text[],
 array['الشعار بكل الصيغ والملفات','دليل الهوية البصرية PDF','حزمة الأيقونات والأصول','قوالب بطاقات وأوراق رسمية']::text[],
 array['Logo in every format','Brand Identity Guidelines PDF','Icon and asset pack','Business-card and letterhead templates']::text[],
 30, true, true),

((select id from public.categories where slug = 'design'),
 'social-media-design', 'تصميم منشورات السوشيال ميديا', 'Social Media Posts',
 'بوستات وستوريز وريلز جاهزة للنشر — حزم شهرية تحافظ على هويتك البصرية على كل المنصات.',
 'Posts, stories, and reels ready to publish — monthly bundles that keep visual identity consistent across platforms.',
 'حزم شهرية من المنشورات البصرية لمواقع التواصل — تصميمات Instagram و Facebook و LinkedIn و TikTok مع مراعاة المقاسات المختلفة (Feed، Story، Reels). نقترح خطة محتوى شهرية مرتبطة بمناسبات وحملاتك، ونصمم القوالب بحيث يكون التحديث الأسبوعي بسيطاً.',
 'Monthly social-design bundles — Instagram, Facebook, LinkedIn, TikTok with all required sizes (Feed, Story, Reels). We propose a monthly content plan tied to events and your campaigns, and build templates so weekly updates stay simple.',
 4000, 18000, 'EGP', 15,
 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
 array['تصاميم لـ Instagram و Facebook و TikTok','مقاسات Feed و Story و Reels','خطة محتوى شهرية مقترحة','قوالب قابلة للتحديث الأسبوعي','مونتاج Reels و Shorts قصير']::text[],
 array['Designs for Instagram, Facebook, TikTok','Feed, Story, and Reels sizes','Suggested monthly content plan','Reusable weekly templates','Short Reels and Shorts editing']::text[],
 array['حزمة 20-30 تصميم شهرياً','قوالب قابلة للتعديل','مونتاج فيديو قصير','ملفات مفتوحة لتعديلاتك المستقبلية']::text[],
 array['20-30 designs per month','Editable templates','Short video editing','Open source files for future tweaks']::text[],
 40, true, false),

((select id from public.categories where slug = 'design'),
 'print-design', 'تصميم الإعلانات المطبوعة واليافطات', 'Print and Banner Design',
 'تصميم لافتات شوارع، بروشورات، رول-آب، أوراق رسمية — بجودة طباعة عالية وملفات جاهزة للمطبعة.',
 'Street banners, brochures, roll-ups, letterheads — high print-quality designs with press-ready files.',
 'تصميم مطبوعات احترافية بدقة طباعة 300 DPI، ألوان CMYK، وحوافّ Bleed جاهزة للمطبعة. نغطي كل المطبوعات: لافتات الشوارع، بروشورات A4/DL، رول-آب 80×200، بروشورات Z-Fold، بطاقات أعمال، أوراق رسمية، وقوائم طعام للمطاعم. التسليم بصيغ PDF/X-1a، AI، PSD.',
 'Professional print design at 300 DPI, CMYK colors, with bleed — press-ready. We cover every format: street banners, A4/DL brochures, 80×200 roll-ups, Z-Fold brochures, business cards, letterheads, and restaurant menus. Delivered as PDF/X-1a, AI, PSD.',
 2500, 15000, 'EGP', 10,
 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80',
 array['دقة طباعة 300 DPI و CMYK','حوافّ Bleed جاهزة','تصميم متعدد الصيغ والمقاسات','مراجعتان مجانيتان','تنسيق مع المطبعة (إن طلبت)']::text[],
 array['300 DPI and CMYK print specs','Press-ready bleeds','Multi-format design','Two rounds of revisions included','Press coordination if requested']::text[],
 array['ملفات PDF/X-1a للمطبعة','ملفات مفتوحة AI و PSD','معاينة مرئية قبل الطباعة','نصائح اختيار الورق والمطبعة']::text[],
 array['PDF/X-1a press files','Open AI and PSD files','Visual preview before print','Paper and printshop recommendations']::text[],
 50, true, false),

-- ═══ HOSTING (4 services) ════════════════════════════════════════════════════

((select id from public.categories where slug = 'hosting'),
 'shared-vps-hosting', 'استضافة مشتركة و VPS', 'Shared and VPS Hosting',
 'استضافة موثوقة بأسعار مناسبة — مساحة كافية، نطاق فرعي مجاني، SSL، ولوحة تحكم cPanel.',
 'Reliable hosting at sensible prices — generous storage, free subdomain, SSL, and a cPanel dashboard.',
 'استضافة مشتركة لمواقع صغيرة ومتوسطة، أو VPS مخصص بصلاحيات كاملة. كل خطة تشمل SSL مجاني، نطاقاً فرعياً، نسخ احتياطي أسبوعي، وحماية DDoS أساسية. الخوادم في مراكز بيانات أوروبية وعربية بأقل زمن استجابة لجمهورك.',
 'Shared hosting for small/medium sites or a fully-controlled VPS. Every plan includes free SSL, a subdomain, weekly backups, and basic DDoS protection. Data centers in Europe and the Middle East for minimum latency to your audience.',
 1200, 12000, 'EGP', 3,
 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
 array['مساحة تخزين مرنة','SSL مجاني تلقائي','نسخ احتياطي أسبوعي','حماية DDoS أساسية','لوحة تحكم cPanel']::text[],
 array['Flexible storage','Free auto-SSL','Weekly backups','Basic DDoS protection','cPanel dashboard']::text[],
 array['حساب استضافة مفعّل','SSL مثبت','تكامل مع نطاقك','تدريب على cPanel']::text[],
 array['Active hosting account','Installed SSL','Domain wiring','cPanel walkthrough']::text[],
 10, true, false),

((select id from public.categories where slug = 'hosting'),
 'dedicated-cloud-servers', 'خوادم سحابية مخصصة', 'Dedicated Cloud Servers',
 'إعداد وإدارة خوادم AWS، DigitalOcean، Hetzner — تخصيص حسب الحمل، نسخ احتياطي، ومراقبة مستمرة.',
 'AWS, DigitalOcean, Hetzner setup and management — sized to your load, backups, and active monitoring.',
 'إعداد وإدارة خوادم سحابية على AWS (EC2, RDS, S3, CloudFront)، DigitalOcean، Hetzner، أو Azure. نختار الحجم المناسب لحملك، نعدّ Auto-Scaling، CDN، نسخاً احتياطياً يومياً، ومراقبة 24/7 مع تنبيهات Slack أو واتس آب. نتعامل مع تحديثات الأمان الدورية ودوال الطوارئ.',
 'Setup and management of AWS (EC2, RDS, S3, CloudFront), DigitalOcean, Hetzner, or Azure. We size for your load, configure auto-scaling, CDN, daily backups, and 24/7 monitoring with Slack/WhatsApp alerts. We handle security patching and emergency response.',
 5000, 50000, 'EGP', 7,
 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
 array['إعداد كامل لـ AWS / DigitalOcean / Hetzner','Auto-Scaling حسب الحمل','نسخ احتياطي يومي إلى مكان منفصل','مراقبة 24/7 مع تنبيهات فورية','تحديثات أمنية دورية']::text[],
 array['Full AWS / DigitalOcean / Hetzner setup','Load-based auto-scaling','Daily off-site backups','24/7 monitoring with real-time alerts','Regular security patching']::text[],
 array['خادم منشور ومُؤمَّن','وثائق البنية التحتية','وصول كامل للحساب','عقد إدارة شهري (اختياري)']::text[],
 array['Hardened, deployed server','Infrastructure documentation','Full account ownership','Optional monthly management contract']::text[],
 20, true, true),

((select id from public.categories where slug = 'hosting'),
 'domains-email', 'إدارة النطاقات وبريد العمل', 'Domains and Business Email',
 'حجز نطاقك، ضبط DNS، إعداد بريد عمل احترافي مع تكامل Outlook و Gmail.',
 'Domain registration, DNS configuration, professional business email integrated with Outlook and Gmail.',
 'إدارة دورة حياة نطاقاتك من البحث والحجز إلى التجديد. نضبط سجلات DNS (A, MX, TXT, SPF, DKIM, DMARC) لتحسين توصيل البريد ومنع التزوير. نُعدّ بريد عمل احترافياً (info@yourbrand.com) عبر Google Workspace أو Microsoft 365 أو Zoho Mail مع تكامل سلس مع Outlook و Gmail.',
 'Full domain lifecycle management from search and registration to renewal. We configure DNS records (A, MX, TXT, SPF, DKIM, DMARC) for deliverability and anti-spoofing. We set up professional business email via Google Workspace, Microsoft 365, or Zoho Mail with seamless Outlook and Gmail integration.',
 1500, 10000, 'EGP', 5,
 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
 array['حجز ونقل النطاقات','ضبط DNS متقدم','بريد عمل احترافي (Google/M365/Zoho)','SPF + DKIM + DMARC لتوصيل أفضل','تكامل Outlook و Gmail']::text[],
 array['Domain registration and transfer','Advanced DNS configuration','Professional business email','SPF, DKIM, DMARC for deliverability','Outlook and Gmail integration']::text[],
 array['نطاق مفعّل ومُؤمَّن','حسابات بريد للموظفين','وثائق إعدادات DNS','دليل إعداد عملاء البريد']::text[],
 array['Active, secured domain','Staff email accounts','DNS configuration docs','Mail-client setup guide']::text[],
 30, true, false),

((select id from public.categories where slug = 'hosting'),
 'server-monitoring', 'مراقبة وصيانة الخوادم', 'Server Monitoring and Maintenance',
 'مراقبة على مدار الساعة، تنبيهات قبل الأعطال، تحديثات أمنية، ونسخ احتياطي تلقائي يومي.',
 'Around-the-clock monitoring, pre-failure alerts, security patches, and daily automated backups.',
 'عقد إدارة شهري للخوادم: نراقب CPU، الذاكرة، القرص، الشبكة، وزمن استجابة التطبيق على مدار الساعة. ننبّه فريقك قبل تجاوز العتبات الحرجة. نطبّق التحديثات الأمنية الشهرية، نتحقق من النسخ الاحتياطي يومياً، ونستجيب لطوارئ خلال 30 دقيقة.',
 'Monthly server management: 24/7 monitoring of CPU, memory, disk, network, and app latency. We alert before critical thresholds are crossed. Monthly security patching, daily backup verification, and 30-minute emergency response.',
 2500, 15000, 'EGP', 30,
 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1200&q=80',
 array['مراقبة 24/7 مع لوحة بيانات حية','تنبيهات قبل الأعطال (Slack/WhatsApp/Email)','تحديثات أمنية شهرية','تحقق يومي من النسخ الاحتياطي','استجابة طوارئ خلال 30 دقيقة']::text[],
 array['24/7 monitoring with live dashboard','Pre-failure alerts (Slack/WhatsApp/Email)','Monthly security patching','Daily backup verification','30-minute emergency response']::text[],
 array['لوحة مراقبة حية','تقارير صحة الخادم شهرياً','سجل التحديثات والإصلاحات','رقم طوارئ مباشر']::text[],
 array['Live monitoring dashboard','Monthly server health reports','Patch and fix log','Direct emergency contact']::text[],
 40, true, false),

-- ═══ SOCIAL MEDIA (5 services) ═══════════════════════════════════════════════

((select id from public.categories where slug = 'social-media'),
 'social-management', 'إدارة الحسابات والنشر', 'Account Management',
 'إدارة كاملة لحساباتك على Instagram، Facebook، Twitter، LinkedIn — تخطيط شهري، نشر، وردود على المتابعين.',
 'Full management of Instagram, Facebook, Twitter, LinkedIn — monthly planning, publishing, and reply handling.',
 'إدارة شاملة لحضورك على السوشيال ميديا: خطة محتوى شهرية مرتبطة بأهدافك التجارية، 15-20 منشوراً متنوعاً (صور، فيديو، Reels، Stories)، نشر بمواعيد محسوبة، وردود على تعليقات ورسائل الجمهور خلال ساعات قليلة. تقرير شهري واضح بالنتائج والتوصيات.',
 'Comprehensive social management: monthly content plan tied to business goals, 15-20 varied posts (image, video, Reels, Stories), publishing at optimized times, and replies to comments and DMs within hours. Clear monthly report with results and recommendations.',
 5000, 25000, 'EGP', 30,
 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
 array['خطة محتوى شهرية','15-20 منشور متنوع شهرياً','نشر بمواعيد محسوبة','ردود على التعليقات والرسائل','تقرير أداء شهري']::text[],
 array['Monthly content plan','15-20 varied posts per month','Posts scheduled at peak times','Comment and DM responses','Monthly performance report']::text[],
 array['تقويم محتوى شهري','منشورات منشورة على كل المنصات','تقرير الأداء الشهري','اجتماع مراجعة شهري']::text[],
 array['Monthly content calendar','Posts published across platforms','Monthly performance report','Monthly review meeting']::text[],
 10, true, true),

((select id from public.categories where slug = 'social-media'),
 'content-creation', 'إنشاء محتوى مرئي مختص', 'Visual Content Creation',
 'تصوير، مونتاج فيديو، Reels و Shorts، وصور احترافية — محتوى يجعل صفحاتك تنافس الكبار.',
 'Shooting, video editing, Reels and Shorts, professional photography — content that punches above its weight.',
 'باقات إنتاج محتوى مرئي بمقاييس استوديو: تصوير منتجاتك بإضاءة احترافية، مونتاج فيديوهات Reels قصيرة بإيقاع سريع وموسيقى ترند، وصور لوكيشن أو في موقع عملك. نأتي بفريق التصوير والإضاءة، ونسلّمك المحتوى منسّقاً ومعدّلاً وجاهزاً للنشر.',
 'Studio-grade visual content: professional product photography with proper lighting, fast-paced Reels editing with trending audio, and on-location or workplace shoots. We bring the crew and lighting and deliver finished, color-graded content ready to publish.',
 6000, 35000, 'EGP', 14,
 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80',
 array['تصوير احترافي بمعدات استوديو','مونتاج Reels و Shorts','صور منتجات وبورتريه','معالجة لون وصوت','تسليم بصيغ متعددة (Feed/Story/Reel)']::text[],
 array['Studio-grade photography','Reels and Shorts editing','Product and portrait shoots','Color and audio grading','Multi-format delivery (Feed/Story/Reel)']::text[],
 array['حزمة محتوى مرئي شهرية','صور منسقة بدقة عالية','فيديوهات قصيرة منشورة','ملفات مفتوحة (Raw + Edits)']::text[],
 array['Monthly visual content pack','High-res, retouched photos','Published short videos','Open files (Raw plus Edits)']::text[],
 20, true, false),

((select id from public.categories where slug = 'social-media'),
 'paid-ads', 'الإعلانات المدفوعة', 'Paid Ads',
 'حملات مدفوعة على Meta، TikTok، LinkedIn — استهداف دقيق، إبداعات متعددة، وتقارير بعائد كل جنيه.',
 'Paid campaigns on Meta, TikTok, LinkedIn — precise targeting, multiple creatives, ROI per dollar reporting.',
 'إدارة كاملة لحملاتك المدفوعة على Meta Ads، TikTok Ads، Google Ads، و LinkedIn Ads. نبدأ بأبحاث الجمهور والمنافسين، ثم نختبر 3-5 إبداعات في كل حملة لاكتشاف الأنجح. نُحسّن الحملة كل أسبوع ونرسل لك تقريراً واضحاً بعدد العملاء المحتملين، التكلفة، وعائد الاستثمار.',
 'End-to-end paid-campaign management on Meta, TikTok, Google, and LinkedIn Ads. We start with audience and competitor research, then split-test 3-5 creatives per campaign to find the winner. Weekly optimization and clear weekly reports on leads, cost per lead, and ROI.',
 6000, 30000, 'EGP', 30,
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
 array['Meta و TikTok و Google و LinkedIn','اختبار 3-5 إبداعات لكل حملة','تحسين أسبوعي مستمر','تتبع التحويلات (Pixel و Conversion API)','تقرير ROI أسبوعي']::text[],
 array['Meta, TikTok, Google, LinkedIn','3-5 creatives split-tested per campaign','Weekly optimization','Conversion tracking (Pixel and Conversion API)','Weekly ROI reports']::text[],
 array['حسابات إعلانية مُعدّة','حملات نشطة محسّنة','تقارير ROI أسبوعية','اجتماع مراجعة شهري']::text[],
 array['Configured ad accounts','Live, optimized campaigns','Weekly ROI reports','Monthly review meeting']::text[],
 30, true, true),

((select id from public.categories where slug = 'social-media'),
 'social-analytics', 'تحليل الأداء والتقارير', 'Performance Analytics',
 'تقارير شهرية واضحة بمؤشرات الأداء، أفضل المنشورات، ومقترحات لتحسين الشهر التالي.',
 'Clear monthly reports with KPIs, top-performing posts, and recommendations for next month.',
 'تقارير شهرية احترافية بـ PDF تجمع بيانات Instagram Insights، Facebook Business، TikTok Analytics، LinkedIn Page، و Google Analytics في صورة واحدة. تشمل: نمو المتابعين، الوصول والتفاعل، أفضل 5 منشورات، أوقات الذروة، مقارنة بالمنافسين، وتوصيات قابلة للتنفيذ للشهر التالي.',
 'Professional monthly PDF reports that consolidate Instagram Insights, Facebook Business, TikTok Analytics, LinkedIn Page, and Google Analytics into a single view. Includes follower growth, reach and engagement, top 5 posts, peak times, competitor benchmarks, and actionable next-month recommendations.',
 3000, 12000, 'EGP', 30,
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
 array['تقرير PDF شهري احترافي','جمع بيانات من كل المنصات','مقارنة بالمنافسين','أفضل 5 منشورات وأوقات الذروة','توصيات قابلة للتنفيذ']::text[],
 array['Professional monthly PDF report','Aggregated data from all platforms','Competitor benchmarks','Top 5 posts and peak times','Actionable recommendations']::text[],
 array['تقرير PDF شهري','جلسة مراجعة 60 دقيقة','خطة عمل للشهر التالي','لوحة بيانات مباشرة (اختياري)']::text[],
 array['Monthly PDF report','60-minute review session','Next-month action plan','Optional live dashboard']::text[],
 40, true, false),

((select id from public.categories where slug = 'social-media'),
 'brand-reputation', 'إدارة سمعة العلامة التجارية', 'Brand Reputation',
 'مراقبة ذكر علامتك على كل المنصات، الرد على المراجعات، وإدارة الأزمات قبل أن تتفاقم.',
 'Monitor brand mentions everywhere, reply to reviews, and manage crises before they escalate.',
 'حماية سمعتك على الإنترنت بمراقبة دائمة لذكر اسم علامتك على Google Reviews، Trustpilot، السوشيال ميديا، والمنتديات. نردّ على المراجعات السلبية باحترافية، نعزز الإيجابية، وندير الأزمات (Crisis Management) بخطة جاهزة. تنبيهات فورية لو ظهر تهديد لسمعتك.',
 'Online reputation protection with constant monitoring of brand mentions on Google Reviews, Trustpilot, social media, and forums. Professional replies to negative reviews, amplification of positive ones, and crisis management with a prepared playbook. Instant alerts when reputation threats appear.',
 4000, 18000, 'EGP', 30,
 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
 array['مراقبة 24/7 لذكر علامتك','الرد على Google Reviews و Trustpilot','تنبيهات فورية لأي تهديد','خطة إدارة الأزمات الجاهزة','تعزيز المراجعات الإيجابية']::text[],
 array['24/7 brand mention monitoring','Replies to Google Reviews and Trustpilot','Real-time threat alerts','Crisis management playbook','Positive review amplification']::text[],
 array['لوحة مراقبة سمعة مباشرة','ردود احترافية على المراجعات','خطة استجابة للأزمات','تقرير تحليل سمعة شهري']::text[],
 array['Live reputation dashboard','Professional review replies','Crisis-response plan','Monthly reputation analysis report']::text[],
 50, true, false),

-- ═══ DIGITAL MARKETING (4 services) ══════════════════════════════════════════

((select id from public.categories where slug = 'digital-marketing'),
 'seo', 'تحسين محركات البحث (SEO)', 'Search Engine Optimization',
 'تظهر في النتائج الأولى لأهم كلمات جمهورك — تحليل، تحسين تقني، محتوى، وبناء روابط.',
 'Rank #1 for your audience key terms — audit, technical SEO, content, and link building.',
 'برنامج SEO متكامل من 3 مراحل: مراجعة تقنية شاملة (سرعة، structured data، sitemaps، robots، canonical، indexing)، تحسين on-page لكل صفحة (meta، schema، روابط داخلية، محتوى مقصود)، وبناء روابط خارجية عبر مقالات ضيف ومراجعات في مواقع موثوقة. تقرير ترتيب شهري لـ 30-50 كلمة مفتاحية.',
 'A 3-phase SEO program: complete technical audit (speed, structured data, sitemaps, robots, canonical, indexing), on-page optimization for every page (meta, schema, internal linking, intent-matching content), and off-page link building via guest posts and reviews on authority sites. Monthly ranking report for 30-50 target keywords.',
 8000, 35000, 'EGP', 90,
 'https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&w=1200&q=80',
 array['مراجعة تقنية شاملة','تحسين on-page لكل صفحة','بناء روابط خارجية','تتبع 30-50 كلمة مفتاحية','تقرير ترتيب شهري']::text[],
 array['Comprehensive technical audit','Per-page on-page optimization','Off-page link building','Tracking 30-50 keywords','Monthly ranking report']::text[],
 array['تقرير المراجعة التقنية','خطة SEO ربع سنوية','تقارير الترتيب الشهرية','اجتماع مراجعة كل شهرين']::text[],
 array['Technical audit report','Quarterly SEO roadmap','Monthly ranking reports','Bi-monthly review meeting']::text[],
 10, true, true),

((select id from public.categories where slug = 'digital-marketing'),
 'email-automation', 'التسويق بالبريد والأتمتة', 'Email and Automation',
 'حملات بريد إلكتروني مدروسة + سيناريوهات أتمتة تحوّل المشتركين إلى عملاء بدون تدخل يومي.',
 'Smart email campaigns + automation flows that convert subscribers into customers hands-off.',
 'إعداد بنية البريد التسويقي على Mailchimp، Klaviyo، Brevo، أو ActiveCampaign. تصميم 5-7 سيناريوهات أتمتة جاهزة (ترحيب، سلة متروكة، استرجاع عميل، يوم ميلاد، ما بعد الشراء). تصميم وكتابة 4 نشرات شهرية، وتحسين معدل الفتح والنقر بالاختبار المستمر.',
 'Marketing-email setup on Mailchimp, Klaviyo, Brevo, or ActiveCampaign. Design of 5-7 automation flows (welcome, cart abandonment, win-back, birthday, post-purchase). Design and copy for 4 monthly newsletters, and continuous open/click-rate optimization via testing.',
 5000, 22000, 'EGP', 30,
 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80',
 array['Mailchimp / Klaviyo / Brevo / ActiveCampaign','5-7 سيناريوهات أتمتة جاهزة','4 نشرات شهرية بتصميم احترافي','اختبارات A/B لتحسين الفتح','تقارير أداء أسبوعية']::text[],
 array['Mailchimp / Klaviyo / Brevo / ActiveCampaign','5-7 ready automation flows','4 designed monthly newsletters','A/B testing for open rates','Weekly performance reports']::text[],
 array['حساب بريد مُعدّ وجاهز','مكتبة قوالب بريدية','سيناريوهات أتمتة نشطة','تقارير أداء أسبوعية']::text[],
 array['Configured email account','Template library','Live automation flows','Weekly performance reports']::text[],
 20, true, false),

((select id from public.categories where slug = 'digital-marketing'),
 'integrated-campaigns', 'إدارة الحملات المتكاملة', 'Integrated Campaigns',
 'حملات متعددة القنوات (Google + Meta + Email) — رسالة موحدة، تتبع كامل، وعائد قابل للقياس.',
 'Multi-channel campaigns (Google + Meta + Email) — unified message, full attribution, measurable ROI.',
 'تنفيذ حملات تسويقية موسمية متكاملة: تحدد هدفاً واضحاً (إطلاق منتج، عرض موسمي، توعية بعلامة)، نصمم رسالة موحدة، ثم ننفّذها عبر 3-5 قنوات (Google Ads، Meta، TikTok، Email، Influencers). نتبع كل تفاعل من النقرة الأولى للشراء، ونحسب عائد كل قناة.',
 'End-to-end seasonal campaigns: define a clear goal (product launch, seasonal offer, brand awareness), craft a unified message, then deploy across 3-5 channels (Google Ads, Meta, TikTok, Email, Influencers). We attribute every touchpoint from first click to purchase and compute per-channel ROI.',
 12000, 60000, 'EGP', 45,
 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80',
 array['حملة موحدة على 3-5 قنوات','رسالة وإبداعات متناغمة','تتبع كامل من النقرة للشراء','عائد كل قناة بوضوح','تحسين أسبوعي مستمر']::text[],
 array['Unified campaign across 3-5 channels','Cohesive message and creatives','Full first-click to purchase attribution','Clear per-channel ROI','Weekly optimization']::text[],
 array['خطة حملة موثقة','إبداعات لكل قناة','لوحة بيانات حملة موحدة','تقرير ختامي بعائد كل قناة']::text[],
 array['Documented campaign plan','Per-channel creatives','Unified campaign dashboard','Final report with per-channel ROI']::text[],
 30, true, false),

((select id from public.categories where slug = 'digital-marketing'),
 'competitor-keyword-analysis', 'تحليل المنافسين والكلمات المفتاحية', 'Competitor and Keyword Analysis',
 'نكشف لك ماذا يفعل منافسوك، أين يستثمرون، وأي الكلمات تحوّل لهم زواراً — فتسبقهم بمعرفة.',
 'Reveal what competitors do, where they invest, and which keywords convert — so you outpace them with knowledge.',
 'تحليل تنافسي شامل لـ 5-10 منافسين: استراتيجيتهم على السوشيال، إعلاناتهم النشطة (Meta Ad Library)، ترتيبهم في Google لأهم الكلمات، روابطهم الخلفية، وميزانية SEO المقدّرة. نسلّمك خريطة الفرص: ماذا يفعلونه ولا تفعله، وأين تكلفة الحصول على العميل أرخص.',
 'Comprehensive competitive analysis of 5-10 competitors: social strategy, active ads (Meta Ad Library), Google ranking for key terms, backlinks, and estimated SEO budget. You receive an opportunity map: what they do that you do not, and where customer acquisition is cheaper.',
 5000, 20000, 'EGP', 14,
 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
 array['تحليل 5-10 منافسين','استراتيجيتهم على كل القنوات','إعلاناتهم النشطة وميزانيتهم المقدّرة','الكلمات التي يحققون منها زيارات','خريطة الفرص لتمييزك']::text[],
 array['Analysis of 5-10 competitors','Their strategy across every channel','Active ads and estimated budgets','Keywords driving their traffic','Opportunity map for differentiation']::text[],
 array['تقرير تحليل تنافسي مفصل','قائمة 50+ كلمة مفتاحية ذهبية','خريطة فرص قابلة للتنفيذ','جلسة عرض ومناقشة 90 دقيقة']::text[],
 array['Detailed competitive analysis report','List of 50+ high-opportunity keywords','Actionable opportunity map','90-minute presentation session']::text[],
 40, true, false),

-- ═══ SUPPORT and TRAINING (4 services) ═══════════════════════════════════════

((select id from public.categories where slug = 'support-training'),
 'multi-channel-support', 'دعم فني متعدد القنوات', 'Multi-Channel Tech Support',
 'دعم فني عبر الدردشة، التذاكر، والهاتف — أوقات استجابة محددة بعقد، وتقارير شهرية.',
 'Tech support via chat, tickets, and phone — SLA-bound response times and monthly reports.',
 'فريق دعم فني محترف يتعامل مع عملائك بالعربية أو الإنجليزية. نوفر قنوات متعددة: دردشة مباشرة على موقعك، نظام تذاكر، رد على البريد، وهاتف داخلي مخصص. اتفاقية مستوى خدمة (SLA) واضحة: وقت الاستجابة الأول 15 دقيقة في ساعات العمل، 2 ساعة خارجها. تقرير أداء شهري مفصل.',
 'A professional support team handling your customers in Arabic or English. Multi-channel: live chat on your site, ticketing system, email replies, and a dedicated phone line. Clear SLA: first response in 15 minutes during business hours, 2 hours outside. Detailed monthly performance report.',
 8000, 35000, 'EGP', 30,
 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
 array['دردشة + تذاكر + بريد + هاتف','SLA: استجابة خلال 15 دقيقة','دعم بالعربية والإنجليزية','تقرير أداء شهري','قاعدة معرفة ذاتية للعملاء']::text[],
 array['Chat + tickets + email + phone','SLA: 15-minute first response','Arabic and English support','Monthly performance report','Self-service knowledge base']::text[],
 array['نظام دعم منشور ومتكامل','فريق متاح حسب SLA','قاعدة معرفة على موقعك','تقارير شهرية وجلسة مراجعة']::text[],
 array['Deployed support stack','SLA-bound team','Knowledge base on your site','Monthly reports and review session']::text[],
 10, true, false),

((select id from public.categories where slug = 'support-training'),
 'system-training', 'تدريب على استخدام الأنظمة', 'System Training',
 'ورش تدريب عملية — أونلاين أو حضوريًا — على لوحات التحكم، تطبيقات إدارة، وأدوات داخلية.',
 'Hands-on training workshops — online or onsite — on admin panels, management apps, and internal tools.',
 'برامج تدريب مخصصة لفريقك على الأنظمة التي يستخدمها يومياً: لوحات تحكم WordPress أو Shopify، CRM، أنظمة المخزون، أدوات Office 365 و Google Workspace، أو منتجاتك الداخلية. ورش 2-8 ساعات بمواد تدريبية مكتوبة وفيديوهات. اختبار قبول في نهاية كل ورشة.',
 'Custom training programs for the tools your team uses daily: WordPress or Shopify admin panels, CRM, inventory systems, Office 365 and Google Workspace, or your internal products. 2-8 hour workshops with written materials and videos. Acceptance assessment at the end of each session.',
 3000, 15000, 'EGP', 7,
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
 array['تدريب مخصص لاحتياج فريقك','أونلاين أو حضوري','مواد مكتوبة وفيديوهات','تطبيقات عملية مباشرة','اختبار قبول بنهاية الورشة']::text[],
 array['Custom training for your team needs','Online or onsite','Written materials and videos','Hands-on practical exercises','End-of-session assessment']::text[],
 array['مواد تدريبية مطبوعة ورقمية','تسجيل فيديو للورشة','شهادة اجتياز للمتدربين','جلسة متابعة بعد أسبوعين']::text[],
 array['Printed and digital materials','Session video recording','Completion certificates','Two-week follow-up session']::text[],
 20, true, false),

((select id from public.categories where slug = 'support-training'),
 'technical-docs', 'توثيق تقني', 'Technical Documentation',
 'أدلة استخدام، فيديوهات شرح، توثيق API — مكتبة كاملة تجيب أسئلة فريقك قبل أن يسأل.',
 'User guides, explainer videos, API docs — a library that answers your team questions before they ask.',
 'إنشاء مكتبة توثيق تقني احترافية لمنتجك أو نظامك الداخلي: أدلة مستخدم خطوة بخطوة بصور وشروحات، توثيق API بـ OpenAPI/Swagger مع أمثلة لكل endpoint، فيديوهات شرح قصيرة (3-5 دقائق) للميزات المعقدة، و FAQ ديناميكي. نستخدم منصات مثل GitBook، Notion، أو Docusaurus.',
 'A professional documentation library for your product or internal system: step-by-step illustrated user guides, OpenAPI/Swagger docs with examples per endpoint, short explainer videos (3-5 min) for complex features, and a dynamic FAQ. We use platforms like GitBook, Notion, or Docusaurus.',
 4000, 20000, 'EGP', 21,
 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
 array['أدلة مستخدم مصوّرة خطوة بخطوة','توثيق API بـ OpenAPI/Swagger','فيديوهات شرح قصيرة','FAQ ديناميكي قابل للبحث','منصة GitBook / Notion / Docusaurus']::text[],
 array['Illustrated step-by-step user guides','OpenAPI/Swagger API docs','Short explainer videos','Searchable dynamic FAQ','GitBook / Notion / Docusaurus platform']::text[],
 array['مكتبة توثيق منشورة','فيديوهات شرح كاملة','ملفات مفتوحة قابلة للتحديث','صلاحيات تحرير لفريقك']::text[],
 array['Published documentation library','Complete explainer videos','Editable source files','Edit access for your team']::text[],
 30, true, false),

((select id from public.categories where slug = 'support-training'),
 'periodic-maintenance', 'صيانة دورية للمواقع والتطبيقات', 'Periodic Maintenance',
 'تحديثات أمنية، نسخ احتياطي، فحص أداء شهري، وإصلاحات صغيرة — كل شيء يبقى يعمل دون أن تشغل بالك.',
 'Security updates, backups, monthly performance audits, and small fixes — everything keeps running, hands-off.',
 'عقد صيانة شهري لموقعك أو تطبيقك: تحديث الأطر والمكتبات (WordPress، Laravel، Node packages)، تطبيق ترقيعات الأمان، نسخ احتياطي يومي مع تجربة استرجاع شهرية، فحص أداء شامل، إصلاحات صغيرة (حتى 5 ساعات شهرياً)، وتقرير صحة شامل. تنبيه فوري لأي خلل.',
 'Monthly maintenance contract for your site or app: framework and library updates (WordPress, Laravel, Node packages), security patches, daily backups with monthly restore drill, full performance audit, small fixes (up to 5 hours/month), and comprehensive health report. Real-time issue alerts.',
 2500, 12000, 'EGP', 30,
 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1200&q=80',
 array['تحديث الأطر والمكتبات شهرياً','ترقيعات أمنية فورية','نسخ احتياطي يومي + تجربة استرجاع','حتى 5 ساعات إصلاحات صغيرة','تقرير صحة شهري']::text[],
 array['Monthly framework and library updates','Immediate security patches','Daily backups plus monthly restore drill','Up to 5 hours of small fixes','Monthly health report']::text[],
 array['عقد صيانة شهري نشط','تقارير صحة شهرية','سجل التحديثات والإصلاحات','اجتماع مراجعة ربع سنوي']::text[],
 array['Active monthly maintenance contract','Monthly health reports','Update and fix log','Quarterly review meeting']::text[],
 40, true, false),

-- ═══ TESTING (8 services across 3 sub-categories) ════════════════════════════

-- ── Functional Testing ──
((select id from public.categories where slug = 'testing-functional'),
 'ui-testing', 'اختبار واجهة المستخدم', 'UI/UX Testing',
 'نختبر كل عنصر مرئي وكل مسار نقر — لنتأكد أن عميلك يكمل المهمة بسلاسة بدون عوائق.',
 'We test every visual element and click path — ensuring your customer completes tasks smoothly.',
 'فحص دقيق لكل واجهة في تطبيقك: محاذاة العناصر، ألوان، خطوط، تجاوب على مقاسات شاشة مختلفة (موبايل، تابلت، ديسكتوب)، حالات الفراغ والخطأ والتحميل، وإمكانية الوصول (Accessibility). نسلّمك تقريراً مع لقطات شاشة لكل مشكلة، أولوية، وخطوات إصلاح.',
 'Detailed inspection of every screen: element alignment, colors, typography, responsiveness across mobile/tablet/desktop, empty/error/loading states, and accessibility. You receive a report with screenshots per issue, priority, and remediation steps.',
 3000, 12000, 'EGP', 7,
 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
 array['فحص محاذاة وألوان وخطوط','تجاوب على موبايل وتابلت وديسكتوب','حالات الفراغ والخطأ والتحميل','اختبار وصول WCAG','تقرير بلقطات شاشة وأولويات']::text[],
 array['Alignment, color, typography review','Responsive on mobile, tablet, desktop','Empty, error, loading states','WCAG accessibility checks','Screenshot report with priorities']::text[],
 array['تقرير شامل بكل المشاكل','لقطات شاشة لكل عيب','جدول أولويات إصلاح','إعادة اختبار بعد الإصلاح']::text[],
 array['Comprehensive findings report','Per-issue screenshots','Prioritized remediation list','Post-fix retesting']::text[],
 10, true, false),

((select id from public.categories where slug = 'testing-functional'),
 'business-logic-testing', 'اختبار الوظائف الأساسية', 'Business Logic Testing',
 'تنفيذ سيناريوهات الاستخدام من البداية للنهاية — تسجيل، شراء، استرداد، صلاحيات — نوثّق كل خطأ مهما صغر.',
 'End-to-end scenario execution — signup, purchase, refund, permissions — every bug documented.',
 'كتابة Test Cases شاملة لكل سيناريو رئيسي في نظامك (Happy Path + Edge Cases + Error Paths)، ثم تنفيذها يدوياً بدقة. نختبر تكاملاً بين الموديولات (مثلاً: شراء يخصم من المخزون ويرسل بريداً ويظهر في التقارير). كل bug يُسجّل في Jira أو نظامك مع خطوات إعادة الإنتاج.',
 'Complete Test Cases for every key scenario (Happy Path + Edge Cases + Error Paths), executed manually with care. We test integration across modules (e.g., a purchase deducts stock, sends an email, and appears in reports). Each bug logged in Jira or your system with reproduction steps.',
 5000, 20000, 'EGP', 14,
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
 array['Test Cases شاملة لكل سيناريو','اختبار Happy Path + Edge Cases','اختبار تكامل بين الموديولات','تسجيل bugs في Jira أو نظامك','تقرير تغطية الاختبار']::text[],
 array['Comprehensive Test Cases per scenario','Happy Path + Edge Cases coverage','Cross-module integration testing','Bug logging in Jira or your tracker','Test coverage report']::text[],
 array['مكتبة Test Cases جاهزة','قائمة bugs مرتّبة بالأولوية','تقرير تغطية الاختبار','إعادة اختبار بعد الإصلاح']::text[],
 array['Test-case library','Prioritized bug list','Coverage report','Post-fix retesting']::text[],
 20, true, false),

((select id from public.categories where slug = 'testing-functional'),
 'security-testing', 'اختبار الأمان', 'Security Testing',
 'محاكاة هجمات حقيقية على تطبيقك (Penetration Testing) لاكتشاف الثغرات قبل المهاجمين.',
 'Simulating real attacks (penetration testing) to find vulnerabilities before attackers do.',
 'اختبار اختراق شامل لتطبيقك من منظور مهاجم خارجي: محاولات SQL Injection، XSS، CSRF، تجاوز المصادقة، رفع ملفات خبيثة، استغلال APIs، وكسر صلاحيات الأدوار. نستخدم أدوات احترافية (Burp Suite، OWASP ZAP) مع اختبار يدوي عميق. التقرير يشمل دليل استغلال لكل ثغرة وخطوات الإصلاح.',
 'Full penetration test from an external attacker perspective: SQL Injection, XSS, CSRF, auth bypass, malicious file upload, API abuse, and role permission breaks. We use professional tools (Burp Suite, OWASP ZAP) combined with deep manual testing. Report includes exploit walkthrough per vulnerability and remediation steps.',
 8000, 35000, 'EGP', 14,
 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
 array['اختبار اختراق آلي ويدوي','محاولات OWASP Top 10 كاملة','اختبار APIs والصلاحيات','دليل استغلال لكل ثغرة','إعادة اختبار بعد الإصلاح']::text[],
 array['Automated and manual penetration tests','Full OWASP Top 10 coverage','API and authorization testing','Exploit walkthrough per vulnerability','Post-fix retesting']::text[],
 array['تقرير اختراق مفصل','دليل استغلال لكل ثغرة','خطة إصلاح بأولويات','شهادة أمان بعد الإصلاح']::text[],
 array['Detailed pentest report','Exploit guide per vulnerability','Prioritized remediation plan','Post-fix security certificate']::text[],
 30, true, false),

-- ── Non-Functional Testing ──
((select id from public.categories where slug = 'testing-non-functional'),
 'performance-load-testing', 'اختبار الأداء والسرعة', 'Performance and Load Testing',
 'نختبر تطبيقك تحت ضغط آلاف المستخدمين المتزامنين — لنعرف نقطة الانهيار قبل أن يكتشفها العميل.',
 'Stress-test your app under thousands of concurrent users — find the breaking point before customers do.',
 'محاكاة أحمال حقيقية باستخدام JMeter، k6، أو Locust: 100، 500، 1000، 5000 مستخدم متزامن. نقيس زمن استجابة كل API، استخدام الـ CPU والذاكرة، والعنق الزجاجي (bottlenecks). نُحدّد عتبة الانهيار، نقترح تحسينات (caching، indexing، CDN، autoscaling)، ونعيد الاختبار للتأكد من التحسن.',
 'Realistic load simulation with JMeter, k6, or Locust: 100, 500, 1000, 5000 concurrent users. We measure per-API latency, CPU and memory usage, and bottlenecks. We identify the breaking point, recommend optimizations (caching, indexing, CDN, autoscaling), and re-test to verify improvement.',
 6000, 25000, 'EGP', 10,
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
 array['محاكاة 100 إلى 5000 مستخدم متزامن','قياس زمن استجابة كل API','تحديد العنق الزجاجي (bottlenecks)','اقتراح تحسينات قابلة للتنفيذ','إعادة اختبار بعد التحسين']::text[],
 array['100 to 5000 concurrent user simulation','Per-API latency measurement','Bottleneck identification','Actionable optimization recommendations','Post-optimization retesting']::text[],
 array['تقرير أداء بالأرقام والرسوم','قائمة تحسينات بالأولوية','نتائج إعادة الاختبار','خطة المراقبة المستمرة']::text[],
 array['Performance report with charts','Prioritized optimization list','Retest results','Ongoing monitoring plan']::text[],
 10, true, false),

((select id from public.categories where slug = 'testing-non-functional'),
 'compatibility-testing', 'اختبار التوافق', 'Compatibility Testing',
 'نختبر على 30+ متصفح وجهاز — Chrome، Safari، iPhone، Samsung، Windows، Mac — لا أحد يتُرك خلف.',
 'Test across 30+ browsers and devices — Chrome, Safari, iPhone, Samsung, Windows, Mac — no one left behind.',
 'اختبار شامل لتطبيقك على مصفوفة كاملة من الأجهزة والمتصفحات: Chrome، Firefox، Safari، Edge بإصدارات حديثة وقديمة، على Windows، Mac، Linux، iOS (iPhone و iPad)، Android (Samsung، Xiaomi، Huawei). نستخدم BrowserStack و LambdaTest. تقرير بأي مشكلة على أي جهاز.',
 'Full app testing across a complete matrix of devices and browsers: Chrome, Firefox, Safari, Edge in current and older versions, on Windows, Mac, Linux, iOS (iPhone and iPad), Android (Samsung, Xiaomi, Huawei). Powered by BrowserStack and LambdaTest. Per-device report of every issue.',
 4000, 18000, 'EGP', 7,
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
 array['30+ متصفح و OS مجتمعة','إصدارات حديثة وقديمة','iPhone و iPad و Android بأنواعها','منصات BrowserStack و LambdaTest','تقرير لكل جهاز/متصفح']::text[],
 array['30+ browser and OS combinations','Modern and legacy versions','iPhone, iPad, and Android variants','BrowserStack and LambdaTest platforms','Per-device/browser report']::text[],
 array['تقرير توافق مفصل','لقطات شاشة من كل جهاز','مصفوفة الدعم النهائية','توصيات تحسين التوافق']::text[],
 array['Detailed compatibility report','Per-device screenshots','Final support matrix','Compatibility recommendations']::text[],
 20, true, false),

((select id from public.categories where slug = 'testing-non-functional'),
 'usability-testing', 'اختبار قابلية الاستخدام', 'Usability Testing',
 'نراقب مستخدمين حقيقيين وهم يستخدمون تطبيقك — كل تردد، كل ضغطة خطأ، كل لحظة ارتباك.',
 'Watch real users navigate your app — every hesitation, every misclick, every moment of confusion.',
 'تنظيم جلسات اختبار قابلية استخدام مع 5-8 مستخدمين من جمهورك المستهدف. نضع لهم مهام واقعية ("اشترِ منتج"، "احجز موعد")، نسجّل الشاشة والصوت، ونلاحظ كل تردد ونقطة ارتباك. نحلّل الجلسات بتقنية "Think Aloud"، ونسلّمك تقريراً بالنتائج وفيديوهات قصيرة للحظات الحرجة.',
 'Usability test sessions with 5-8 users from your target audience. We give them realistic tasks ("buy a product", "book an appointment"), record screen and audio, and note every hesitation and confusion point. We analyze with "Think Aloud" methodology and deliver a report with findings plus short clips of critical moments.',
 5000, 22000, 'EGP', 14,
 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
 array['5-8 مستخدمين من جمهورك','مهام واقعية محددة','تسجيل شاشة وصوت','تحليل Think Aloud','فيديوهات للحظات الحرجة']::text[],
 array['5-8 users from your audience','Realistic, defined tasks','Screen and audio recording','Think Aloud analysis','Clips of critical moments']::text[],
 array['تقرير قابلية استخدام مفصل','فيديوهات الجلسات','قائمة تحسينات بالأولوية','جلسة عرض ومناقشة']::text[],
 array['Detailed usability report','Session recordings','Prioritized improvements list','Presentation session']::text[],
 30, true, false),

-- ── Execution Method ──
((select id from public.categories where slug = 'testing-execution'),
 'manual-testing', 'اختبار يدوي', 'Manual Testing',
 'اختبار يدوي بعين بشرية للتفاصيل التي لا تكتشفها الآلة — تجربة، حدس، وذكاء سياقي.',
 'Hands-on testing with a human eye for nuance machines miss — experience, intuition, contextual smarts.',
 'فريق QA محترف يختبر تطبيقك يدوياً بمنهج Exploratory Testing + Test Cases منظّمة. اليد البشرية تكتشف ما لا تكتشفه الأتمتة: ارتباك مرئي، رسالة خطأ غير مفهومة، تردّد في تجربة المستخدم، ملاحظات مصممية. مناسب للمشاريع الجديدة، الإصدارات السنوية، أو التطبيقات ذات الواجهات المعقدة.',
 'A professional QA team testing manually with a mix of Exploratory Testing and structured Test Cases. Human hands catch what automation cannot: visual confusion, unclear error messages, UX hesitation, design notes. Ideal for new projects, annual releases, or apps with complex UIs.',
 4000, 18000, 'EGP', 10,
 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
 array['اختبار استكشافي + Test Cases','اكتشاف مشاكل UX دقيقة','ملاحظات مصممية ولغوية','يناسب الإصدارات الكبيرة','تقرير مفصل مع لقطات']::text[],
 array['Exploratory plus structured Test Cases','Subtle UX issue discovery','Design and copy feedback','Best for major releases','Detailed report with screenshots']::text[],
 array['تقرير اختبار شامل','قائمة bugs مرتّبة','ملاحظات تحسين تجربة المستخدم','إعادة اختبار بعد الإصلاح']::text[],
 array['Comprehensive test report','Sorted bug list','UX improvement notes','Post-fix retesting']::text[],
 10, true, false),

((select id from public.categories where slug = 'testing-execution'),
 'automated-testing', 'اختبار تلقائي', 'Automated Testing',
 'كتابة اختبارات Cypress، Playwright، أو Jest تعمل تلقائياً مع كل نسخة جديدة — جودة بدون انتظار.',
 'Cypress, Playwright, or Jest tests that run automatically on every build — quality at speed.',
 'بناء مكتبة اختبارات آلية لتطبيقك: Unit Tests للوحدات الحرجة (Jest)، Integration Tests للـ APIs (Supertest)، و End-to-End Tests للتدفقات الرئيسية (Cypress أو Playwright). دمج كامل مع CI/CD (GitHub Actions، GitLab CI) لتشغيل كل الاختبارات على كل Pull Request، ومنع نشر أي كود يكسر اختباراً.',
 'A complete automated test library: Unit Tests for critical units (Jest), Integration Tests for APIs (Supertest), and End-to-End Tests for major flows (Cypress or Playwright). Full CI/CD integration (GitHub Actions, GitLab CI) running every test on every Pull Request, blocking any code that breaks a test.',
 8000, 35000, 'EGP', 21,
 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
 array['Unit + Integration + E2E Tests','Cypress / Playwright / Jest','تكامل CI/CD كامل','تقرير تغطية الكود','تشغيل على كل Pull Request']::text[],
 array['Unit + Integration + E2E tests','Cypress / Playwright / Jest','Full CI/CD integration','Code-coverage report','Runs on every Pull Request']::text[],
 array['مكتبة اختبارات في الـ repo','إعدادات CI/CD جاهزة','تقرير تغطية الكود','تدريب للمطورين على التشغيل']::text[],
 array['Test library in the repo','Ready CI/CD setup','Code-coverage report','Developer training on usage']::text[],
 20, true, true)

on conflict (slug) do nothing;

-- ─── DONE ────────────────────────────────────────────────────────────────────
-- 7 root categories + 3 sub-categories + 37 services inserted (idempotent).


-- === 20260523000000_blog_extensions.sql ===
-- ============================================================================
-- Blog system extensions
-- ----------------------------------------------------------------------------
-- 1. Adds hierarchy (parent_id), image, description, and visibility to
--    blog_categories so the same UI/UX pattern used for service categories
--    applies here.
-- 2. Adds scheduling, media gallery, FAQs, featured flag, reading time,
--    and tags array to blog_posts. Introduces a new 'scheduled' post status.
-- 3. The public reading path treats `status = 'published'` OR
--    (`status = 'scheduled'` AND `scheduled_at <= now()`) so scheduled posts
--    appear automatically at their time without a cron.
-- ============================================================================

-- ── blog_categories: hierarchy, description, image, visibility ──────────────
alter table public.blog_categories
  add column if not exists parent_id uuid references public.blog_categories(id) on delete set null,
  add column if not exists description_ar text,
  add column if not exists description_en text,
  add column if not exists image_url text,
  add column if not exists is_visible boolean not null default true;

create index if not exists blog_categories_parent_idx on public.blog_categories(parent_id);

-- ── post_status enum: add 'scheduled' ────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'scheduled'
      and enumtypid = (select oid from pg_type where typname = 'post_status')
  ) then
    alter type public.post_status add value 'scheduled' after 'draft';
  end if;
end$$;

-- ── blog_posts: rich extensions ──────────────────────────────────────────────
alter table public.blog_posts
  add column if not exists scheduled_at timestamptz,
  add column if not exists is_featured boolean not null default false,
  add column if not exists reading_time_minutes int,
  add column if not exists tags text[] not null default '{}',
  add column if not exists media jsonb not null default '[]'::jsonb,
  add column if not exists faqs jsonb not null default '[]'::jsonb,
  add column if not exists seo_keywords_ar text,
  add column if not exists seo_keywords_en text;

create index if not exists blog_posts_scheduled_idx on public.blog_posts(scheduled_at);
create index if not exists blog_posts_featured_idx on public.blog_posts(is_featured);

-- Note on JSONB shapes the app expects:
--   media: Array<{ type: 'image' | 'video'; url: string; caption_ar?: string; caption_en?: string }>
--   faqs:  Array<{ question_ar: string; question_en: string; answer_ar: string; answer_en: string }>


-- === 20260523010000_seed_blog.sql ===
-- ============================================================================
-- Seed: blog categories (4 roots + 3 sub) + 5 rich Arabic articles.
-- Idempotent — uses ON CONFLICT (slug) DO NOTHING for posts and categories.
-- Run AFTER 20260523000000_blog_extensions.sql.
-- ============================================================================

-- ── BLOG CATEGORIES ──────────────────────────────────────────────────────────
insert into public.blog_categories
  (slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, is_visible, sort_order)
values
  ('development', null,
   'التطوير والبرمجة', 'Development',
   'مقالات تقنية عن بناء المواقع والتطبيقات وحلول البرمجة الحديثة.',
   'Technical articles on building websites, applications, and modern development.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
   true, 10),

  ('hosting-infra', null,
   'الاستضافة والبنية التحتية', 'Hosting & Infrastructure',
   'كل ما يخص الاستضافة، الخوادم، النطاقات، وإدارة البنية التحتية.',
   'Everything about hosting, servers, domains, and infrastructure management.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
   true, 20),

  ('marketing', null,
   'التسويق الرقمي', 'Digital Marketing',
   'خطط واستراتيجيات تسويقية وأدوات تساعدك على الوصول لعملائك المثاليين.',
   'Marketing strategies and tools to reach your ideal customers.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
   true, 30),

  ('ecommerce', null,
   'المتاجر الإلكترونية', 'E-commerce',
   'دروس وأفكار لبناء وإدارة متاجر إلكترونية ناجحة.',
   'Lessons and ideas for building and managing successful online stores.',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
   true, 40),

  ('seo', (select id from public.blog_categories where slug = 'marketing'),
   'تحسين محركات البحث (SEO)', 'SEO',
   'تقنيات وممارسات لتظهر علامتك في النتائج الأولى لجوجل.',
   'Techniques and best practices to rank in Google search results.',
   'https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&w=600&q=80',
   true, 10),

  ('competitor-analysis', (select id from public.blog_categories where slug = 'marketing'),
   'تحليل المنافسين', 'Competitor Analysis',
   'كيف تكشف ما يفعله منافسوك وتستفيد منه لتسبقهم.',
   'How to uncover what competitors do and use it to get ahead.',
   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
   true, 20),

  ('platforms-comparison', (select id from public.blog_categories where slug = 'ecommerce'),
   'مقارنة المنصات', 'Platform Comparisons',
   'مقارنات معمقة بين منصات التجارة الإلكترونية المختلفة.',
   'In-depth comparisons of e-commerce platforms.',
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
   true, 10)
on conflict (slug) do nothing;

-- ── BLOG POSTS ───────────────────────────────────────────────────────────────

-- 1) كيفية إنشاء موقع إلكتروني متكامل ───────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('how-to-build-complete-website',
   'كيفية إنشاء موقع إلكتروني متكامل: دليل شامل من الصفر للنشر',
   'How to Build a Complete Website: From Zero to Production',
   'دليل عملي خطوة بخطوة لبناء موقع إلكتروني احترافي يخدم أهدافك التجارية — من تحديد المتطلبات وحتى النشر والتسويق.',
   'A step-by-step practical guide to building a professional website that serves your business goals — from requirements to launch.',
   E'# كيفية إنشاء موقع إلكتروني متكامل\n\nبناء موقع إلكتروني ليس مجرد كتابة كود وتصميم صفحات — إنه عملية متكاملة تبدأ بفهم احتياجك التجاري وتنتهي بمنتج رقمي يحقق أهدافك. في هذا الدليل، نمر بكل مرحلة بالتفصيل.\n\n## 1. تحديد الهدف والمتطلبات\n\nقبل أي خط كود، اسأل نفسك:\n\n- **ما الغرض من الموقع؟** (تعريفي، متجر، حجوزات، تطبيق ويب، مدونة)\n- **من هو الجمهور المستهدف؟** (عمر، لغة، مستوى تقني، جهاز الاستخدام)\n- **ما هي الإجراءات الأساسية التي يجب أن يقوم بها الزائر؟** (الشراء، الاشتراك، التواصل، حجز موعد)\n- **ما الميزانية والمدة المتاحة؟**\n\n> نصيحة: اكتب 3-5 سيناريوهات استخدام واقعية. هذه السيناريوهات ستوجه كل قرار تصميمي وبرمجي لاحقاً.\n\n## 2. اختيار التقنية المناسبة\n\nالتقنية تختلف حسب نوع الموقع:\n\n| نوع الموقع | التقنية الموصى بها |\n| --- | --- |\n| موقع تعريفي بسيط | WordPress أو Webflow |\n| موقع شركة احترافي | Next.js + Tailwind CSS |\n| متجر إلكتروني | Shopify أو WooCommerce |\n| تطبيق ويب معقد | Next.js + Supabase / Firebase |\n| مدونة محتوى | Next.js + MDX أو Astro |\n\n### لماذا Next.js؟\n\n- **أداء عالي**: تحميل سريع جداً عبر تقنية SSG/SSR\n- **SEO ممتاز**: محركات البحث تقرأ المحتوى بسهولة\n- **مرونة**: يصلح للمواقع البسيطة والمعقدة\n- **دعم لغوي**: يدعم اللغة العربية وRTL بشكل أصلي\n\n## 3. تصميم تجربة المستخدم (UX)\n\nالخطأ الشائع: البدء بالتصميم البصري (UI) قبل تجربة المستخدم (UX). الترتيب الصحيح:\n\n1. **خرائط المستخدم (User Flows)**: ارسم كيف ينتقل الزائر من نقطة الدخول حتى الهدف.\n2. **Wireframes**: رسومات بسيطة بدون ألوان لتحديد بنية كل صفحة.\n3. **النموذج الأولي (Prototype)**: ربط الـ wireframes ببعضها في Figma لاختبار التدفق.\n4. **التصميم النهائي (UI)**: تطبيق نظام تصميم موحد بالألوان والخطوط والأيقونات.\n\n## 4. التطوير: Frontend و Backend\n\n### الواجهة الأمامية (Frontend)\n\n- اختر إطار عمل حديث (Next.js / React)\n- استخدم نظام تصميم (Tailwind CSS / shadcn/ui)\n- اعتمد مكونات قابلة لإعادة الاستخدام\n- اكتب الكود بطريقة منظمة وموثقة\n\n### الخلفية (Backend)\n\n- اختر قاعدة بيانات مناسبة (PostgreSQL لمعظم الحالات)\n- صمم الـ API بمعيار REST أو GraphQL\n- اهتم بالأمان (تشفير، صلاحيات، حماية من SQL Injection)\n- وثّق كل endpoint بـ OpenAPI/Swagger\n\n## 5. الاختبار قبل النشر\n\nلا تنشر موقعك قبل الاختبار على:\n\n- **متصفحات متعددة**: Chrome, Safari, Firefox, Edge\n- **أجهزة مختلفة**: موبايل، تابلت، ديسكتوب بأحجام متعددة\n- **سرعات إنترنت متفاوتة**: استخدم Chrome DevTools لمحاكاة 3G\n- **حالات الأخطاء**: ماذا يحدث لو فقد المستخدم الاتصال؟ لو ضغط بسرعة مزدوجة؟\n\n## 6. النشر (Deployment)\n\nأفضل خيارات الاستضافة في 2026:\n\n- **Vercel**: الأفضل لـ Next.js (نشر تلقائي من GitHub)\n- **Netlify**: ممتاز للمواقع الثابتة\n- **AWS / DigitalOcean**: للمشاريع الكبيرة التي تحتاج تحكماً كاملاً\n- **استضافة محلية**: cPanel على خوادم مصرية لتقليل زمن الاستجابة لجمهورك المحلي\n\n## 7. ما بعد النشر\n\nالموقع ليس مشروعاً ينتهي عند النشر. يحتاج:\n\n- **مراقبة مستمرة**: تتبع الأخطاء (Sentry)، الأداء (Google Analytics)، التحويلات\n- **تحديثات أمنية**: تحديث المكتبات شهرياً على الأقل\n- **نسخ احتياطي**: يومي على الأقل، مع تجربة استرجاع شهرية\n- **تحسين SEO مستمر**: مراقبة الترتيب، تحديث المحتوى، بناء روابط خلفية\n\n## خلاصة\n\nبناء موقع إلكتروني ناجح يتطلب تخطيطاً جيداً، اختيار تقنية مناسبة، تصميم تجربة مستخدم محكمة، تطوير نظيف، واختباراً شاملاً قبل النشر. لا تتسرع — استثمر الوقت في كل مرحلة وستحصل على نتيجة يفخر بها فريقك ويحبها جمهورك.',
   E'# How to Build a Complete Website\n\nBuilding a website is more than writing code — it is a full process from understanding business goals to launching a product that delivers results. This guide walks through every stage.\n\n## 1. Define goals and requirements\n\nBefore any line of code, ask:\n\n- What is the purpose? (brochure, store, booking, web app, blog)\n- Who is the audience? (age, language, technical level, device)\n- What core actions should visitors take?\n- What is the budget and timeline?\n\n## 2. Choose the right stack\n\n| Site type | Recommended stack |\n| --- | --- |\n| Simple brochure | WordPress or Webflow |\n| Corporate site | Next.js + Tailwind CSS |\n| Online store | Shopify or WooCommerce |\n| Complex web app | Next.js + Supabase / Firebase |\n| Content blog | Next.js + MDX or Astro |\n\n## 3. UX before UI\n\nStart with user flows, then wireframes, then interactive prototype, only then visual design.\n\n## 4. Development\n\nFrontend: modern framework + design system + reusable components. Backend: PostgreSQL + REST/GraphQL API + strong security + documented endpoints.\n\n## 5. Testing\n\nTest across browsers, devices, network speeds, and error states before launch.\n\n## 6. Deployment\n\nVercel for Next.js, Netlify for static, AWS/DO for large projects, local cPanel for regional audiences.\n\n## 7. Beyond launch\n\nMonitoring, security patches, daily backups, ongoing SEO. The site is never "done".',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '30 days', true,
   12,
   array['تطوير المواقع','Next.js','UX','نشر','SEO']::text[],
   '[
     {"question_ar":"كم تكلفة بناء موقع إلكتروني متكامل؟","question_en":"How much does a complete website cost?","answer_ar":"التكلفة تختلف حسب التعقيد: موقع تعريفي بسيط (5,000-15,000 جنيه)، موقع شركة احترافي (15,000-50,000)، تطبيق ويب متقدم (50,000-200,000+).","answer_en":"It varies: brochure site ($300-1,000), pro corporate site ($1,000-3,000), advanced web app ($3,000-15,000+)."},
     {"question_ar":"كم تستغرق المدة لبناء موقع؟","question_en":"How long does it take?","answer_ar":"موقع تعريفي بسيط: 2-3 أسابيع. موقع شركة: 4-6 أسابيع. تطبيق ويب: 2-6 أشهر حسب التعقيد.","answer_en":"Simple brochure: 2-3 weeks. Corporate site: 4-6 weeks. Web app: 2-6 months depending on complexity."},
     {"question_ar":"هل أحتاج لمبرمج خاص بي بعد التسليم؟","question_en":"Do I need a developer after launch?","answer_ar":"للمواقع البسيطة: لا، عقد صيانة شهري يكفي. للتطبيقات المعقدة: نعم، تحتاج فريق تطوير مستمر.","answer_en":"For simple sites: no, monthly maintenance suffices. For complex apps: yes, you need ongoing development."},
     {"question_ar":"ما الفرق بين WordPress و Next.js؟","question_en":"WordPress vs Next.js?","answer_ar":"WordPress أسهل وأسرع للبدء لكن أبطأ أداءً وأقل مرونة. Next.js يحتاج مبرمجاً لكن يعطي أداءً أعلى وتجربة أفضل ومرونة كاملة.","answer_en":"WordPress is easier to start but slower and less flexible. Next.js needs a developer but delivers higher performance and full flexibility."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80","caption_ar":"محرر الكود — حيث تبدأ القصة","caption_en":"The code editor — where the story begins"}
   ]'::jsonb,
   'دليل شامل لإنشاء موقع إلكتروني متكامل من الصفر',
   'Complete Guide: Build a Website from Zero to Launch',
   'تعلم خطوة بخطوة كيف تبني موقعاً احترافياً يخدم أهدافك التجارية — من تحديد المتطلبات وحتى النشر والصيانة.',
   'Step-by-step guide to building a professional website — from requirements to launch and maintenance.',
   'تطوير المواقع، Next.js، تصميم UX، استضافة، SEO، موقع متكامل',
   'web development, Next.js, UX design, hosting, SEO, complete website')
on conflict (slug) do nothing;

-- 2) خطوات استضافة موقع إلكتروني على cPanel ─────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('host-website-on-cpanel',
   'خطوات استضافة موقع إلكتروني على cPanel: من الحجز حتى النشر',
   'Hosting Your Website on cPanel: From Account Setup to Launch',
   'دليل عملي مفصّل لاستضافة موقعك على cPanel — رفع الملفات، ربط النطاق، إعداد SSL، وقواعد البيانات، خطوة بخطوة بالصور.',
   'A practical step-by-step guide to hosting your site on cPanel — file upload, domain pointing, SSL, and database setup.',
   E'# خطوات استضافة موقع إلكتروني على cPanel\n\ncPanel هي اللوحة الأشهر لإدارة الاستضافة المشتركة. واجهتها بسيطة لكنها قوية، وتتيح لك إدارة كل شيء من رفع الملفات إلى قواعد البيانات. في هذا الدليل، سنمر بكل خطوة.\n\n## 1. حجز حساب استضافة\n\nاختر مقدم استضافة موثوق. عوامل مهمة:\n\n- **مكان الخادم**: اختر خادماً قريباً من جمهورك (مصر، السعودية، أوروبا حسب الحاجة)\n- **المساحة والباندويث**: للمواقع الصغيرة 10GB كافية، للمتاجر 30GB+\n- **دعم PHP و MySQL**: تأكد من الإصدارات الحديثة (PHP 8.2+، MySQL 8+)\n- **SSL مجاني**: شهادة Let''s Encrypt أساسية اليوم\n- **النسخ الاحتياطي**: يومي مع إمكانية الاسترجاع الذاتي\n\n## 2. الدخول لـ cPanel\n\nبعد التفعيل، ستستقبل بريداً يحوي:\n\n- **رابط cPanel**: عادةً `https://yourdomain.com:2083` أو `https://server.host.com/cpanel`\n- **اسم المستخدم وكلمة المرور**\n\nقم بتسجيل الدخول. ستظهر واجهة cPanel مقسمة لأقسام: الملفات، قواعد البيانات، النطاقات، البريد، الإحصائيات، الأمان.\n\n> نصيحة أمنية: غيّر كلمة المرور فوراً، وفعّل المصادقة الثنائية (2FA) من قسم Security.\n\n## 3. رفع ملفات الموقع\n\nهناك ثلاث طرق:\n\n### الطريقة 1: File Manager (الأسهل)\n\n1. افتح "File Manager" من قسم الملفات\n2. اذهب لمجلد `public_html`\n3. اضغط Upload وارفع ملفات موقعك\n4. لو رفعت ملف zip، اضغط عليه بزر الفأرة الأيمن واختر Extract\n\n### الطريقة 2: FTP (للملفات الكبيرة)\n\n1. أنشئ حساب FTP من قسم Files → FTP Accounts\n2. حمّل برنامج FileZilla\n3. اتصل بالخادم باستخدام بيانات FTP\n4. اسحب ملفاتك للمجلد `public_html`\n\n### الطريقة 3: Git (للمطورين)\n\nمن قسم Files → Git Version Control يمكنك ربط مستودع GitHub والنشر بأمر `git pull`.\n\n## 4. ربط النطاق (Domain)\n\nلو حجزت النطاق من نفس شركة الاستضافة، يكون مربوطاً تلقائياً. لو من مكان آخر:\n\n1. اذهب لإعدادات النطاق عند المسجّل (Namecheap, GoDaddy, ...)\n2. غيّر Name Servers إلى المقدمة من شركة الاستضافة:\n   - `ns1.yourhost.com`\n   - `ns2.yourhost.com`\n3. انتظر 24-48 ساعة للانتشار العالمي (DNS Propagation)\n\n## 5. تثبيت شهادة SSL\n\nSSL ضروري اليوم — Google يخفض ترتيب المواقع بدونها.\n\n1. اذهب لـ Security → SSL/TLS Status\n2. اضغط Run AutoSSL\n3. اختر النطاقات التي تريد تأمينها\n4. بعد دقائق، ستظهر علامة القفل الأخضر في المتصفح\n\nأو من Let''s Encrypt SSL إن كان متاحاً.\n\n## 6. إنشاء قاعدة بيانات\n\nلو موقعك يحتاج قاعدة بيانات (مثل WordPress أو Laravel):\n\n1. اذهب لـ Databases → MySQL Databases\n2. أنشئ قاعدة بيانات جديدة (مثلاً `mysite_db`)\n3. أنشئ مستخدماً للقاعدة (`mysite_user`) بكلمة مرور قوية\n4. اربط المستخدم بالقاعدة بصلاحيات `ALL PRIVILEGES`\n5. احفظ بيانات الاتصال في ملف إعدادات موقعك:\n   ```php\n   DB_HOST = "localhost";\n   DB_NAME = "mysite_db";\n   DB_USER = "mysite_user";\n   DB_PASS = "your-strong-password";\n   ```\n\n## 7. إعداد البريد الإلكتروني\n\nمن قسم Email → Email Accounts، أنشئ بريداً احترافياً (`info@yourdomain.com`):\n\n1. اختر النطاق\n2. حدد اسم البريد والمساحة المخصصة\n3. ضع كلمة مرور قوية\n\nيمكنك ربطه بـ Outlook أو Gmail باستخدام إعدادات IMAP/SMTP من قسم Email Configuration.\n\n## 8. اختبار الموقع\n\nقبل إعلان الإطلاق:\n\n- افتح الموقع في متصفح خفي (Incognito) لتجاوز الكاش\n- اختبر الصور والروابط والنماذج\n- جرّب الشراء أو التسجيل من البداية للنهاية\n- شغّل [PageSpeed Insights](https://pagespeed.web.dev/) لقياس الأداء\n\n## 9. إعداد النسخ الاحتياطي\n\n- اذهب لـ Files → Backup Wizard\n- اضغط Back Up\n- اختر Full Backup أو Home Directory\n- احتفظ بنسخة محلية لديك إضافة للنسخة على الخادم\n\nاجعلها عادة شهرية على الأقل.\n\n## أخطاء شائعة وحلولها\n\n| المشكلة | الحل |\n| --- | --- |\n| الموقع لا يظهر بعد ربط النطاق | انتظر 24-48 ساعة لانتشار DNS |\n| رسالة 403 Forbidden | تأكد أن الصلاحيات 755 للمجلدات و 644 للملفات |\n| خطأ في الاتصال بقاعدة البيانات | راجع بيانات الاتصال في ملف الإعدادات |\n| الموقع بطيء | ابحث عن Optimize Website في cPanel وفعّل ضغط Gzip |\n\n## خلاصة\n\ncPanel أداة ممتازة للمبتدئين والمحترفين. مع الخطوات أعلاه، يمكنك استضافة أي موقع HTML، WordPress، Laravel، أو حتى Node.js (مع وجود Node.js Selector). المفتاح هو الترتيب والاهتمام بالتفاصيل الأمنية.',
   E'# Hosting on cPanel: Step by Step\n\ncPanel is the most popular shared-hosting control panel. This guide covers every step.\n\n## 1. Pick a hosting account\n\nServer location, storage, PHP/MySQL versions, free SSL, and daily backups are the key criteria.\n\n## 2. Log in to cPanel\n\nUsually `https://yourdomain.com:2083`. Change password immediately and enable 2FA.\n\n## 3. Upload files\n\nThree options: File Manager (easiest), FTP via FileZilla (for big files), or Git Version Control (for developers).\n\n## 4. Point your domain\n\nUpdate name servers at your registrar to the ones provided by the host. DNS propagation takes 24-48 hours.\n\n## 5. Install SSL\n\nFrom Security → SSL/TLS Status, run AutoSSL. Within minutes you get the green padlock.\n\n## 6. Create a database\n\nMySQL Databases section: create database, create user, link them with full privileges, save credentials in your app config.\n\n## 7. Email setup\n\nCreate professional email at info@yourdomain.com, connect via IMAP/SMTP to Outlook or Gmail.\n\n## 8. Test before launch\n\nIncognito mode bypass cache, run PageSpeed Insights, test forms end-to-end.\n\n## 9. Backups\n\nBackup Wizard for Full Backup. Keep a local copy too. Monthly minimum.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '22 days', false,
   10,
   array['cPanel','استضافة','SSL','نطاقات','MySQL','نشر']::text[],
   '[
     {"question_ar":"هل cPanel آمن بشكل افتراضي؟","question_en":"Is cPanel secure by default?","answer_ar":"cPanel آمن نسبياً لكن يجب تفعيل 2FA، استخدام كلمات مرور قوية، وتحديث PHP والمكتبات بانتظام.","answer_en":"Reasonably secure, but enable 2FA, use strong passwords, and keep PHP and libraries updated."},
     {"question_ar":"كم تكلفة استضافة cPanel شهرياً؟","question_en":"How much does cPanel hosting cost monthly?","answer_ar":"الاستضافة المشتركة تبدأ من 100-200 جنيه شهرياً للمواقع الصغيرة، وتصل لـ 1000+ جنيه للمواقع الكبيرة على VPS مع cPanel.","answer_en":"Shared hosting starts at $5-15/month for small sites, up to $50+/month for VPS with cPanel."},
     {"question_ar":"هل يمكن تشغيل Next.js على cPanel؟","question_en":"Can I run Next.js on cPanel?","answer_ar":"نعم، إذا كان لدى المضيف Node.js Selector. لكن Vercel أو Netlify خيار أفضل وأبسط لتطبيقات Next.js.","answer_en":"Yes if the host offers Node.js Selector. But Vercel or Netlify are easier choices for Next.js."}
   ]'::jsonb,
   '[]'::jsonb,
   'استضافة موقع على cPanel: الدليل الكامل بالخطوات',
   'cPanel Hosting Guide: Complete Step-by-Step Tutorial',
   'تعلم رفع موقعك على cPanel، ربط النطاق، تركيب SSL، وإنشاء قاعدة البيانات بسهولة.',
   'Learn to upload your site to cPanel, point your domain, install SSL, and create databases easily.',
   'cPanel، استضافة، رفع موقع، SSL، نطاق، MySQL، استضافة مشتركة',
   'cPanel, hosting, file upload, SSL, domain pointing, MySQL, shared hosting')
on conflict (slug) do nothing;

-- 3) خطة تسويقية متكاملة ────────────────────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('integrated-marketing-plan',
   'خطة تسويقية متكاملة: من تحليل السوق إلى قياس النتائج',
   'Building an Integrated Marketing Plan: From Market Analysis to Measuring Results',
   'كيف تبني خطة تسويق رقمية متكاملة تجمع SEO والإعلانات المدفوعة والمحتوى والبريد لتحقق نتائج قابلة للقياس بدلاً من تشتيت ميزانيتك.',
   'How to build an integrated digital marketing plan that combines SEO, paid ads, content, and email to deliver measurable results instead of wasting budget.',
   E'# خطة تسويقية متكاملة\n\nمعظم الشركات تتعامل مع التسويق كأنشطة منفصلة: إعلان فيسبوك هنا، SEO هناك، نشرة بريد متى تذكروا. النتيجة: ميزانية مهدورة ورسالة مشتتة. الخطة المتكاملة تربط كل القنوات برسالة واحدة وأهداف واضحة.\n\n## 1. تحليل الوضع الحالي (Situation Analysis)\n\nقبل أي تخطيط، اعرف أين تقف:\n\n### تحليل SWOT\n\n- **Strengths**: ما الذي تتفوق فيه؟ (جودة، سعر، خدمة عملاء، خبرة)\n- **Weaknesses**: أين تحتاج للتحسن؟\n- **Opportunities**: ما الفرص في السوق؟ (طلب متزايد، منافس ضعيف، تقنية جديدة)\n- **Threats**: ما المخاطر؟ (منافسين جدد، تغيرات تشريعية، اقتصاد)\n\n### تحليل الجمهور\n\nأنشئ Buyer Personas تفصيلية:\n\n- **الديموغرافيا**: عمر، جنس، موقع، دخل، تعليم\n- **السلوك**: ما يستخدم من منصات؟ متى يكون أكثر نشاطاً؟\n- **الاحتياجات**: ما المشكلة التي تحلّها له؟\n- **الاعتراضات**: لماذا قد يرفض الشراء؟\n\n## 2. تحديد الأهداف الذكية (SMART Goals)\n\nأهداف مبهمة تنتج نتائج مبهمة. استخدم نموذج SMART:\n\n- **S**pecific (محدد)\n- **M**easurable (قابل للقياس)\n- **A**chievable (قابل للتحقيق)\n- **R**elevant (ذو صلة بالعمل)\n- **T**ime-bound (مرتبط بزمن)\n\n**مثال خاطئ**: "زيادة المبيعات".\n**مثال صحيح**: "زيادة مبيعات المتجر الإلكتروني بنسبة 30% خلال 6 أشهر، من 100 طلب شهرياً إلى 130 طلباً، بتكلفة استحواذ لا تتجاوز 50 جنيهاً للعميل".\n\n## 3. اختيار المزيج التسويقي\n\nالقنوات الرئيسية وما يناسب كل واحدة:\n\n| القناة | الأنسب لـ | المدة لظهور النتائج |\n| --- | --- | --- |\n| **SEO** | بناء أساس طويل المدى | 6-12 شهر |\n| **Google Ads** | نتائج فورية لكلمات شراء | يوم 1 |\n| **Meta Ads** | الوصول والتوعية | يوم 1 |\n| **محتوى المدونة** | بناء سلطة وثقة | 3-6 أشهر |\n| **بريد إلكتروني** | الاحتفاظ بالعملاء | 1-2 أسبوع |\n| **شراكات Influencer** | الوصول الجماهيري السريع | 2-4 أسابيع |\n\n> القاعدة الذهبية: لا تضع كل الميزانية في قناة واحدة. توزيع 60/30/10 (قناة رئيسية / ثانية / تجارب) قاعدة جيدة للبدء.\n\n## 4. بناء الرسالة الموحدة\n\nمهما اختلفت القنوات، يجب أن تظل **القصة واحدة**:\n\n- **اقتراح القيمة الفريد (UVP)**: جملة واحدة تجيب "لماذا أشتري منك تحديداً؟"\n- **النبرة (Tone)**: رسمية أم مرحة؟ خبير أم صديق؟\n- **الكلمات المفتاحية للعلامة**: 5-7 كلمات تتكرر في كل المحتوى\n- **الهوية البصرية**: ألوان، خطوط، أيقونات متسقة في كل مكان\n\n## 5. خطة المحتوى\n\nالمحتوى وقود كل القنوات. لكل قناة شكلها:\n\n- **مدونة**: مقالات تعليمية طويلة (1500+ كلمة) — للـ SEO\n- **Instagram**: صور وReels قصيرة — للتفاعل\n- **LinkedIn**: مقالات قيادة فكرية — للـ B2B\n- **TikTok**: فيديوهات ترفيهية تعليمية — للجيل الجديد\n- **بريد إلكتروني**: نشرات قيمة + عروض حصرية\n\nتقويم محتوى شهري يحدد كل قطعة محتوى ومسؤولها وتاريخ نشرها.\n\n## 6. الميزانية والتخصيص\n\nتوزيع ميزانية شهرية كنموذج (لشركة ناشئة بميزانية 50,000 جنيه/شهر):\n\n- **40% (20,000)** — إعلانات مدفوعة (Meta + Google)\n- **20% (10,000)** — إنتاج محتوى (تصوير، مونتاج، كتابة)\n- **15% (7,500)** — SEO وبناء روابط\n- **10% (5,000)** — أدوات (Mailchimp, SEMrush, تصميم)\n- **10% (5,000)** — فريق إدارة\n- **5% (2,500)** — تجارب جديدة (TikTok ads, Influencers)\n\n## 7. التنفيذ والقياس\n\nأهم مؤشرات الأداء (KPIs) لكل قناة:\n\n- **SEO**: ترتيب الكلمات، الزيارات العضوية، معدل الارتداد\n- **Paid Ads**: CPC، CPA، CTR، ROAS\n- **Email**: معدل الفتح، النقر، الإلغاء\n- **Social**: التفاعل، الوصول، النمو\n- **العام**: عدد العملاء الجدد، LTV، CAC\n\n> القاعدة الحديدية: ما لا يُقاس لا يتحسن. أعد قراءة الأرقام كل أسبوع، وعدّل التكتيكات كل شهر.\n\n## 8. التحسين المستمر\n\nالخطة وثيقة حية. مراجعة شهرية تجيب:\n\n- ما الذي نجح فوق المتوقع؟ ضاعفه\n- ما الذي فشل؟ أوقفه أو حسّنه\n- ما الفرصة الجديدة؟ جرّبها بميزانية صغيرة\n\n## خلاصة\n\nالخطة المتكاملة ليست شعاراً تسويقياً — هي ضرورة. عدد القنوات يتزايد، انتباه العميل يتقلص، ومن لا يخطط بشكل متكامل يخسر معركة الانتباه. ابدأ بتحليل دقيق، ضع أهدافاً واضحة، وزّع الميزانية بحكمة، وقس كل شيء.',
   E'# Integrated Marketing Plan\n\nMost companies treat marketing as isolated activities. The result: wasted budget and a fragmented message. An integrated plan ties every channel to one message and clear goals.\n\n## 1. Situation analysis\n\nSWOT + audience analysis with detailed buyer personas.\n\n## 2. SMART goals\n\nSpecific, measurable, achievable, relevant, time-bound.\n\n## 3. Channel mix\n\nSEO for long-term, Google Ads for instant intent, Meta for awareness, content for authority, email for retention.\n\n## 4. Unified message\n\nOne UVP, consistent tone, brand keywords, visual identity across channels.\n\n## 5. Content plan\n\nBlog (long SEO articles), Instagram (Reels), LinkedIn (B2B thought leadership), TikTok (educational entertainment), email (newsletters).\n\n## 6. Budget allocation\n\nSample 40/20/15/10/10/5 split: paid / content / SEO / tools / team / experiments.\n\n## 7. Execute and measure\n\nKPIs per channel — SEO rankings, CPA/ROAS, open rates, engagement, new customers, LTV/CAC.\n\n## 8. Continuous optimization\n\nMonthly review: double what works, kill what does not, test new opportunities.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '14 days', true,
   14,
   array['تسويق','SEO','إعلانات','محتوى','بريد إلكتروني','استراتيجية']::text[],
   '[
     {"question_ar":"كم ميزانية تكفي للبدء؟","question_en":"What budget is enough to start?","answer_ar":"للشركات الصغيرة: 10,000-30,000 جنيه شهرياً للحملات الأساسية. للشركات المتوسطة: 50,000-150,000 جنيه. الأهم هو الاتساق وليس المبلغ.","answer_en":"For small businesses: $500-1,500/month. For mid-size: $2,500-7,500. Consistency matters more than amount."},
     {"question_ar":"متى أتوقع رؤية نتائج؟","question_en":"When can I expect results?","answer_ar":"الإعلانات المدفوعة: أيام. البريد: أسبوع. السوشيال: شهر. SEO: 6-12 شهر. الخطة المتكاملة تخلط القنوات السريعة والبطيئة لتغطي كل الأمدية.","answer_en":"Paid ads: days. Email: a week. Social: a month. SEO: 6-12 months. Integration mixes fast and slow channels."},
     {"question_ar":"هل أحتاج وكالة أم فريق داخلي؟","question_en":"Agency or in-house team?","answer_ar":"الوكالة أسرع وأرخص للبدء. الفريق الداخلي أفضل بعد سنة من النضج. كثيرون يجمعون بين الاثنين: وكالة للحملات + موظف داخلي للتنسيق.","answer_en":"Agency is faster and cheaper to start. In-house works better after a year of maturity. Many combine both."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80","caption_ar":"لوحة بيانات الأداء — قلب الخطة المتكاملة","caption_en":"Performance dashboard — the heart of an integrated plan"}
   ]'::jsonb,
   'كيف تبني خطة تسويقية متكاملة تحقق نتائج فعلية',
   'How to Build an Integrated Marketing Plan That Drives Real Results',
   'دليل عملي لإنشاء استراتيجية تسويق رقمي متكاملة — تحليل، أهداف، قنوات، ميزانية، وقياس.',
   'A practical guide to building an integrated digital marketing strategy — analysis, goals, channels, budget, and measurement.',
   'خطة تسويق، تسويق رقمي، استراتيجية، SEO، إعلانات، محتوى، KPIs',
   'marketing plan, digital marketing, strategy, SEO, ads, content, KPIs')
on conflict (slug) do nothing;

-- 4) تحليل المنافسين والكلمات المفتاحية ─────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('competitor-keyword-analysis-guide',
   'تحليل المنافسين والكلمات المفتاحية: كيف تكشف استراتيجيتهم في 7 خطوات',
   'Competitor and Keyword Analysis: Uncover Their Strategy in 7 Steps',
   'دليل تطبيقي لتحليل منافسيك واكتشاف الكلمات المفتاحية التي تجلب لهم الزوار — بأدوات مجانية ومدفوعة، خطوة بخطوة.',
   'A hands-on guide to analyzing competitors and discovering the keywords driving their traffic — using free and paid tools.',
   E'# تحليل المنافسين والكلمات المفتاحية\n\nالكثير يبدأ التسويق الرقمي بحماس لكن دون فهم للمنافسة. النتيجة: تكرار أخطائهم بدلاً من السبق بمعرفة. في هذا الدليل، نمر بطريقة منهجية لتحليل أي منافس في 7 خطوات عملية.\n\n## الخطوة 1: تحديد المنافسين الحقيقيين\n\nلديك ثلاث فئات من المنافسين:\n\n### 1. منافسون مباشرون\n\nنفس الخدمة، نفس الجمهور، نفس السعر. مثلاً لو أنت متجر أحذية رياضية: متاجر أخرى تبيع نفس الماركات في نفس البلد.\n\n### 2. منافسون غير مباشرون\n\nيحلون نفس المشكلة بحل مختلف. مثلاً: متجر اشتراك شهري للأحذية، أو خدمة استئجار.\n\n### 3. منافسون على الكلمات\n\nليسوا منافسين تجاريين لكن يتربعون على نتائج البحث لكلماتك. مثلاً: مدونة تعليمية تظهر قبل متجرك في كلمة "أفضل أحذية رياضية".\n\n> **عملي**: ابحث في Google عن أهم 10 كلمات بيع لديك، وسجّل أول 5 نتائج لكل كلمة. النتائج هي قائمة منافسيك الحقيقية.\n\n## الخطوة 2: تحليل موقع المنافس\n\nاستخدم هذه الأدوات على موقع كل منافس:\n\n- **[Built With](https://builtwith.com)**: التقنيات المستخدمة (CMS، التحليل، الدفع، الإعلانات)\n- **[Wayback Machine](https://web.archive.org)**: كيف تطور موقعهم عبر السنوات\n- **PageSpeed Insights**: سرعة موقعهم — هل أبطأ منك؟ نقطة قوة لك\n\nاجمع:\n\n- المنصة (Shopify, WooCommerce, custom?)\n- وسائل الدفع المدعومة\n- بنية الموقع وعدد الصفحات\n- وجود مدونة وعدد المقالات\n- لغات الموقع\n\n## الخطوة 3: اكتشاف كلماتهم المفتاحية\n\nأدوات احترافية:\n\n- **[Ahrefs](https://ahrefs.com)**: الأقوى لتحليل الكلمات (مدفوع)\n- **[SEMrush](https://semrush.com)**: بديل ممتاز مع تجربة مجانية\n- **[Ubersuggest](https://neilpatel.com/ubersuggest/)**: مجاني محدود من Neil Patel\n- **[Google Keyword Planner](https://ads.google.com/home/tools/keyword-planner/)**: مجاني مع حساب Google Ads\n\n### في Ahrefs\n\n1. ألصق رابط المنافس في Site Explorer\n2. اضغط Organic Keywords\n3. ستظهر كل الكلمات التي يحقق منها زيارات، مع الترتيب وحجم البحث\n4. صدّر القائمة لـ Excel\n\n### النتيجة المتوقعة\n\nقائمة بـ 200-2000 كلمة، عمود لكل من:\n\n- الكلمة\n- ترتيب المنافس\n- حجم البحث الشهري\n- صعوبة الكلمة (KD)\n- الصفحة المرتبة\n\n## الخطوة 4: تحليل الفجوة (Gap Analysis)\n\nأهم تحليل: ما الكلمات التي يربح بها منافسوك ولا تظهر أنت فيها؟\n\nفي Ahrefs:\n\n1. Content Gap → أضف 3-5 منافسين + موقعك\n2. ستحصل على قائمة بكل الكلمات التي ترتب فيها هم ولا ترتب أنت\n3. رتّبها حسب حجم البحث والصعوبة\n4. ركّز على الكلمات بـ KD أقل من 30 وحجم بحث أكثر من 200\n\n**هذه قائمتك للبدء.**\n\n## الخطوة 5: تحليل المحتوى\n\nلكل كلمة فجوة، افتح الصفحة المنافسة وحلّل:\n\n- **الطول**: كم كلمة؟ المقالات الطويلة (2000+) عادةً تتفوق\n- **البنية**: كم عنواناً فرعياً؟ هل يستخدم جداول، قوائم، صور؟\n- **الوسائط**: فيديو؟ infographic؟ بودكاست؟\n- **الإجابة الأساسية**: ما السؤال الذي يجيبه؟ وهل إجابته شاملة؟\n\n> **مبدأ Skyscraper**: لا تكتفِ بنسخة مماثلة. اكتب نسخة **أفضل** بـ 30% — أعمق، أوضح، بأمثلة أكثر، بفيديو، بـ FAQ.\n\n## الخطوة 6: تحليل الإعلانات المدفوعة\n\nأدوات:\n\n- **Meta Ad Library**: كل إعلانات أي صفحة على Meta — مجاناً\n- **TikTok Ad Library**: نفس الفكرة لـ TikTok\n- **SpyFu / SEMrush**: إعلانات Google التاريخية\n\nاستخرج:\n\n- نوع الحملة (Awareness, Conversion, Retargeting)\n- نص الإعلان الرئيسي (Hook)\n- الإبداع البصري (صور أم فيديو؟ ستايل؟ ألوان؟)\n- الصفحة المهبط (Landing Page)\n\n## الخطوة 7: بناء خطة العمل\n\nبعد التحليل، اصنع خطة من 90 يوماً:\n\n### الشهر الأول: المحتوى\n\nاكتب 8-10 مقالات تستهدف أعلى 10 كلمات فجوة. كل مقال يطبق مبدأ Skyscraper.\n\n### الشهر الثاني: الروابط الخلفية\n\n- استخدم Backlink Profile في Ahrefs لمعرفة أين يحصل المنافسون على روابط\n- تواصل مع نفس المواقع (مدونات، مجلات، شركاء) بزاوية مختلفة\n- اكتب مقالات ضيف (Guest Posts) لمواقع الصناعة\n\n### الشهر الثالث: التحسين والقياس\n\n- راجع الترتيب لكل كلمة مستهدفة\n- حسّن الصفحات التي وصلت لـ Top 20 ولم تصل لـ Top 10\n- استكمل المقالات الناقصة\n- ابدأ تجربة إعلانات Google على الكلمات الأعلى تحويلاً\n\n## أخطاء شائعة\n\n| الخطأ | الصواب |\n| --- | --- |\n| التركيز على الكلمات عالية الحجم فقط | استهدف Long-tail (3-4 كلمات) لمنافسة أقل |\n| نسخ المحتوى بدون قيمة مضافة | طبّق Skyscraper — أعمق وأشمل |\n| إهمال الكلمات بقصد الشراء | كلمات مثل "أفضل" و"سعر" و"شراء" تحوّل أكثر |\n| تجاهل اللغة العربية | المنافسة على الكلمات العربية أقل بكثير من الإنجليزية |\n\n## خلاصة\n\nتحليل المنافسين ليس تجسساً — هو ذكاء سوقي. كل ميزانية تنفقها على إعلان دون تحليل أولاً، هي ميزانية تختبر فيها ما اختبره غيرك بالفعل. ابدأ بتحليل عميق، طبّق Content Gap، واستثمر في المحتوى طويل المدى. النتائج تأتي خلال 3-6 أشهر، لكنها دائمة.',
   E'# Competitor and Keyword Analysis\n\nMost marketing starts with enthusiasm but without understanding competition. This guide walks you through a systematic 7-step analysis.\n\n## Step 1: Identify real competitors\n\nDirect, indirect, and search competitors. Search your top 10 commercial keywords and note the top 5 results.\n\n## Step 2: Analyze their website\n\nBuiltWith for tech stack, Wayback Machine for history, PageSpeed Insights for performance.\n\n## Step 3: Discover their keywords\n\nAhrefs, SEMrush, Ubersuggest, or Google Keyword Planner. Export their full Organic Keywords list.\n\n## Step 4: Gap analysis\n\nContent Gap in Ahrefs: keywords they rank for but you do not. Filter by KD<30 and volume>200.\n\n## Step 5: Content analysis\n\nFor each gap keyword, study competitor pages: length, structure, media. Apply Skyscraper — make yours 30% better.\n\n## Step 6: Paid ads analysis\n\nMeta Ad Library, TikTok Ad Library, SpyFu/SEMrush for Google. Extract campaign type, hook, creative style, landing pages.\n\n## Step 7: Build the 90-day plan\n\nMonth 1: 8-10 Skyscraper articles. Month 2: backlinks via outreach and guest posts. Month 3: optimize and start Google Ads on top intent keywords.',
   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '7 days', false,
   16,
   array['SEO','تحليل المنافسين','كلمات مفتاحية','Ahrefs','محتوى','استراتيجية']::text[],
   '[
     {"question_ar":"هل أحتاج لأدوات مدفوعة مثل Ahrefs؟","question_en":"Do I need paid tools like Ahrefs?","answer_ar":"للمشاريع الجادة: نعم. الأدوات المجانية محدودة جداً. اشترك في Ahrefs أو SEMrush لشهرين فقط، صدّر كل البيانات، ثم ألغِ الاشتراك.","answer_en":"For serious work: yes. Free tools are very limited. Subscribe to Ahrefs/SEMrush for 2 months, export everything, then cancel."},
     {"question_ar":"كم منافس يكفي للتحليل؟","question_en":"How many competitors should I analyze?","answer_ar":"5-7 منافسين كافيين. أكثر من ذلك يصبح غير منتج. اختر 3 مباشرين، 2 غير مباشرين، 2 على الكلمات.","answer_en":"5-7 competitors is enough. More becomes unproductive. Pick 3 direct, 2 indirect, 2 keyword-only."},
     {"question_ar":"هل المحتوى وحده يكفي للترتيب؟","question_en":"Is content alone enough to rank?","answer_ar":"المحتوى أهم عامل، لكن لا يكفي. تحتاج: SEO تقني سليم، روابط خلفية، تجربة مستخدم جيدة، وسرعة موقع.","answer_en":"Content is the top factor but not enough. You also need technical SEO, backlinks, good UX, and speed."}
   ]'::jsonb,
   '[]'::jsonb,
   'دليل تحليل المنافسين والكلمات المفتاحية في 7 خطوات',
   'Competitor and Keyword Analysis: A Practical 7-Step Guide',
   'تعلم كيف تحلل منافسيك وتكتشف الكلمات المفتاحية التي تجلب لهم الزوار — بأدوات احترافية وخطوات قابلة للتنفيذ.',
   'Learn how to analyze competitors and discover the keywords driving their traffic — with pro tools and actionable steps.',
   'تحليل منافسين، كلمات مفتاحية، SEO، Ahrefs، SEMrush، Content Gap، استراتيجية محتوى',
   'competitor analysis, keyword research, SEO, Ahrefs, SEMrush, content gap, content strategy')
on conflict (slug) do nothing;

-- 5) مزايا المتاجر الإلكترونية المختلفة ─────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('ecommerce-platforms-comparison',
   'مزايا المتاجر الإلكترونية المختلفة: Shopify، WooCommerce، Salla، أم متجر مخصص؟',
   'E-commerce Platforms Compared: Shopify, WooCommerce, Salla, or Custom?',
   'مقارنة شاملة بين أشهر منصات التجارة الإلكترونية لتختار الأنسب لمشروعك — بالأسعار والمزايا والقيود والمنافسة.',
   'A comprehensive comparison of the top e-commerce platforms to help you pick the right one — with pricing, features, limitations, and trade-offs.',
   E'# مزايا المتاجر الإلكترونية المختلفة\n\nقرار اختيار منصة المتجر هو أحد أهم القرارات في رحلتك التجارية الإلكترونية. اختيار خاطئ يعني خسارة شهور من العمل ومئات الآلاف من الجنيهات. في هذه المقارنة، نمر بـ 4 منصات رئيسية ونحدد الأنسب لكل سيناريو.\n\n## نظرة سريعة على المقارنة\n\n| الميزة | Shopify | WooCommerce | Salla | متجر مخصص |\n| --- | --- | --- | --- | --- |\n| **سهولة البدء** | ★★★★★ | ★★★ | ★★★★★ | ★ |\n| **التخصيص** | ★★★ | ★★★★★ | ★★ | ★★★★★ |\n| **التكلفة الشهرية** | 29-2000$ | 0-200$ | 0-1000 ريال | 5000+ جنيه |\n| **سهولة الصيانة** | ★★★★★ | ★★ | ★★★★★ | ★★★ |\n| **دعم اللغة العربية** | ★★★ | ★★★★ | ★★★★★ | ★★★★★ |\n| **مناسب لـ** | الشركات المتوسطة | المرونة المطلقة | السوق الخليجي | متطلبات فريدة |\n\n## 1. Shopify — السهولة في مقابل التكلفة\n\n### المزايا\n\n- **بدء سريع جداً**: متجر يعمل في ساعتين بدون مبرمج\n- **استضافة وأمان مشمولان**: لا تقلق بشأن الخوادم\n- **متجر تطبيقات ضخم**: 8000+ تطبيق لكل احتياج\n- **بوابات دفع عالمية**: Stripe, PayPal, Apple Pay\n- **استقرار وأداء عالٍ**: تحميل سريع ومضمون\n- **مناسب للنمو**: من 100 طلب يومياً إلى 100,000\n\n### القيود\n\n- **رسوم على كل معاملة**: 0.5-2% إضافة لرسوم بوابة الدفع (إلا مع Shopify Payments)\n- **تخصيص محدود**: لو احتجت ميزة غير موجودة، صعب التطوير\n- **التكلفة الشهرية تتراكم**: تطبيقات إضافية + خطة Plus = 2000$+ شهرياً\n- **اللغة العربية**: تعمل لكن الـ RTL يحتاج تعديلات قالب\n\n### مناسب لـ\n\nمشاريع تريد البدء بسرعة، تبيع منتجات قياسية (ملابس، إكسسوارات، إلكترونيات)، وتفضل دفع أكثر مقابل الراحة.\n\n## 2. WooCommerce — المرونة الكاملة\n\n### المزايا\n\n- **مفتوح المصدر ومجاني**: التطبيق نفسه بدون رسوم\n- **مرونة لا حدود لها**: 50,000+ إضافة + تخصيص كامل بـ PHP\n- **يعمل على WordPress**: استفد من قوة WP في المحتوى والـ SEO\n- **لا رسوم معاملات**: ادفع فقط لبوابات الدفع\n- **دعم RTL ممتاز**: WordPress يدعم العربية بشكل ممتاز\n- **مجتمع ضخم**: حلول لكل مشكلة بتقريباً\n\n### القيود\n\n- **تحتاج لخبرة تقنية**: استضافة، تحديثات، نسخ احتياطي\n- **الإضافات مدفوعة في الغالب**: 50-300$ للإضافة الواحدة\n- **الأداء يعتمد على الاستضافة**: بطء محتمل لو الاستضافة سيئة\n- **مسؤوليتك أمنياً**: تحديثات شهرية أو ضحية لاختراق\n\n### مناسب لـ\n\nمشاريع تحتاج تخصيصاً معقداً، شركات لديها فريق تقني، أو متاجر لها متطلبات فريدة لا تجدها في المنصات الجاهزة.\n\n## 3. Salla — الأمثل للسوق الخليجي\n\n### المزايا\n\n- **مصمم للسوق العربي**: واجهة عربية كاملة، RTL أصلي\n- **بوابات دفع محلية**: مدى، STC Pay، Apple Pay\n- **شركات شحن محلية مدمجة**: SMSA, Aramex, J&T\n- **دعم ضرائب القيمة المضافة**: VAT للسعودية والإمارات\n- **تطبيق جوال خاص بمتجرك**: مشمول في الخطط الأعلى\n- **دعم فني بالعربية**: 24/7\n\n### القيود\n\n- **محدود جغرافياً**: مصمم أساساً للخليج\n- **تخصيص محدود**: مثل Shopify\n- **تكلفة شهرية**: تبدأ من 99 ريال (24 دولار) للخطة الأساسية\n- **سوق التطبيقات صغير نسبياً**: مقارنةً بـ Shopify\n\n### مناسب لـ\n\nالتجار في السعودية، الإمارات، الكويت، البحرين، عمان، قطر. سهولة لا توازى للسوق الخليجي.\n\n## 4. المتجر المخصص — الحل الفريد\n\n### المزايا\n\n- **تخصيص 100%**: اعمل أي شيء بأي طريقة\n- **لا رسوم منصة**: ادفع فقط لاستضافتك وبوابات الدفع\n- **تكامل عميق**: مع ERP، CRM، نظام محاسبة، WhatsApp\n- **أداء قابل للتحسين**: تحكم كامل في الكود\n- **ملكية كاملة**: لا تعتمد على منصة قد ترفع أسعارها\n- **يصلح لنماذج أعمال غير تقليدية**: مزاد، اشتراك، عمولة، B2B\n\n### القيود\n\n- **تكلفة بدء عالية**: 30,000-200,000 جنيه للتطوير الأولي\n- **مدة تطوير طويلة**: 2-6 أشهر\n- **صيانة دائمة**: تحتاج فريق تقني أو عقد صيانة شهري\n- **مخاطر تقنية**: تأخيرات، أخطاء، أعطال\n\n### مناسب لـ\n\nالمتاجر بمتطلبات فريدة (نموذج عمل خاص)، الشركات الكبيرة (1M+ طلب سنوياً)، أو الذين يريدون أصلاً تجارياً قابلاً للبيع لاحقاً.\n\n## كيف تختار؟\n\nاسأل نفسك 4 أسئلة:\n\n### 1. ما حجم مشروعك؟\n\n- **<100 طلب شهرياً**: Salla أو Shopify Basic\n- **100-1000 طلب**: Shopify أو WooCommerce\n- **1000-10,000 طلب**: Shopify Advanced أو WooCommerce محسّن\n- **10,000+ طلب**: Shopify Plus أو متجر مخصص\n\n### 2. ما خبرتك التقنية؟\n\n- **صفر**: Salla أو Shopify\n- **مبتدئ**: Shopify مع وكالة\n- **متوسط**: WooCommerce\n- **متقدم**: متجر مخصص\n\n### 3. ما جمهورك؟\n\n- **خليجي**: Salla\n- **مصري/عربي عام**: WooCommerce أو متجر مخصص\n- **عالمي**: Shopify\n\n### 4. ما ميزانيتك الشهرية؟\n\n- **<500 جنيه**: WooCommerce على استضافة رخيصة\n- **500-3000 جنيه**: Salla أو Shopify Basic\n- **3000-15,000 جنيه**: Shopify Advanced أو WooCommerce احترافي\n- **15,000+ جنيه**: متجر مخصص أو Shopify Plus\n\n## خلاصة\n\nلا توجد منصة أفضل من غيرها — يوجد فقط منصة أنسب لك. ابدأ بسؤال: ماذا أريد أن أكون بعد سنتين؟ ثم اختر المنصة التي تأخذك هناك. وتذكّر: التحويل بين المنصات ممكن لاحقاً لكنه مؤلم — اختر بعناية من البداية.',
   E'# E-commerce Platforms Compared\n\nPicking the right platform is one of the most consequential decisions in your e-commerce journey. We compare 4 major options for different scenarios.\n\n## Shopify\n\nFastest to launch, beautiful storefront, huge app ecosystem, but ongoing fees and limited customization. Best for: standard-product businesses prioritizing speed.\n\n## WooCommerce\n\nFully open source, unlimited customization, no platform fees. Needs technical know-how. Best for: complex requirements with a tech team.\n\n## Salla\n\nPurpose-built for GCC markets. Native Arabic, local payment gateways (Mada, STC Pay), Aramex/SMSA shipping integrations, VAT support. Best for: merchants in Saudi/UAE/Kuwait.\n\n## Custom Build\n\n100% tailored, deep integration with ERP/CRM/WhatsApp, no platform fees, but high upfront cost and ongoing maintenance. Best for: unique business models or 10K+ orders/month.\n\n## How to choose\n\nFour questions: size of business, technical skill, audience location, monthly budget. There is no "best" platform — only the right one for your specific situation.',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '2 days', true,
   15,
   array['تجارة إلكترونية','Shopify','WooCommerce','Salla','مقارنة منصات']::text[],
   '[
     {"question_ar":"هل يمكن النقل من منصة لأخرى لاحقاً؟","question_en":"Can I migrate between platforms later?","answer_ar":"نعم لكنه مؤلم. تحتاج لنقل المنتجات، العملاء، الطلبات، روابط SEO. كل منصة لها أدوات استيراد لكن لا واحدة كاملة. خطط جيداً من البداية.","answer_en":"Yes but painful. You will migrate products, customers, orders, and SEO URLs. Each platform has import tools but none are complete. Plan well upfront."},
     {"question_ar":"هل Shopify أفضل من WooCommerce دائماً؟","question_en":"Is Shopify always better than WooCommerce?","answer_ar":"لا. Shopify أسهل لكن أقل مرونة وأغلى على المدى البعيد. WooCommerce أقوى لكنه أصعب. كل منهما يناسب حالات مختلفة.","answer_en":"No. Shopify is easier but less flexible and more expensive long-term. WooCommerce is more powerful but harder. Each fits different cases."},
     {"question_ar":"كم تكلف بدء متجر إلكتروني فعلياً؟","question_en":"What does it really cost to start?","answer_ar":"على Shopify: 5,000-15,000 جنيه للتصميم + 1,400-7,000 شهرياً. على Salla: 5,000-12,000 + 200-2,000 شهرياً. متجر مخصص: 30,000-150,000 + صيانة شهرية.","answer_en":"Shopify: $300-900 setup + $30-300/month. Salla: similar range. Custom: $1,500-7,500 setup + monthly maintenance."},
     {"question_ar":"ما المنصة الأفضل في مصر تحديداً؟","question_en":"What works best in Egypt specifically?","answer_ar":"WooCommerce هو الأشهر بسبب التكلفة المنخفضة والمرونة، خاصة مع تكامل بوابات الدفع المحلية مثل PayMob و Fawry. Shopify يصبح أفضل لو تستهدف الأسواق العالمية أيضاً.","answer_en":"WooCommerce is most popular due to low cost and flexibility, especially with PayMob/Fawry integration. Shopify becomes better if you also target international markets."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80","caption_ar":"اختيار المنصة الصحيحة قرار حاسم لمستقبل متجرك","caption_en":"Choosing the right platform is a defining decision for your store"}
   ]'::jsonb,
   'مقارنة منصات المتاجر الإلكترونية: أيها يناسب مشروعك؟',
   'E-commerce Platform Comparison: Shopify vs WooCommerce vs Salla vs Custom',
   'مقارنة تفصيلية بين Shopify و WooCommerce و Salla والمتجر المخصص لتختار الأنسب لمشروعك.',
   'Detailed comparison between Shopify, WooCommerce, Salla, and custom builds to pick the best fit for your project.',
   'متاجر إلكترونية، Shopify، WooCommerce، Salla، متجر مخصص، مقارنة، تجارة إلكترونية',
   'e-commerce platforms, Shopify, WooCommerce, Salla, custom store, comparison, online stores')
on conflict (slug) do nothing;

-- ── POST → CATEGORY MAPPING ─────────────────────────────────────────────────
insert into public.blog_post_categories (post_id, category_id)
select p.id, c.id from public.blog_posts p, public.blog_categories c
where (p.slug, c.slug) in (
  ('how-to-build-complete-website', 'development'),
  ('host-website-on-cpanel', 'hosting-infra'),
  ('integrated-marketing-plan', 'marketing'),
  ('competitor-keyword-analysis-guide', 'marketing'),
  ('competitor-keyword-analysis-guide', 'seo'),
  ('competitor-keyword-analysis-guide', 'competitor-analysis'),
  ('ecommerce-platforms-comparison', 'ecommerce'),
  ('ecommerce-platforms-comparison', 'platforms-comparison')
)
on conflict do nothing;


-- === 20260524000000_admin_avatars_policy.sql ===
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


