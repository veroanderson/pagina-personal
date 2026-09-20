begin;

alter table public.settings
  alter column value type jsonb
  using to_jsonb(value);

insert into public.settings (key, value)
select
  'home_manifesto',
  jsonb_build_object(
    'statement_text', statement_text,
    'image_path_1', image_path_1,
    'image_path_2', image_path_2
  )
from public.manifesto
where id = 1
on conflict (key) do update
set value = excluded.value;

commit;
