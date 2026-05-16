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
