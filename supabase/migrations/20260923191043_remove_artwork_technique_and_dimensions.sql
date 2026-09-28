-- Technique and physical dimensions are no longer part of the artwork domain model.
alter table public.artworks
  drop column if exists technique,
  drop column if exists height_cm,
  drop column if exists width_cm;
