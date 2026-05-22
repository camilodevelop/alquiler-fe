-- ============================================================
-- SOLO MÓDULO PROPIEDADES (ejecutar si ya tienes el resto del schema)
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Nuevas columnas
alter table public.propiedades
  add column if not exists tipo_renta text,
  add column if not exists tipo_propiedad text,
  add column if not exists foto_principal_url text,
  add column if not exists duracion_minima_dias int;

-- Migrar tipo_alquiler → tipo_renta (si existe la columna antigua)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'propiedades' and column_name = 'tipo_alquiler'
  ) then
    update public.propiedades
    set tipo_renta = case tipo_alquiler
      when 'corta_estancia' then 'temporal'
      when 'flipping' then 'comercial'
      when 'habitaciones' then 'habitaciones'
      else 'tradicional'
    end
    where tipo_renta is null;
  end if;
end;
$$;

update public.propiedades set tipo_renta = 'tradicional' where tipo_renta is null;
update public.propiedades set tipo_propiedad = 'apartamento' where tipo_propiedad is null;

alter table public.propiedades
  alter column tipo_renta set default 'tradicional',
  alter column tipo_renta set not null;

alter table public.propiedades
  alter column tipo_propiedad set default 'apartamento',
  alter column tipo_propiedad set not null;

alter table public.propiedades drop constraint if exists propiedades_tipo_alquiler_check;
alter table public.propiedades drop column if exists tipo_alquiler;

alter table public.propiedades drop constraint if exists propiedades_tipo_renta_check;
alter table public.propiedades
  add constraint propiedades_tipo_renta_check
  check (tipo_renta in ('tradicional', 'habitaciones', 'temporal', 'comercial'));

alter table public.propiedades drop constraint if exists propiedades_tipo_propiedad_check;
alter table public.propiedades
  add constraint propiedades_tipo_propiedad_check
  check (tipo_propiedad in (
    'apartamento', 'casa', 'apartaestudio', 'habitacion', 'local',
    'oficina', 'bodega', 'finca', 'garaje', 'deposito'
  ));

-- Storage: fotos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'propiedades', 'propiedades', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "propiedades_fotos_select" on storage.objects;
drop policy if exists "propiedades_fotos_insert" on storage.objects;
drop policy if exists "propiedades_fotos_update" on storage.objects;
drop policy if exists "propiedades_fotos_delete" on storage.objects;

create policy "propiedades_fotos_select"
  on storage.objects for select
  to public
  using (bucket_id = 'propiedades');

create policy "propiedades_fotos_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'propiedades'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "propiedades_fotos_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'propiedades'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "propiedades_fotos_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'propiedades'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
