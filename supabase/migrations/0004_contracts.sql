-- Event-hiring contracts (สัญญาจ้างจัดงาน) — can originate from a quotation, or be created standalone
create sequence if not exists public.contract_no_seq start 1;

create or replace function public.next_contract_no()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.contract_no_seq');
  return 'CT' || to_char(current_date, 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_no text not null unique default public.next_contract_no(),
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  contract_date date not null default current_date,
  event_type text,
  event_date date,
  event_time text,
  event_location text,
  scope_of_work text,
  total_amount numeric(12, 2) not null default 0,
  deposit_amount numeric(12, 2) not null default 0,
  payment_terms text,
  terms_conditions text,
  status text not null default 'draft' check (status in ('draft', 'signed', 'cancelled')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_customer_id_idx on public.contracts (customer_id);
create index if not exists contracts_quotation_id_idx on public.contracts (quotation_id);

drop trigger if exists set_updated_at on public.contracts;
create trigger set_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

alter table public.contracts enable row level security;

drop policy if exists authenticated_all on public.contracts;
create policy authenticated_all on public.contracts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
