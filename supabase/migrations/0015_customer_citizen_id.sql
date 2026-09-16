alter table public.customers
  add column if not exists citizen_id text;
