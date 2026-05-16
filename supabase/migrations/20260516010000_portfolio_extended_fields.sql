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
