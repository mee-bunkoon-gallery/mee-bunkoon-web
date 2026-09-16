-- Work-delivery / handover documents (เอกสารส่งมอบงาน)
create sequence if not exists public.delivery_no_seq start 1;

create or replace function public.next_delivery_no()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.delivery_no_seq');
  return 'DL' || to_char(current_date, 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_no text not null unique default public.next_delivery_no(),
  quotation_id uuid references public.quotations(id) on delete set null,
  contract_id uuid references public.contracts(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  delivery_date date not null default current_date,
  delivery_method text not null default 'in_person'
    check (delivery_method in ('in_person', 'online_link', 'courier', 'other')),
  items_delivered text,
  note text,
  status text not null default 'draft' check (status in ('draft', 'delivered', 'acknowledged')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliveries_customer_id_idx on public.deliveries (customer_id);
create index if not exists deliveries_quotation_id_idx on public.deliveries (quotation_id);
create index if not exists deliveries_contract_id_idx on public.deliveries (contract_id);

drop trigger if exists set_updated_at on public.deliveries;
create trigger set_updated_at before update on public.deliveries
  for each row execute function public.set_updated_at();

alter table public.deliveries enable row level security;

drop policy if exists authenticated_all on public.deliveries;
create policy authenticated_all on public.deliveries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
