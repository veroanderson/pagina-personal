insert into public.settings (key, value)
values (
  'home_manifesto',
  jsonb_build_object(
    'eyebrow', 'Veronica Anderson · Artista visual',
    'title', 'La contemplación del horizonte y la botánica de campo.',
    'imageSrc', '/images/home.png',
    'imageAlt', 'Obra pictórica de nenúfares sobre el agua',
    'titlePosition', 'top-left'
  )
)
on conflict (key) do update set value = excluded.value;
