create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  subtitle text,
  image_url text,
  image_path text,
  button_label text,
  button_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_banners_active_order_idx
  on public.hero_banners (is_active, display_order);

drop trigger if exists set_updated_at on public.hero_banners;
create trigger set_updated_at before update on public.hero_banners
  for each row execute function public.set_updated_at();

alter table public.hero_banners enable row level security;

drop policy if exists authenticated_all on public.hero_banners;
create policy authenticated_all on public.hero_banners
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('hero-banner-images', 'hero-banner-images', true)
on conflict (id) do nothing;

create policy "authenticated upload hero banner images" on storage.objects
  for insert to authenticated with check (bucket_id = 'hero-banner-images');

create policy "authenticated update hero banner images" on storage.objects
  for update to authenticated using (bucket_id = 'hero-banner-images');

create policy "authenticated delete hero banner images" on storage.objects
  for delete to authenticated using (bucket_id = 'hero-banner-images');

notify pgrst, 'reload schema';
