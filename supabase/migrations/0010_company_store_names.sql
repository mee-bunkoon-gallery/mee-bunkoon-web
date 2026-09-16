alter table public.company_profile
  add column if not exists store_name_th text,
  add column if not exists store_name_en text;
