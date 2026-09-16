-- Quotation module: customers & service items (master data) + quotations
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------
-- Customers (master)
-- ----------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  tax_id text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------
-- Service items (master)
-- ----------------------------------------------------------------------
create table if not exists public.service_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  unit text not null default 'รายการ',
  unit_price numeric(12, 2) not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------
-- Quotations
-- ----------------------------------------------------------------------
create sequence if not exists public.quotation_no_seq start 1;

create or replace function public.next_quotation_no()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.quotation_no_seq');
  return 'QT' || to_char(current_date, 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quote_no text not null unique default public.next_quotation_no(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  issue_date date not null default current_date,
  valid_until date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  include_vat boolean not null default true,
  vat_rate numeric(5, 2) not null default 7,
  discount numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  vat_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  service_item_id uuid references public.service_items(id) on delete set null,
  position int not null default 0,
  description text not null,
  unit text,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0
);

create index if not exists quotation_items_quotation_id_idx on public.quotation_items (quotation_id);
create index if not exists quotations_customer_id_idx on public.quotations (customer_id);

-- ----------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.customers;
create trigger set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.service_items;
create trigger set_updated_at before update on public.service_items
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.quotations;
create trigger set_updated_at before update on public.quotations
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------
-- RLS — single-org internal tool: any signed-in user may manage all rows
-- ----------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.service_items enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

drop policy if exists authenticated_all on public.customers;
create policy authenticated_all on public.customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists authenticated_all on public.service_items;
create policy authenticated_all on public.service_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists authenticated_all on public.quotations;
create policy authenticated_all on public.quotations
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists authenticated_all on public.quotation_items;
create policy authenticated_all on public.quotation_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
