insert into public.settings (key, value)
values (
  'home_manifesto',
  jsonb_build_object(
    'eyebrow', 'Vero Anderson · Artista visual',
    'title', 'La contemplación del horizonte y la botánica de campo.',
    'imageSrc', '/images/home.png',
    'imageAlt', 'Obra pictórica de nenúfares sobre el agua'
  )
)
on conflict (key) do update set value = excluded.value;
