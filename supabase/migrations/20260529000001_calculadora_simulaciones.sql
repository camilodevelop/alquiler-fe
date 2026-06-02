-- ==========================================
-- Calculadora de Rentabilidad: Simulaciones
-- ==========================================

create table if not exists public.simulaciones (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,

  -- Identificación
  nombre      text not null,                    -- obligatorio al guardar
  token       text not null unique default encode(gen_random_bytes(16), 'hex'),

  -- Sección 1 — Coste de adquisición
  datos_adquisicion jsonb not null default '{}'::jsonb,

  -- Sección 2 — Rentabilidades (A-F)
  datos_rentabilidad jsonb not null default '{}'::jsonb,

  -- Sección 3 — Notas
  direccion             text,
  estado_negociacion    text check (estado_negociacion in (
                          'en_analisis', 'negociando', 'oferta_presentada',
                          'descartado', 'adquirido'
                        )),
  observaciones         text,
  video_url             text,     -- URL externa (YouTube, Vimeo, etc.)
  video_storage_path    text,     -- Ruta en Supabase Storage si se subió archivo

  -- Resultados cacheados (calculados en frontend, guardados para comparador/PDF)
  resultados            jsonb not null default '{}'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices
create index if not exists idx_simulaciones_owner   on public.simulaciones(owner_id);
create index if not exists idx_simulaciones_token   on public.simulaciones(token);
create index if not exists idx_simulaciones_created on public.simulaciones(created_at desc);

-- RLS
alter table public.simulaciones enable row level security;

-- Cada usuario ve y gestiona solo sus simulaciones
create policy "simulaciones_select"
  on public.simulaciones for select
  to authenticated
  using (owner_id = auth.uid());

create policy "simulaciones_insert"
  on public.simulaciones for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "simulaciones_update"
  on public.simulaciones for update
  to authenticated
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "simulaciones_delete"
  on public.simulaciones for delete
  to authenticated
  using (owner_id = auth.uid());

-- Lectura pública por token (sin auth) para el link de solo lectura
create policy "simulaciones_public_token"
  on public.simulaciones for select
  to anon
  using (token is not null);

-- Trigger: actualizar updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_simulaciones_updated_at on public.simulaciones;
create trigger trg_simulaciones_updated_at
  before update on public.simulaciones
  for each row execute function public.set_updated_at();
