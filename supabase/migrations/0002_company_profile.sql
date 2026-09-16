-- Company / issuer profile (singleton) — reused as the "from" party on every document
create table if not exists public.company_profile (
  id text primary key default 'default',
  entity_type text not null default 'individual' check (entity_type in ('individual', 'company')),
  name text not null default '',
  branch text,
  tax_id text,
  phone text,
  email text,
  address text,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint company_profile_singleton check (id = 'default')
);

drop trigger if exists set_updated_at on public.company_profile;
create trigger set_updated_at before update on public.company_profile
  for each row execute function public.set_updated_at();

alter table public.company_profile enable row level security;

drop policy if exists authenticated_all on public.company_profile;
create policy authenticated_all on public.company_profile
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public.company_profile (id) values ('default')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------
-- Storage RLS for the "logos" bucket (bucket itself is created via the JS client)
-- ----------------------------------------------------------------------
drop policy if exists logos_public_read on storage.objects;
create policy logos_public_read on storage.objects
  for select to public
  using (bucket_id = 'logos');

drop policy if exists logos_authenticated_write on storage.objects;
create policy logos_authenticated_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos');

drop policy if exists logos_authenticated_update on storage.objects;
create policy logos_authenticated_update on storage.objects
  for update to authenticated
  using (bucket_id = 'logos');

drop policy if exists logos_authenticated_delete on storage.objects;
create policy logos_authenticated_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos');
