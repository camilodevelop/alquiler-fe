-- ============================================================
-- FIX: Storage fotos propiedades (ejecutar en SQL Editor)
-- ============================================================

-- Bucket público
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'propiedades',
  'propiedades',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

drop policy if exists "propiedades_fotos_select" on storage.objects;
drop policy if exists "propiedades_fotos_insert" on storage.objects;
drop policy if exists "propiedades_fotos_update" on storage.objects;
drop policy if exists "propiedades_fotos_delete" on storage.objects;

-- Lectura pública (bucket public)
create policy "propiedades_fotos_select"
  on storage.objects for select
  to public
  using (bucket_id = 'propiedades');

-- Escritura: primera carpeta del path = UUID del usuario autenticado
-- Ruta: {owner_id}/{propiedad_id}/principal.jpg
create policy "propiedades_fotos_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'propiedades'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "propiedades_fotos_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'propiedades'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "propiedades_fotos_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'propiedades'
    and split_part(name, '/', 1) = auth.uid()::text
  );
