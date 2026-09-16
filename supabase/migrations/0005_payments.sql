-- Payments received (ใบรับเงิน) with optional uploaded transfer-slip evidence
create sequence if not exists public.receipt_no_seq start 1;

create or replace function public.next_receipt_no()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.receipt_no_seq');
  return 'RC' || to_char(current_date, 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  receipt_no text not null unique default public.next_receipt_no(),
  quotation_id uuid references public.quotations(id) on delete set null,
  contract_id uuid references public.contracts(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  payment_date date not null default current_date,
  amount numeric(12, 2) not null default 0,
  payment_method text not null default 'transfer'
    check (payment_method in ('cash', 'transfer', 'credit_card', 'other')),
  reference_no text,
  slip_path text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_customer_id_idx on public.payments (customer_id);
create index if not exists payments_quotation_id_idx on public.payments (quotation_id);
create index if not exists payments_contract_id_idx on public.payments (contract_id);

drop trigger if exists set_updated_at on public.payments;
create trigger set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists authenticated_all on public.payments;
create policy authenticated_all on public.payments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------
-- Storage RLS for the private "payment-slips" bucket (bucket created via JS client)
-- ----------------------------------------------------------------------
drop policy if exists payment_slips_authenticated_all on storage.objects;
create policy payment_slips_authenticated_all on storage.objects
  for all to authenticated
  using (bucket_id = 'payment-slips')
  with check (bucket_id = 'payment-slips');
