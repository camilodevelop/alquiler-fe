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
