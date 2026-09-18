create table if not exists public.promotion_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  promotion_price numeric(12, 2) not null default 0 check (promotion_price >= 0),
  start_date date,
  end_date date,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_packages_date_range check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create table if not exists public.promotion_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.promotion_packages(id) on delete cascade,
  service_item_id uuid not null references public.service_items(id) on delete restrict,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  position integer not null default 0,
  unique (package_id, service_item_id)
);

alter table public.promotion_packages enable row level security;
alter table public.promotion_package_items enable row level security;

create policy authenticated_all on public.promotion_packages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy authenticated_all on public.promotion_package_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists promotion_package_items_package_id_idx
  on public.promotion_package_items(package_id);

insert into storage.buckets (id, name, public)
values ('promotion-package-images', 'promotion-package-images', true)
on conflict (id) do nothing;

create policy "authenticated upload promotion package images" on storage.objects
  for insert to authenticated with check (bucket_id = 'promotion-package-images');

create policy "authenticated delete promotion package images" on storage.objects
  for delete to authenticated using (bucket_id = 'promotion-package-images');

notify pgrst, 'reload schema';
