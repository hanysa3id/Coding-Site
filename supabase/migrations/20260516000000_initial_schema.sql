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
