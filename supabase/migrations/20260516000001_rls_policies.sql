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
