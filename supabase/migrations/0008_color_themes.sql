create table if not exists public.color_themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hex_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.color_themes enable row level security;

create policy authenticated_all on public.color_themes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table public.jobs
  add column if not exists color_theme_id uuid references public.color_themes(id) on delete set null;

create index if not exists jobs_color_theme_id_idx on public.jobs (color_theme_id);
