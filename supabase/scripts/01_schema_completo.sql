-- ============================================================
-- SCHEMA COMPLETO Rentyva / Alquiler
-- Proyecto NUEVO en Supabase → SQL Editor → Run (una sola vez)
-- ============================================================

-- >>> 20260420000000_auth_schema.sql
-- ==========================================
-- ENUMS
-- ==========================================
create type public.user_role as enum ('propietario', 'gestor', 'inquilino', 'manitas', 'agente');
create type public.estado_invitacion as enum ('pendiente', 'aceptada', 'expirada');

-- ==========================================
-- PROFILES (extiende auth.users)
-- ==========================================
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null unique,
  nombre      text,
  apellidos   text,
  rol         public.user_role not null default 'propietario',
  avatar_url  text,
  telefono    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ==========================================
-- INVITACIONES
-- Propietario/gestor invita a inquilinos, manitas o gestores por email
-- antes de que se registren en la plataforma.
-- ==========================================
create table public.invitaciones (
  id           uuid        primary key default gen_random_uuid(),
  invitado_por uuid        not null references public.profiles(id) on delete cascade,
  email        text        not null,
  rol          public.user_role not null check (rol in ('inquilino', 'gestor', 'manitas')),
  token        text        not null unique default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
  estado       public.estado_invitacion not null default 'pendiente',
  expira_en    timestamptz not null default (now() + interval '7 days'),
  created_at   timestamptz not null default now()
);

create index idx_invitaciones_invitado_por on public.invitaciones(invitado_por);
create index idx_invitaciones_email        on public.invitaciones(email);
create index idx_invitaciones_token        on public.invitaciones(token);

-- ==========================================
-- GESTOR_PROPIETARIO
-- M:N entre gestores y los propietarios que gestionan.
-- Revocar la fila cancela todos los permisos del gestor automáticamente.
-- ==========================================
create table public.gestor_propietario (
  gestor_id      uuid not null references public.profiles(id) on delete cascade,
  propietario_id uuid not null references public.profiles(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (gestor_id, propietario_id)
);

create index idx_gestor_propietario_gestor      on public.gestor_propietario(gestor_id);
create index idx_gestor_propietario_propietario on public.gestor_propietario(propietario_id);

-- ==========================================
-- TRIGGER: updated_at en profiles
-- ==========================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ==========================================
-- TRIGGER: auto-crear profile al registrarse
-- ==========================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, rol)
  values (new.id, new.email, 'propietario')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- >>> 20260420000001_auth_rls.sql
-- ==========================================
-- RLS: profiles
-- ==========================================
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Gestor puede ver el perfil de los propietarios que gestiona
create policy "profiles_select_propietario_por_gestor"
  on public.profiles for select
  using (
    exists (
      select 1 from public.gestor_propietario gp
      where gp.gestor_id     = auth.uid()
        and gp.propietario_id = profiles.id
    )
  );

-- ==========================================
-- RLS: invitaciones
-- ==========================================
alter table public.invitaciones enable row level security;

-- El invitador ve y gestiona sus propias invitaciones
create policy "invitaciones_select_invitador"
  on public.invitaciones for select
  using (invitado_por = auth.uid());

create policy "invitaciones_insert_invitador"
  on public.invitaciones for insert
  with check (invitado_por = auth.uid());

create policy "invitaciones_update_invitador"
  on public.invitaciones for update
  using (invitado_por = auth.uid());

create policy "invitaciones_delete_invitador"
  on public.invitaciones for delete
  using (invitado_por = auth.uid());

-- Acceso público por token para el flujo de aceptación de invitación
-- (el token actúa como secreto de 256 bits; la validación de expiración
-- y cambio de estado se hace en la Edge Function)
create policy "invitaciones_select_by_token"
  on public.invitaciones for select
  using (true);

-- ==========================================
-- RLS: gestor_propietario
-- ==========================================
alter table public.gestor_propietario enable row level security;

-- Propietario gestiona sus gestores
create policy "gestor_propietario_select_propietario"
  on public.gestor_propietario for select
  using (propietario_id = auth.uid());

create policy "gestor_propietario_insert_propietario"
  on public.gestor_propietario for insert
  with check (propietario_id = auth.uid());

create policy "gestor_propietario_delete_propietario"
  on public.gestor_propietario for delete
  using (propietario_id = auth.uid());

-- Gestor ve los propietarios que gestiona
create policy "gestor_propietario_select_gestor"
  on public.gestor_propietario for select
  using (gestor_id = auth.uid());


-- >>> 20260420000002_auth_trigger_rol.sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _rol public.user_role;
begin
  begin
    _rol := (new.raw_user_meta_data->>'rol')::public.user_role;
  exception when others then
    _rol := 'propietario';
  end;

  insert into public.profiles (id, email, rol, nombre, apellidos)
  values (
    new.id,
    new.email,
    coalesce(_rol, 'propietario'),
    nullif(trim(new.raw_user_meta_data->>'nombre'), ''),
    nullif(trim(new.raw_user_meta_data->>'apellidos'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


-- >>> 20260420000003_auth_trigger_telefono.sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _rol public.user_role;
begin
  begin
    _rol := (new.raw_user_meta_data->>'rol')::public.user_role;
  exception when others then
    _rol := 'propietario';
  end;

  insert into public.profiles (id, email, rol, nombre, apellidos, telefono)
  values (
    new.id,
    new.email,
    coalesce(_rol, 'propietario'),
    nullif(trim(new.raw_user_meta_data->>'nombre'), ''),
    nullif(trim(new.raw_user_meta_data->>'apellidos'), ''),
    nullif(trim(new.raw_user_meta_data->>'telefono'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


-- >>> 20260420000004_paises_schema.sql
-- ==========================================
-- TABLA: paises (catálogo público de configuración regional)
-- ==========================================
create table public.paises (
  codigo                 char(2)          primary key,
  nombre                 text             not null,
  moneda_codigo          char(3)          not null,
  moneda_simbolo         text             not null,
  locale                 text             not null,
  telefono_regex         text             not null,
  telefono_placeholder   text             not null,
  documento_tipos        jsonb            not null default '[]',
  metodos_pago           jsonb            not null default '[]',
  tipos_contrato         jsonb            not null default '[]',
  indices_actualizacion  jsonb            not null default '[]',
  fiscal_modulos         jsonb            not null default '[]',
  iva_residencial        numeric(5,2)     not null default 0,
  iva_comercial          numeric(5,2)     not null default 0,
  fianza_meses_min       int              not null default 1,
  fianza_meses_max       int              not null default 2,
  activo                 boolean          not null default true,
  created_at             timestamptz      not null default now()
);

-- ==========================================
-- DATOS: España
-- ==========================================
insert into public.paises (
  codigo, nombre, moneda_codigo, moneda_simbolo, locale,
  telefono_regex, telefono_placeholder,
  documento_tipos, metodos_pago, tipos_contrato,
  indices_actualizacion, fiscal_modulos,
  iva_residencial, iva_comercial,
  fianza_meses_min, fianza_meses_max
) values (
  'ES', 'España', 'EUR', '€', 'es-ES',
  '^[6-9]\d{8}$', '612 345 678',
  '[
    {"codigo": "nif", "nombre": "NIF", "descripcion": "Número de Identificación Fiscal"},
    {"codigo": "nie", "nombre": "NIE", "descripcion": "Número de Identidad de Extranjero"},
    {"codigo": "cif", "nombre": "CIF", "descripcion": "Código de Identificación Fiscal (empresa)"}
  ]'::jsonb,
  '[
    {"codigo": "stripe",  "nombre": "Tarjeta / Stripe",    "activo": true},
    {"codigo": "sepa",    "nombre": "Transferencia SEPA",  "activo": true},
    {"codigo": "bizum",   "nombre": "Bizum",               "activo": true}
  ]'::jsonb,
  '[
    {"codigo": "lau_vivienda",  "nombre": "LAU — Vivienda habitual",   "ley": "Ley 29/1994 LAU"},
    {"codigo": "lau_comercial", "nombre": "LAU — Local comercial",     "ley": "Ley 29/1994 LAU"},
    {"codigo": "temporada",     "nombre": "Alquiler de temporada",     "ley": "Ley 29/1994 LAU art.3"},
    {"codigo": "habitacion",    "nombre": "Alquiler por habitaciones", "ley": "Código Civil"}
  ]'::jsonb,
  '[
    {"codigo": "ipc_general", "nombre": "IPC General (INE)",                              "url": "https://www.ine.es"},
    {"codigo": "irav",        "nombre": "IRAV (Índice Referencia Arrendamientos Vivienda)", "url": "https://www.ine.es"}
  ]'::jsonb,
  '[
    {"codigo": "modelo_100", "nombre": "Modelo 100 — IRPF"},
    {"codigo": "modelo_303", "nombre": "Modelo 303 — IVA trimestral"},
    {"codigo": "modelo_180", "nombre": "Modelo 180 — Retenciones arrendamientos"}
  ]'::jsonb,
  0, 21, 1, 2
);

-- ==========================================
-- RLS: catálogo público, solo lectura anon
-- ==========================================
alter table public.paises enable row level security;

create policy "paises_select_public"
  on public.paises for select
  using (true);


-- >>> 20260420000005_multiregion_profiles.sql
-- ==========================================
-- AÑADIR pais_codigo a profiles
-- DEFAULT 'ES' preserva todos los registros existentes
-- ==========================================
alter table public.profiles
  add column pais_codigo char(2) not null default 'ES'
    references public.paises(codigo) on update cascade;

create index idx_profiles_pais_codigo on public.profiles(pais_codigo);

-- ==========================================
-- ACTUALIZAR TRIGGER handle_new_user
-- Propaga pais_codigo desde raw_user_meta_data
-- Valida contra el catálogo; si inválido → 'ES'
-- ==========================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _rol        public.user_role;
  _pais       char(2);
begin
  begin
    _rol := (new.raw_user_meta_data->>'rol')::public.user_role;
  exception when others then
    _rol := 'propietario';
  end;

  select codigo into _pais
  from public.paises
  where codigo = upper(trim(coalesce(new.raw_user_meta_data->>'pais_codigo', 'ES')))
    and activo = true;

  _pais := coalesce(_pais, 'ES');

  insert into public.profiles (id, email, rol, nombre, apellidos, telefono, pais_codigo)
  values (
    new.id,
    new.email,
    coalesce(_rol, 'propietario'),
    nullif(trim(coalesce(new.raw_user_meta_data->>'nombre', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'apellidos', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'telefono', '')), ''),
    _pais
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


-- >>> 20260420000006_multiregion_propiedades.sql
-- ==========================================
-- TABLA propiedades (con pais_codigo desde el inicio)
-- ==========================================
create table if not exists public.propiedades (
  id               uuid             primary key default gen_random_uuid(),
  owner_id         uuid             not null references public.profiles(id) on delete cascade,
  titulo           text             not null,
  descripcion      text,
  direccion        text             not null,
  ciudad           text             not null,
  codigo_postal    text             not null,
  precio_mes       numeric(10,2)    not null,
  habitaciones     int              not null default 1,
  banos            int              not null default 1,
  metros_cuadrados numeric(7,2),
  tipo_alquiler    text             not null default 'tradicional'
                     check (tipo_alquiler in ('tradicional','habitaciones','corta_estancia','flipping')),
  estado           text             not null default 'disponible'
                     check (estado in ('disponible','alquilada','mantenimiento','inactiva')),
  lat              numeric(10,7),
  lng              numeric(10,7),
  pais_codigo      char(2)          not null default 'ES'
                     references public.paises(codigo) on update cascade,
  created_at       timestamptz      not null default now(),
  updated_at       timestamptz      not null default now()
);

-- Añadir columna si la tabla ya existía sin ella (idempotente)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'propiedades'
      and column_name  = 'pais_codigo'
  ) then
    alter table public.propiedades
      add column pais_codigo char(2) not null default 'ES'
        references public.paises(codigo) on update cascade;
  end if;
end;
$$;

create index if not exists idx_propiedades_owner_id    on public.propiedades(owner_id);
create index if not exists idx_propiedades_pais_codigo on public.propiedades(pais_codigo);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_propiedades_updated_at on public.propiedades;
create trigger trg_propiedades_updated_at
  before update on public.propiedades
  for each row execute function public.set_updated_at();

-- ==========================================
-- RLS
-- ==========================================
alter table public.propiedades enable row level security;

drop policy if exists "propiedades_select_owner"  on public.propiedades;
drop policy if exists "propiedades_insert_owner"  on public.propiedades;
drop policy if exists "propiedades_update_owner"  on public.propiedades;
drop policy if exists "propiedades_delete_owner"  on public.propiedades;
drop policy if exists "propiedades_select_gestor" on public.propiedades;
drop policy if exists "propiedades_update_gestor" on public.propiedades;

create policy "propiedades_select_owner"
  on public.propiedades for select
  using (owner_id = auth.uid());

create policy "propiedades_insert_owner"
  on public.propiedades for insert
  with check (owner_id = auth.uid());

create policy "propiedades_update_owner"
  on public.propiedades for update
  using (owner_id = auth.uid());

create policy "propiedades_delete_owner"
  on public.propiedades for delete
  using (owner_id = auth.uid());

create policy "propiedades_select_gestor"
  on public.propiedades for select
  using (
    exists (
      select 1 from public.gestor_propietario gp
      where gp.gestor_id      = auth.uid()
        and gp.propietario_id = propiedades.owner_id
    )
  );

create policy "propiedades_update_gestor"
  on public.propiedades for update
  using (
    exists (
      select 1 from public.gestor_propietario gp
      where gp.gestor_id      = auth.uid()
        and gp.propietario_id = propiedades.owner_id
    )
  );


-- >>> 20260521000000_propiedades_modulo.sql
-- ==========================================
-- Módulo Propiedades: tipos de renta/propiedad y foto
-- ==========================================

-- Nuevas columnas
alter table public.propiedades
  add column if not exists tipo_renta text,
  add column if not exists tipo_propiedad text,
  add column if not exists foto_principal_url text,
  add column if not exists duracion_minima_dias int;

-- Migrar tipo_alquiler → tipo_renta
update public.propiedades
set tipo_renta = case tipo_alquiler
  when 'corta_estancia' then 'temporal'
  when 'flipping' then 'comercial'
  when 'habitaciones' then 'habitaciones'
  else 'tradicional'
end
where tipo_renta is null;

alter table public.propiedades
  alter column tipo_renta set default 'tradicional',
  alter column tipo_renta set not null;

update public.propiedades
set tipo_propiedad = 'apartamento'
where tipo_propiedad is null;

alter table public.propiedades
  alter column tipo_propiedad set default 'apartamento',
  alter column tipo_propiedad set not null;

-- Eliminar constraint antiguo y columna legacy
alter table public.propiedades drop constraint if exists propiedades_tipo_alquiler_check;
alter table public.propiedades drop column if exists tipo_alquiler;

-- Constraints nuevos
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

-- ==========================================
-- Storage: fotos de propiedades
-- ==========================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'propiedades',
  'propiedades',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "propiedades_fotos_select" on storage.objects;
drop policy if exists "propiedades_fotos_insert" on storage.objects;
drop policy if exists "propiedades_fotos_update" on storage.objects;
drop policy if exists "propiedades_fotos_delete" on storage.objects;

create policy "propiedades_fotos_select"
  on storage.objects for select
  using (bucket_id = 'propiedades');

create policy "propiedades_fotos_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'propiedades'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "propiedades_fotos_update"
  on storage.objects for update
  using (
    bucket_id = 'propiedades'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "propiedades_fotos_delete"
  on storage.objects for delete
  using (
    bucket_id = 'propiedades'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


