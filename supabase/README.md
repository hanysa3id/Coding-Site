# Supabase Setup

## Migrations

Run migrations on a fresh Supabase project in order:

1. `20260516000000_initial_schema.sql` — All tables, enums, indexes, triggers
2. `20260516000001_rls_policies.sql` — Row Level Security policies
3. `20260516000002_storage_setup.sql` — Storage buckets and policies
4. `20260516000003_seed_settings.sql` — Default site settings

## How to run

### Option 1: Supabase Studio (manual)
1. Open Supabase Studio → SQL Editor
2. Paste each migration file in order
3. Run

### Option 2: Supabase CLI
```bash
# Link to project (one-time)
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

### Option 3: Generate types after migrations
```bash
# Regenerate TypeScript types
npm run supabase:types
```

## Creating the first admin user

After running migrations:

1. Sign up a normal user via the app
2. In Supabase Studio → Authentication → Users, copy the user's UUID
3. Run SQL to promote to admin:

```sql
update public.profiles
set role = 'admin'
where id = '<user-uuid>';
```

## Schema overview

- **profiles** — extends `auth.users`, holds role and contact info
- **categories** — hierarchical (parent_id)
- **services** + **service_gallery** + **service_stages**
- **portfolio_projects** + **portfolio_gallery** + **portfolio_services**
- **orders** + **order_status_history** + **order_milestones** + **order_deliverables** + **order_messages**
- **payments** + **bank_accounts**
- **reviews**
- **blog_posts** + **blog_categories** + **blog_post_categories**
- **notifications**
- **settings** (jsonb singleton keys)

## Storage buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `service-images` | ✅ | Service covers + galleries |
| `portfolio-images` | ✅ | Portfolio covers + galleries |
| `avatars` | ✅ | User avatars |
| `blog-images` | ✅ | Blog post images |
| `order-deliverables` | ❌ | Project deliverables (RLS) |
| `payment-receipts` | ❌ | Manual payment receipts (RLS) |
