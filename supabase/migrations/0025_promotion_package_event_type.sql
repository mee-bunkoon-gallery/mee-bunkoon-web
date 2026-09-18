alter table public.promotion_packages
  add column if not exists event_type_id uuid
    references public.event_types(id) on delete set null;

create index if not exists promotion_packages_event_type_id_idx
  on public.promotion_packages(event_type_id);

notify pgrst, 'reload schema';
