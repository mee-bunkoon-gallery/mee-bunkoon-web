alter table public.deliveries
  add column if not exists image_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('delivery-images', 'delivery-images', true)
on conflict (id) do nothing;

create policy "authenticated upload delivery images" on storage.objects
  for insert to authenticated with check (bucket_id = 'delivery-images');

create policy "authenticated delete delivery images" on storage.objects
  for delete to authenticated using (bucket_id = 'delivery-images');
