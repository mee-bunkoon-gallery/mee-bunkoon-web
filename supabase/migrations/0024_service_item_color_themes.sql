create table if not exists public.service_item_color_themes (
  service_item_id uuid not null references public.service_items(id) on delete cascade,
  color_theme_id uuid not null references public.color_themes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_item_id, color_theme_id)
);

alter table public.service_item_color_themes enable row level security;

create policy authenticated_all on public.service_item_color_themes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists service_item_color_themes_color_theme_id_idx
  on public.service_item_color_themes(color_theme_id);

notify pgrst, 'reload schema';
