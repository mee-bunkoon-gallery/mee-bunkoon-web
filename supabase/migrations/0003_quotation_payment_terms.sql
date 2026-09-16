-- Payment terms shown as a bulleted list on the quotation (one line per bullet)
alter table public.quotations
  add column if not exists payment_terms text;
