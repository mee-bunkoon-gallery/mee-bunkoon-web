-- Store the storage path instead of a long-lived signed URL; URLs are signed on read.
alter table public.contracts add column if not exists id_card_front_path text;

update public.contracts
set id_card_front_path = substring(id_card_front_url from '/contract-id-cards/([^?]+)')
where id_card_front_url is not null and id_card_front_path is null;

-- Old long-lived signed URLs are no longer needed (run after verifying the backfill).
update public.contracts set id_card_front_url = null where id_card_front_path is not null;
