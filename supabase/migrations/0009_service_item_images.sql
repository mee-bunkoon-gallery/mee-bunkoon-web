alter table public.service_items add column if not exists image_url text;

notify pgrst, 'reload schema';

insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

create policy "authenticated upload service images" on storage.objects
  for insert to authenticated with check (bucket_id = 'service-images');

create policy "authenticated delete service images" on storage.objects
  for delete to authenticated using (bucket_id = 'service-images');
