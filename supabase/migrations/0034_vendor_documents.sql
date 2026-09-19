alter table public.vendors
  add column if not exists document_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('vendor-documents', 'vendor-documents', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated manage vendor documents') then
    create policy "authenticated manage vendor documents" on storage.objects
      for all to authenticated
      using (bucket_id = 'vendor-documents')
      with check (bucket_id = 'vendor-documents');
  end if;
end $$;

notify pgrst, 'reload schema';
