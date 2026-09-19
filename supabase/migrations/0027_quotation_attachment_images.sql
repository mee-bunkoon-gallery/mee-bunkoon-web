alter table public.quotations
  add column if not exists attachment_image_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('quotation-attachments', 'quotation-attachments', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'authenticated upload quotation attachments'
  ) then
    create policy "authenticated upload quotation attachments" on storage.objects
      for insert to authenticated with check (bucket_id = 'quotation-attachments');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'authenticated delete quotation attachments'
  ) then
    create policy "authenticated delete quotation attachments" on storage.objects
      for delete to authenticated using (bucket_id = 'quotation-attachments');
  end if;
end $$;

notify pgrst, 'reload schema';
