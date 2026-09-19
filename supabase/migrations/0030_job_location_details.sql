alter table public.jobs
  add column if not exists location_url text,
  add column if not exists province text;

notify pgrst, 'reload schema';
