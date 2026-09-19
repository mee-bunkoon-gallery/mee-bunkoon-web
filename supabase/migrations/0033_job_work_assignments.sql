alter table public.jobs
  add column if not exists work_assignments jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
