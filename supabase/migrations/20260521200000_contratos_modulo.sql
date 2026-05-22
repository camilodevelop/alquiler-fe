-- ==========================================
-- Módulo Contratos
-- ==========================================

-- ------------------------------------------
-- Tipos de contrato (plantillas)
-- ------------------------------------------
create table if not exists public.contrato_tipos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  descripcion text not null default '',
  plantilla_html text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contrato_tipos_owner on public.contrato_tipos(owner_id);
create index if not exists idx_contrato_tipos_activo on public.contrato_tipos(activo);

-- ------------------------------------------
-- Contratos
-- ------------------------------------------
create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  codigo text not null,
  tipo_contrato_id uuid not null references public.contrato_tipos(id) on delete restrict,
  propiedad_id uuid not null references public.propiedades(id) on delete restrict,
  inquilino_id uuid not null references public.inquilinos(id) on delete restrict,
  unidad text,
  fecha_inicio date not null,
  fecha_fin date not null,
  valor_mensual numeric(12, 2) not null check (valor_mensual > 0),
  deposito numeric(12, 2) not null default 0 check (deposito >= 0),
  dia_pago int not null default 1 check (dia_pago >= 1 and dia_pago <= 28),
  observaciones text,
  plantilla_html text not null,
  contenido_generado text not null,
  estado text not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint contratos_estado_check
    check (estado in (
      'borrador', 'pendiente_firma', 'firmado', 'activo', 'finalizado', 'cancelado'
    )),
  constraint contratos_fechas_check
    check (fecha_fin > fecha_inicio),
  constraint contratos_owner_codigo_unique unique (owner_id, codigo)
);

create index if not exists idx_contratos_owner on public.contratos(owner_id);
create index if not exists idx_contratos_estado on public.contratos(estado);
create index if not exists idx_contratos_propiedad on public.contratos(propiedad_id);
create index if not exists idx_contratos_inquilino on public.contratos(inquilino_id);
create index if not exists idx_contratos_tipo on public.contratos(tipo_contrato_id);

-- Una propiedad solo puede tener un contrato activo
create unique index if not exists idx_contratos_propiedad_activo
  on public.contratos(propiedad_id)
  where estado = 'activo';

-- ------------------------------------------
-- Firmas
-- ------------------------------------------
create table if not exists public.contrato_firmas (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  rol text not null,
  firmante_nombre text not null default '',
  fecha_firma timestamptz,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint contrato_firmas_rol_check
    check (rol in ('administrador', 'inquilino')),
  constraint contrato_firmas_estado_check
    check (estado in ('pendiente', 'firmado')),
  constraint contrato_firmas_contrato_rol_unique unique (contrato_id, rol)
);

create index if not exists idx_contrato_firmas_contrato on public.contrato_firmas(contrato_id);

-- ------------------------------------------
-- Historial
-- ------------------------------------------
create table if not exists public.contrato_historial (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  created_at timestamptz not null default now(),

  constraint contrato_historial_tipo_check
    check (tipo in (
      'creado', 'editado', 'firma_admin', 'firma_inquilino', 'activado', 'finalizado', 'cancelado'
    ))
);

create index if not exists idx_contrato_historial_contrato on public.contrato_historial(contrato_id);

-- Acceso a contrato vía propiedad (después de crear la tabla contratos)
create or replace function public.user_can_access_contrato(p_contrato_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contratos c
    where c.id = p_contrato_id
      and public.user_can_access_propiedad(c.propiedad_id)
  );
$$;

-- ------------------------------------------
-- updated_at
-- ------------------------------------------
drop trigger if exists trg_contrato_tipos_updated_at on public.contrato_tipos;
create trigger trg_contrato_tipos_updated_at
  before update on public.contrato_tipos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contratos_updated_at on public.contratos;
create trigger trg_contratos_updated_at
  before update on public.contratos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contrato_firmas_updated_at on public.contrato_firmas;
create trigger trg_contrato_firmas_updated_at
  before update on public.contrato_firmas
  for each row execute function public.set_updated_at();

-- ------------------------------------------
-- RLS
-- ------------------------------------------
alter table public.contrato_tipos enable row level security;
alter table public.contratos enable row level security;
alter table public.contrato_firmas enable row level security;
alter table public.contrato_historial enable row level security;

-- contrato_tipos
drop policy if exists "contrato_tipos_select" on public.contrato_tipos;
drop policy if exists "contrato_tipos_insert" on public.contrato_tipos;
drop policy if exists "contrato_tipos_update" on public.contrato_tipos;
drop policy if exists "contrato_tipos_delete" on public.contrato_tipos;

create policy "contrato_tipos_select"
  on public.contrato_tipos for select
  using (public.user_can_access_inquilino(owner_id));

create policy "contrato_tipos_insert"
  on public.contrato_tipos for insert
  with check (public.user_can_access_inquilino(owner_id));

create policy "contrato_tipos_update"
  on public.contrato_tipos for update
  using (public.user_can_access_inquilino(owner_id))
  with check (public.user_can_access_inquilino(owner_id));

create policy "contrato_tipos_delete"
  on public.contrato_tipos for delete
  using (public.user_can_access_inquilino(owner_id));

-- contratos
drop policy if exists "contratos_select" on public.contratos;
drop policy if exists "contratos_insert" on public.contratos;
drop policy if exists "contratos_update" on public.contratos;
drop policy if exists "contratos_delete" on public.contratos;

create policy "contratos_select"
  on public.contratos for select
  using (public.user_can_access_propiedad(propiedad_id));

create policy "contratos_insert"
  on public.contratos for insert
  with check (
    public.user_can_access_inquilino(owner_id)
    and public.user_can_access_propiedad(propiedad_id)
    and exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
    and exists (
      select 1 from public.contrato_tipos t
      where t.id = tipo_contrato_id
        and public.user_can_access_inquilino(t.owner_id)
    )
  );

create policy "contratos_update"
  on public.contratos for update
  using (public.user_can_access_propiedad(propiedad_id))
  with check (
    public.user_can_access_propiedad(propiedad_id)
    and public.user_can_access_inquilino(owner_id)
  );

create policy "contratos_delete"
  on public.contratos for delete
  using (public.user_can_access_propiedad(propiedad_id));

-- contrato_firmas
drop policy if exists "contrato_firmas_all" on public.contrato_firmas;
create policy "contrato_firmas_all"
  on public.contrato_firmas for all
  using (public.user_can_access_contrato(contrato_id))
  with check (public.user_can_access_contrato(contrato_id));

-- contrato_historial
drop policy if exists "contrato_historial_all" on public.contrato_historial;
create policy "contrato_historial_all"
  on public.contrato_historial for all
  using (public.user_can_access_contrato(contrato_id))
  with check (public.user_can_access_contrato(contrato_id));
