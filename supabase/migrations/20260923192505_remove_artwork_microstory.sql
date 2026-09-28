-- Per-artwork text is no longer part of the artwork domain model.
alter table public.artworks
  drop column if exists microstory;
