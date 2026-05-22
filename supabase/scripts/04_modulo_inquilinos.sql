-- ============================================================
-- MÓDULO INQUILINOS — ejecutar en Supabase Dashboard → SQL Editor
-- Requiere: auth, profiles, gestor_propietario, propiedades, set_updated_at()
-- ============================================================

-- ==========================================
-- Módulo Inquilinos
-- ==========================================

-- Helper: acceso a propiedad (propietario o gestor vinculado)
create or replace function public.user_can_access_propiedad(p_propiedad_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.propiedades p
    where p.id = p_propiedad_id
      and (
        p.owner_id = auth.uid()
        or exists (
          select 1
          from public.gestor_propietario gp
          where gp.gestor_id = auth.uid()
            and gp.propietario_id = p.owner_id
        )
      )
  );
$$;

-- Helper: acceso a inquilino por owner_id
create or replace function public.user_can_access_inquilino(p_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_owner_id = auth.uid()
    or exists (
      select 1
      from public.gestor_propietario gp
      where gp.gestor_id = auth.uid()
        and gp.propietario_id = p_owner_id
    );
$$;

-- ------------------------------------------
-- Tabla principal
-- ------------------------------------------
create table if not exists public.inquilinos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  nombres text not null,
  apellidos text not null,
  tipo_documento text not null default 'dni',
  numero_documento text not null,
  fecha_nacimiento date,
  nacionalidad text,
  telefono text not null,
  email text not null,

  direccion_actual text,
  ciudad text,
  pais text default 'España',

  ocupacion text,
  empresa text,
  tipo_contrato_laboral text,
  ingresos_mensuales numeric(12, 2),
  antiguedad_laboral text,
  referencia_laboral text,
  telefono_referencia_laboral text,
  observaciones_financieras text,

  status text not null default 'candidato',

  propiedad_id uuid references public.propiedades(id) on delete set null,
  unidad_id text,
  unidad_nombre text,
  fecha_ingreso date,
  fecha_salida date,
  canon_mensual numeric(12, 2),
  deposito numeric(12, 2),
  responsable_servicios text default 'inquilino',
  ocupantes int default 1 check (ocupantes >= 1 and ocupantes <= 20),

  estado_pago text not null default 'pendiente',
  total_pagado numeric(12, 2) not null default 0,
  total_pendiente numeric(12, 2) not null default 0,
  pagos_vencidos int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint inquilinos_tipo_documento_check
    check (tipo_documento in ('dni', 'nie', 'pasaporte', 'cedula', 'otro')),
  constraint inquilinos_tipo_contrato_laboral_check
    check (tipo_contrato_laboral is null or tipo_contrato_laboral in (
      'indefinido', 'temporal', 'autonomo', 'pensionado', 'estudiante', 'desempleado', 'otro'
    )),
  constraint inquilinos_status_check
    check (status in (
      'candidato', 'en_revision', 'aprobado', 'activo', 'moroso',
      'finalizado', 'rechazado', 'inactivo'
    )),
  constraint inquilinos_estado_pago_check
    check (estado_pago in ('al_dia', 'pendiente', 'vencido', 'impagado')),
  constraint inquilinos_responsable_servicios_check
    check (responsable_servicios in ('propietario', 'inquilino', 'compartido')),
  constraint inquilinos_activo_requiere_propiedad
    check (status <> 'activo' or propiedad_id is not null),
  constraint inquilinos_activo_requiere_ingreso
    check (status <> 'activo' or fecha_ingreso is not null),
  constraint inquilinos_numero_documento_unique unique (numero_documento),
  constraint inquilinos_email_unique unique (email)
);

create index if not exists idx_inquilinos_owner_id on public.inquilinos(owner_id);
create index if not exists idx_inquilinos_status on public.inquilinos(status);
create index if not exists idx_inquilinos_propiedad_id on public.inquilinos(propiedad_id);
create index if not exists idx_inquilinos_estado_pago on public.inquilinos(estado_pago);
create index if not exists idx_inquilinos_fecha_ingreso on public.inquilinos(fecha_ingreso);

-- Una habitación activa por unidad en renta por habitaciones
create unique index if not exists idx_inquilinos_unidad_activa
  on public.inquilinos(propiedad_id, unidad_id)
  where status = 'activo'
    and unidad_id is not null
    and btrim(unidad_id) <> '';

-- ------------------------------------------
-- Referencias (1:1)
-- ------------------------------------------
create table if not exists public.inquilino_referencias (
  inquilino_id uuid primary key references public.inquilinos(id) on delete cascade,
  nombre_personal text,
  telefono_personal text,
  relacion text,
  nombre_arrendador text,
  telefono_arrendador text,
  comentario text
);

-- ------------------------------------------
-- Scoring (1:1)
-- ------------------------------------------
create table if not exists public.inquilino_scoring (
  inquilino_id uuid primary key references public.inquilinos(id) on delete cascade,
  nivel text not null default 'sin_evaluar',
  documentacion_completa boolean not null default false,
  ingresos_suficientes boolean not null default false,
  historial_pagos boolean not null default false,
  referencias_positivas boolean not null default false,
  estabilidad_laboral boolean not null default false,
  comportamiento_reportado boolean not null default false,
  danos_previos boolean not null default false,
  observaciones_gestor text,
  actualizado_at timestamptz not null default now(),
  constraint inquilino_scoring_nivel_check
    check (nivel in ('sin_evaluar', 'bajo', 'medio', 'alto', 'excelente'))
);

-- ------------------------------------------
-- Documentos
-- ------------------------------------------
create table if not exists public.inquilino_documentos (
  id uuid primary key default gen_random_uuid(),
  inquilino_id uuid not null references public.inquilinos(id) on delete cascade,
  tipo text not null,
  nombre_archivo text not null,
  storage_path text,
  url text,
  fecha_carga date not null default current_date,
  estado text not null default 'pendiente',
  observaciones text,
  created_at timestamptz not null default now(),
  constraint inquilino_documentos_tipo_check
    check (tipo in (
      'identidad', 'contrato_laboral', 'nomina', 'vida_laboral',
      'carta_recomendacion', 'certificado_bancario', 'otro'
    )),
  constraint inquilino_documentos_estado_check
    check (estado in ('pendiente', 'en_revision', 'aprobado', 'rechazado'))
);

create index if not exists idx_inquilino_documentos_inquilino on public.inquilino_documentos(inquilino_id);

-- ------------------------------------------
-- Historial
-- ------------------------------------------
create table if not exists public.inquilino_historial (
  id uuid primary key default gen_random_uuid(),
  inquilino_id uuid not null references public.inquilinos(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  created_at timestamptz not null default now(),
  constraint inquilino_historial_tipo_check
    check (tipo in ('creado', 'documento', 'propiedad', 'contrato', 'pago', 'incidencia', 'estado', 'scoring'))
);

create index if not exists idx_inquilino_historial_inquilino on public.inquilino_historial(inquilino_id);

-- ------------------------------------------
-- updated_at
-- ------------------------------------------
drop trigger if exists trg_inquilinos_updated_at on public.inquilinos;
create trigger trg_inquilinos_updated_at
  before update on public.inquilinos
  for each row execute function public.set_updated_at();

-- ------------------------------------------
-- RLS
-- ------------------------------------------
alter table public.inquilinos enable row level security;
alter table public.inquilino_referencias enable row level security;
alter table public.inquilino_scoring enable row level security;
alter table public.inquilino_documentos enable row level security;
alter table public.inquilino_historial enable row level security;

-- inquilinos
drop policy if exists "inquilinos_select" on public.inquilinos;
drop policy if exists "inquilinos_insert" on public.inquilinos;
drop policy if exists "inquilinos_update" on public.inquilinos;
drop policy if exists "inquilinos_delete" on public.inquilinos;

create policy "inquilinos_select"
  on public.inquilinos for select
  using (public.user_can_access_inquilino(owner_id));

create policy "inquilinos_insert"
  on public.inquilinos for insert
  with check (
    public.user_can_access_inquilino(owner_id)
    and (
      propiedad_id is null
      or public.user_can_access_propiedad(propiedad_id)
    )
  );

create policy "inquilinos_update"
  on public.inquilinos for update
  using (public.user_can_access_inquilino(owner_id))
  with check (
    public.user_can_access_inquilino(owner_id)
    and (
      propiedad_id is null
      or public.user_can_access_propiedad(propiedad_id)
    )
  );

create policy "inquilinos_delete"
  on public.inquilinos for delete
  using (public.user_can_access_inquilino(owner_id));

-- referencias
drop policy if exists "inquilino_referencias_all" on public.inquilino_referencias;
create policy "inquilino_referencias_all"
  on public.inquilino_referencias for all
  using (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  )
  with check (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  );

-- scoring
drop policy if exists "inquilino_scoring_all" on public.inquilino_scoring;
create policy "inquilino_scoring_all"
  on public.inquilino_scoring for all
  using (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  )
  with check (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  );

-- documentos
drop policy if exists "inquilino_documentos_all" on public.inquilino_documentos;
create policy "inquilino_documentos_all"
  on public.inquilino_documentos for all
  using (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  )
  with check (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  );

-- historial
drop policy if exists "inquilino_historial_all" on public.inquilino_historial;
create policy "inquilino_historial_all"
  on public.inquilino_historial for all
  using (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  )
  with check (
    exists (
      select 1 from public.inquilinos i
      where i.id = inquilino_id
        and public.user_can_access_inquilino(i.owner_id)
    )
  );

-- ------------------------------------------
-- Storage: documentos inquilinos
-- ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inquilinos',
  'inquilinos',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

drop policy if exists "inquilinos_docs_select" on storage.objects;
drop policy if exists "inquilinos_docs_insert" on storage.objects;
drop policy if exists "inquilinos_docs_update" on storage.objects;
drop policy if exists "inquilinos_docs_delete" on storage.objects;

create policy "inquilinos_docs_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'inquilinos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "inquilinos_docs_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'inquilinos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "inquilinos_docs_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'inquilinos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "inquilinos_docs_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'inquilinos'
    and split_part(name, '/', 1) = auth.uid()::text
  );
