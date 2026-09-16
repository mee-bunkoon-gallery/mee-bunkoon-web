-- Job queue / booking calendar (ลงคิวงาน) — links a scheduled job to a customer and optionally a quotation/contract
create sequence if not exists public.job_no_seq start 1;

create or replace function public.next_job_no()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.job_no_seq');
  return 'JB' || to_char(current_date, 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_no text not null unique default public.next_job_no(),
  quotation_id uuid references public.quotations(id) on delete set null,
  contract_id uuid references public.contracts(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  title text not null default '',
  job_date date not null default current_date,
  start_time time,
  end_time time,
  location text,
  status text not null default 'queued'
    check (status in ('queued', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_customer_id_idx on public.jobs (customer_id);
create index if not exists jobs_quotation_id_idx on public.jobs (quotation_id);
create index if not exists jobs_contract_id_idx on public.jobs (contract_id);
create index if not exists jobs_job_date_idx on public.jobs (job_date);

drop trigger if exists set_updated_at on public.jobs;
create trigger set_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

drop policy if exists authenticated_all on public.jobs;
create policy authenticated_all on public.jobs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
