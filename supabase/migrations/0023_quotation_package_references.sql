alter table public.quotation_items
  add column if not exists promotion_package_id uuid
    references public.promotion_packages(id) on delete set null,
  add column if not exists promotion_package_discount numeric(12, 2) not null default 0;

create index if not exists quotation_items_promotion_package_id_idx
  on public.quotation_items(promotion_package_id);

notify pgrst, 'reload schema';
