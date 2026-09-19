create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  contact_person text,
  phone text,
  email text,
  line_id text,
  tax_id text,
  address text,
  province text,
  payment_terms text,
  note text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_name_idx on public.vendors (name);
create index if not exists vendors_category_idx on public.vendors (category);

drop trigger if exists set_updated_at on public.vendors;
create trigger set_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();

alter table public.vendors enable row level security;

drop policy if exists authenticated_all on public.vendors;
create policy authenticated_all on public.vendors
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
