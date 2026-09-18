alter table public.promotion_packages add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('promotion-package-images', 'promotion-package-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'authenticated upload promotion package images'
  ) then
    create policy "authenticated upload promotion package images" on storage.objects
      for insert to authenticated with check (bucket_id = 'promotion-package-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'authenticated delete promotion package images'
  ) then
    create policy "authenticated delete promotion package images" on storage.objects
      for delete to authenticated using (bucket_id = 'promotion-package-images');
  end if;
end $$;

notify pgrst, 'reload schema';
