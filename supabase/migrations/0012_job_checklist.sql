alter table public.jobs
  add column if not exists checklist jsonb not null default '[]'::jsonb;
