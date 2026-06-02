-- ==========================================
-- Calculadora: Fotos de simulación + Storage
-- ==========================================

-- ------------------------------------------
-- Tabla fotos por simulación
-- ------------------------------------------
create table if not exists public.simulacion_fotos (
  id              uuid primary key default gen_random_uuid(),
  simulacion_id   uuid not null references public.simulaciones(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  storage_path    text not null,       -- ruta en bucket "simulaciones"
  url_publica     text not null,       -- URL firmada/pública para mostrar en UI y PDF
  orden           int  not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_simulacion_fotos_simulacion on public.simulacion_fotos(simulacion_id);
create index if not exists idx_simulacion_fotos_owner      on public.simulacion_fotos(owner_id);

-- RLS
alter table public.simulacion_fotos enable row level security;

create policy "simulacion_fotos_select_owner"
  on public.simulacion_fotos for select
  to authenticated
  using (owner_id = auth.uid());

-- Lectura pública para la vista de solo lectura (el token ya protege la simulación)
create policy "simulacion_fotos_select_public"
  on public.simulacion_fotos for select
  to anon
  using (true);

create policy "simulacion_fotos_insert"
  on public.simulacion_fotos for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "simulacion_fotos_update"
  on public.simulacion_fotos for update
  to authenticated
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "simulacion_fotos_delete"
  on public.simulacion_fotos for delete
  to authenticated
  using (owner_id = auth.uid());

-- ------------------------------------------
-- Storage bucket: simulaciones
-- Fotos (JPEG/PNG/WebP, máx 10 MB) y vídeos (MP4/MOV/AVI, máx 200 MB)
-- ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'simulaciones',
  'simulaciones',
  true,
  209715200,   -- 200 MB (cubre vídeos)
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ]
)
on conflict (id) do nothing;

-- Políticas Storage: carpeta por usuario (uid/simulacion_id/archivo)
drop policy if exists "simulaciones_storage_select" on storage.objects;
drop policy if exists "simulaciones_storage_insert" on storage.objects;
drop policy if exists "simulaciones_storage_update" on storage.objects;
drop policy if exists "simulaciones_storage_delete" on storage.objects;

-- Lectura pública (fotos y vídeos se comparten vía link de solo lectura)
create policy "simulaciones_storage_select"
  on storage.objects for select
  to public
  using (bucket_id = 'simulaciones');

-- Subida: solo el usuario en su propia carpeta
create policy "simulaciones_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'simulaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Actualización
create policy "simulaciones_storage_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'simulaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Eliminación
create policy "simulaciones_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'simulaciones'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
