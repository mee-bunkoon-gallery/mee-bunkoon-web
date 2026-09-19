alter table public.payments
  add column if not exists status text not null default 'completed'
    check (status in ('draft', 'completed'));

alter table public.payments
  alter column receipt_no drop not null,
  alter column receipt_no drop default;

create or replace function public.preview_next_receipt_no()
returns text
language sql
security definer
set search_path = public
as $$
  select 'RC' || to_char(current_date, 'YYYY') || '-' ||
    lpad((last_value + case when is_called then 1 else 0 end)::text, 4, '0')
  from public.receipt_no_seq;
$$;

create or replace function public.complete_payment(payment_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_no text;
begin
  perform pg_advisory_xact_lock(hashtext('payment_receipt_number'));

  select receipt_no into next_no
  from public.payments
  where id = payment_id;

  if next_no is null then
    next_no := public.next_receipt_no();
  end if;

  update public.payments
  set receipt_no = next_no, status = 'completed'
  where id = payment_id;

  return next_no;
end;
$$;

revoke all on function public.preview_next_receipt_no() from public, anon;
revoke all on function public.complete_payment(uuid) from public, anon;
grant execute on function public.preview_next_receipt_no() to authenticated;
grant execute on function public.complete_payment(uuid) to authenticated;

notify pgrst, 'reload schema';
