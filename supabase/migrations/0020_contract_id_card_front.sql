alter table public.contracts add column if not exists id_card_front_url text;

insert into storage.buckets (id, name, public) values ('contract-id-cards', 'contract-id-cards', false)
on conflict (id) do nothing;

create policy "authenticated contract id card upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'contract-id-cards');

create policy "authenticated contract id card read" on storage.objects
  for select to authenticated using (bucket_id = 'contract-id-cards');
