create or replace function public.preview_next_quotation_no()
returns text
language sql
security definer
set search_path = public
as $$
  select 'QT' || to_char(current_date, 'YYYY') || '-' ||
    lpad((last_value + case when is_called then 1 else 0 end)::text, 4, '0')
  from public.quotation_no_seq;
$$;

revoke all on function public.preview_next_quotation_no() from public, anon;
grant execute on function public.preview_next_quotation_no() to authenticated;

notify pgrst, 'reload schema';
