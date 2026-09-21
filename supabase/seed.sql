-- DEVELOPMENT ONLY.
-- Do not execute this file against the production project.
-- The inserts are intentionally non-destructive: existing admin content wins.

insert into public.manifesto (id, statement_text)
values (
  1,
  E'Este es un manifiesto de prueba para validar el recorrido editorial del sitio.\n\n## La materia de la noche\n\nLa pintura aparece como una forma de vigilia: una superficie donde la sombra, el pigmento y la memoria ensayan otra manera de mirar.'
)
on conflict (id) do nothing;

insert into public.biography_sections (id, body_text, heading_level, display_order, is_active)
values (
  1,
  E'Biografía de prueba para validar la página pública y el panel de administración.\n\nEste texto es ficticio y debe reemplazarse por el contenido real de la artista.',
  'large',
  0,
  true
)
on conflict (id) do nothing;

insert into public.series (title, slug, essay_text, display_order, is_active)
values (
  'La Sombra y la Capa: Mitos de Gotham',
  'la-sombra-y-la-capa',
  'Una exploración ficticia del claroscuro, la vigilia nocturna y la justicia moral. Este contenido pertenece al seed de desarrollo y no representa la obra real de la artista.',
  1,
  true
)
on conflict (slug) do nothing;

insert into public.artworks (
  series_id, title, year, technique, height_cm, width_cm,
  availability, microstory, display_order
)
select
  s.id,
  'La barra de hierro (Tragedia en la familia)',
  '2023',
  'Óleo y óxido sobre lienzo',
  120,
  90,
  'disponible',
  'Una superficie herida sostiene el silencio después del golpe. El color no ilustra la tragedia: la deja respirar.',
  1
from public.series s
where s.slug = 'la-sombra-y-la-capa'
  and not exists (
    select 1 from public.artworks a
    where a.series_id = s.id
      and a.title = 'La barra de hierro (Tragedia en la familia)'
  );

insert into public.artworks (
  series_id, title, year, technique, height_cm, width_cm,
  availability, microstory, display_order
)
select
  s.id,
  'Dicotomía en óleo (Harvey Dent)',
  '2022',
  'Técnica mixta sobre tabla de pino',
  100,
  70,
  'coleccion_privada',
  'Dos mitades de una misma decisión se miran sin encontrar una moneda que las reconcilie.',
  2
from public.series s
where s.slug = 'la-sombra-y-la-capa'
  and not exists (
    select 1 from public.artworks a
    where a.series_id = s.id
      and a.title = 'Dicotomía en óleo (Harvey Dent)'
  );

insert into public.artworks (
  series_id, title, year, technique, height_cm, width_cm,
  availability, microstory, display_order
)
select
  s.id,
  'El Batimóvil en la noche',
  '2024',
  'Acuarela y tinta sobre papel de algodón 300g',
  50,
  70,
  'no_disponible',
  'La máquina cruza el horizonte como una extensión del vacío urbano: velocidad sin promesa de llegada.',
  3
from public.series s
where s.slug = 'la-sombra-y-la-capa'
  and not exists (
    select 1 from public.artworks a
    where a.series_id = s.id
      and a.title = 'El Batimóvil en la noche'
  );

insert into public.contact_requests (name, email, request_type, details)
select
  'Visitante de prueba',
  'visitante@example.com',
  'consulta_obra',
  'Mensaje de prueba para validar la bandeja de contactos del panel.'
where not exists (
  select 1 from public.contact_requests
  where email = 'visitante@example.com'
    and details = 'Mensaje de prueba para validar la bandeja de contactos del panel.'
  );
