alter table public.payments
  add column if not exists payment_purpose text not null default 'partial';

alter table public.payments
  drop constraint if exists payments_payment_purpose_check;

alter table public.payments
  add constraint payments_payment_purpose_check
  check (payment_purpose in ('deposit', 'partial', 'full', 'other'));
