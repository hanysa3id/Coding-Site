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
