alter table public.contracts
  add column if not exists event_type_id uuid references public.event_types(id) on delete set null;

create index if not exists contracts_event_type_id_idx on public.contracts (event_type_id);
