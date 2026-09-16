alter table public.quotations
  add column if not exists issuer_signature_url text,
  add column if not exists customer_signature_url text,
  add column if not exists issuer_signed_at timestamptz,
  add column if not exists customer_signed_at timestamptz;
