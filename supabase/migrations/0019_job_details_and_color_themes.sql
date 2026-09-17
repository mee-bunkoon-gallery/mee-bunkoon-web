alter table public.jobs
  add column if not exists job_description text,
  add column if not exists color_theme_ids uuid[] not null default '{}';

update public.jobs
set color_theme_ids = array[color_theme_id]
where color_theme_id is not null
  and coalesce(array_length(color_theme_ids, 1), 0) = 0;

create index if not exists jobs_color_theme_ids_idx on public.jobs using gin (color_theme_ids);
