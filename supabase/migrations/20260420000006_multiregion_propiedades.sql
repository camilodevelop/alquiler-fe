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
