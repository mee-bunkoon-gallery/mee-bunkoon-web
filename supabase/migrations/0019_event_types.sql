create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_types enable row level security;

create policy authenticated_all on public.event_types
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
