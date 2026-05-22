-- ==========================================
-- Módulo Mantenimiento (tickets + manitas)
-- ==========================================

-- ------------------------------------------
-- Manitas
-- ------------------------------------------
create table if not exists public.manitas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  nombres text not null,
  apellidos text not null,
  telefono text not null,
  email text not null,
  especialidad text not null default 'general',
  zona_cobertura text,
  estado text not null default 'disponible',
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  disponibilidad_notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manitas_estado_check
    check (estado in ('disponible', 'ocupado', 'inactivo', 'suspendido')),
  constraint manitas_especialidad_check
    check (especialidad in (
      'plomeria', 'electricidad', 'cerrajeria', 'pintura', 'limpieza', 'general', 'otro'
    ))
);

create index if not exists idx_manitas_owner on public.manitas(owner_id);
create index if not exists idx_manitas_estado on public.manitas(estado);
create index if not exists idx_manitas_especialidad on public.manitas(especialidad);

-- ------------------------------------------
-- Tickets
-- ------------------------------------------
create table if not exists public.tickets_mantenimiento (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  codigo text not null,
  propiedad_id uuid not null references public.propiedades(id) on delete restrict,
  inquilino_id uuid references public.inquilinos(id) on delete set null,
  manitas_id uuid references public.manitas(id) on delete set null,
  unidad text,
  tipo text not null,
  urgencia text not null default 'media',
  estado text not null default 'nuevo',
  titulo text not null,
  descripcion text not null,
  fecha_reporte date not null default current_date,
  fecha_estimada_solucion date,
  fecha_atencion_estimada date,
  observaciones_internas text,
  presupuesto numeric(12, 2),
  factura numeric(12, 2),
  presupuesto_notas text,
  costo numeric(12, 2),
  gasto_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_owner_codigo_unique unique (owner_id, codigo),
  constraint tickets_estado_check
    check (estado in (
      'nuevo', 'asignado', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'
    )),
  constraint tickets_tipo_check
    check (tipo in (
      'plomeria', 'electricidad', 'cerrajeria', 'pintura', 'electrodomesticos',
      'muebles', 'internet_tecnologia', 'limpieza', 'humedad_filtraciones',
      'danos_estructurales', 'otro'
    )),
  constraint tickets_urgencia_check
    check (urgencia in ('baja', 'media', 'alta', 'critica'))
);

create index if not exists idx_tickets_owner on public.tickets_mantenimiento(owner_id);
create index if not exists idx_tickets_estado on public.tickets_mantenimiento(estado);
create index if not exists idx_tickets_propiedad on public.tickets_mantenimiento(propiedad_id);
create index if not exists idx_tickets_manitas on public.tickets_mantenimiento(manitas_id);
create index if not exists idx_tickets_urgencia on public.tickets_mantenimiento(urgencia);
create index if not exists idx_tickets_fecha_reporte on public.tickets_mantenimiento(fecha_reporte);

-- ------------------------------------------
-- Evidencias / fotos
-- ------------------------------------------
create table if not exists public.ticket_evidencias (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets_mantenimiento(id) on delete cascade,
  nombre_archivo text not null,
  storage_path text,
  url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_evidencias_ticket on public.ticket_evidencias(ticket_id);

-- ------------------------------------------
-- Comentarios internos
-- ------------------------------------------
create table if not exists public.ticket_comentarios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets_mantenimiento(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  contenido text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_comentarios_ticket on public.ticket_comentarios(ticket_id);

-- ------------------------------------------
-- Historial
-- ------------------------------------------
create table if not exists public.ticket_historial (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets_mantenimiento(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  created_at timestamptz not null default now(),
  constraint ticket_historial_tipo_check
    check (tipo in (
      'creado', 'estado', 'manitas_asignado', 'comentario', 'presupuesto',
      'trabajo_iniciado', 'resuelto', 'cerrado', 'cancelado'
    ))
);

create index if not exists idx_ticket_historial_ticket on public.ticket_historial(ticket_id);

-- ------------------------------------------
-- Triggers updated_at
-- ------------------------------------------
drop trigger if exists trg_manitas_updated_at on public.manitas;
create trigger trg_manitas_updated_at
  before update on public.manitas
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tickets_mantenimiento_updated_at on public.tickets_mantenimiento;
create trigger trg_tickets_mantenimiento_updated_at
  before update on public.tickets_mantenimiento
  for each row execute function public.set_updated_at();

-- ------------------------------------------
-- Funciones de acceso (después de las tablas)
-- ------------------------------------------
create or replace function public.user_can_access_ticket(p_ticket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tickets_mantenimiento t
    where t.id = p_ticket_id
      and public.user_can_access_propiedad(t.propiedad_id)
  );
$$;

create or replace function public.user_can_access_manitas(p_manitas_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.manitas m
    where m.id = p_manitas_id
      and public.user_can_access_inquilino(m.owner_id)
  );
$$;

-- ------------------------------------------
-- RLS
-- ------------------------------------------
alter table public.manitas enable row level security;
alter table public.tickets_mantenimiento enable row level security;
alter table public.ticket_evidencias enable row level security;
alter table public.ticket_comentarios enable row level security;
alter table public.ticket_historial enable row level security;

-- manitas
drop policy if exists "manitas_select" on public.manitas;
drop policy if exists "manitas_insert" on public.manitas;
drop policy if exists "manitas_update" on public.manitas;
drop policy if exists "manitas_delete" on public.manitas;

create policy "manitas_select" on public.manitas for select
  using (public.user_can_access_inquilino(owner_id));
create policy "manitas_insert" on public.manitas for insert
  with check (public.user_can_access_inquilino(owner_id));
create policy "manitas_update" on public.manitas for update
  using (public.user_can_access_inquilino(owner_id))
  with check (public.user_can_access_inquilino(owner_id));
create policy "manitas_delete" on public.manitas for delete
  using (public.user_can_access_inquilino(owner_id));

-- tickets
drop policy if exists "tickets_select" on public.tickets_mantenimiento;
drop policy if exists "tickets_insert" on public.tickets_mantenimiento;
drop policy if exists "tickets_update" on public.tickets_mantenimiento;
drop policy if exists "tickets_delete" on public.tickets_mantenimiento;

create policy "tickets_select" on public.tickets_mantenimiento for select
  using (public.user_can_access_propiedad(propiedad_id));
create policy "tickets_insert" on public.tickets_mantenimiento for insert
  with check (
    public.user_can_access_inquilino(owner_id)
    and public.user_can_access_propiedad(propiedad_id)
  );
create policy "tickets_update" on public.tickets_mantenimiento for update
  using (public.user_can_access_propiedad(propiedad_id))
  with check (public.user_can_access_propiedad(propiedad_id));
create policy "tickets_delete" on public.tickets_mantenimiento for delete
  using (public.user_can_access_propiedad(propiedad_id));

-- evidencias, comentarios, historial
drop policy if exists "ticket_evidencias_all" on public.ticket_evidencias;
create policy "ticket_evidencias_all" on public.ticket_evidencias for all
  using (public.user_can_access_ticket(ticket_id))
  with check (public.user_can_access_ticket(ticket_id));

drop policy if exists "ticket_comentarios_all" on public.ticket_comentarios;
create policy "ticket_comentarios_all" on public.ticket_comentarios for all
  using (public.user_can_access_ticket(ticket_id))
  with check (public.user_can_access_ticket(ticket_id));

drop policy if exists "ticket_historial_all" on public.ticket_historial;
create policy "ticket_historial_all" on public.ticket_historial for all
  using (public.user_can_access_ticket(ticket_id))
  with check (public.user_can_access_ticket(ticket_id));

-- ------------------------------------------
-- Storage: evidencias tickets
-- ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mantenimiento',
  'mantenimiento',
  false,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

drop policy if exists "mantenimiento_select" on storage.objects;
drop policy if exists "mantenimiento_insert" on storage.objects;
drop policy if exists "mantenimiento_update" on storage.objects;
drop policy if exists "mantenimiento_delete" on storage.objects;

create policy "mantenimiento_select" on storage.objects for select to authenticated
  using (bucket_id = 'mantenimiento' and split_part(name, '/', 1) = auth.uid()::text);

create policy "mantenimiento_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'mantenimiento' and split_part(name, '/', 1) = auth.uid()::text);

create policy "mantenimiento_update" on storage.objects for update to authenticated
  using (bucket_id = 'mantenimiento' and split_part(name, '/', 1) = auth.uid()::text);

create policy "mantenimiento_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'mantenimiento' and split_part(name, '/', 1) = auth.uid()::text);
