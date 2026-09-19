alter table public.vendors
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('vendor-images', 'vendor-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated manage vendor images') then
    create policy "authenticated manage vendor images" on storage.objects
      for all to authenticated
      using (bucket_id = 'vendor-images')
      with check (bucket_id = 'vendor-images');
  end if;
end $$;

notify pgrst, 'reload schema';
