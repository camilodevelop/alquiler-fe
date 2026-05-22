-- Módulo contable: movimientos financieros (ingresos y gastos)

create table if not exists public.movimientos_financieros (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  propiedad_id uuid not null references public.propiedades(id) on delete restrict,
  contrato_id uuid references public.contratos(id) on delete set null,
  inquilino_id uuid references public.inquilinos(id) on delete set null,
  ticket_id uuid references public.tickets_mantenimiento(id) on delete set null,
  manitas_id uuid references public.manitas(id) on delete set null,
  tipo text not null,
  categoria text not null,
  concepto text not null,
  valor numeric(12, 2) not null check (valor > 0),
  valor_esperado numeric(12, 2) check (valor_esperado is null or valor_esperado > 0),
  estado text not null default 'pendiente',
  metodo_pago text,
  fecha_movimiento date not null default current_date,
  fecha_vencimiento date,
  fecha_pago date,
  mes_correspondiente date,
  comprobante_url text,
  comprobante_storage_path text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint movimientos_tipo_check check (tipo in ('ingreso', 'gasto')),
  constraint movimientos_estado_check
    check (estado in ('pendiente', 'pagado', 'vencido', 'cancelado', 'parcial')),
  constraint movimientos_categoria_ingreso_check check (
    tipo <> 'ingreso'
    or categoria in (
      'pago_arriendo',
      'deposito_fianza',
      'administracion_comunidad',
      'servicios_publicos',
      'penalizacion_mora',
      'otro_ingreso'
    )
  ),
  constraint movimientos_categoria_gasto_check check (
    tipo <> 'gasto'
    or categoria in (
      'reparacion',
      'mantenimiento',
      'servicios_publicos',
      'administracion_comunidad',
      'impuestos',
      'seguro',
      'limpieza',
      'comision',
      'publicidad',
      'reforma',
      'otro_gasto'
    )
  ),
  constraint movimientos_metodo_pago_check check (
    metodo_pago is null
    or metodo_pago in ('transferencia', 'efectivo', 'tarjeta', 'bizum', 'domiciliacion', 'otro')
  )
);

create index if not exists idx_movimientos_owner on public.movimientos_financieros(owner_id);
create index if not exists idx_movimientos_propiedad on public.movimientos_financieros(propiedad_id);
create index if not exists idx_movimientos_tipo on public.movimientos_financieros(tipo);
create index if not exists idx_movimientos_estado on public.movimientos_financieros(estado);
create index if not exists idx_movimientos_fecha on public.movimientos_financieros(fecha_movimiento);
create index if not exists idx_movimientos_contrato on public.movimientos_financieros(contrato_id);
create index if not exists idx_movimientos_inquilino on public.movimientos_financieros(inquilino_id);
create index if not exists idx_movimientos_ticket on public.movimientos_financieros(ticket_id);

drop trigger if exists trg_movimientos_financieros_updated_at on public.movimientos_financieros;
create trigger trg_movimientos_financieros_updated_at
  before update on public.movimientos_financieros
  for each row execute function public.set_updated_at();

-- Vínculo ticket → gasto
alter table public.tickets_mantenimiento
  drop constraint if exists tickets_mantenimiento_gasto_id_fkey;

alter table public.tickets_mantenimiento
  add constraint tickets_mantenimiento_gasto_id_fkey
  foreign key (gasto_id) references public.movimientos_financieros(id) on delete set null;

-- RLS
alter table public.movimientos_financieros enable row level security;

drop policy if exists "movimientos_select" on public.movimientos_financieros;
drop policy if exists "movimientos_insert" on public.movimientos_financieros;
drop policy if exists "movimientos_update" on public.movimientos_financieros;
drop policy if exists "movimientos_delete" on public.movimientos_financieros;

create policy "movimientos_select" on public.movimientos_financieros
  for select to authenticated
  using (public.user_can_access_propiedad(propiedad_id));

create policy "movimientos_insert" on public.movimientos_financieros
  for insert to authenticated
  with check (
    public.user_can_access_inquilino(owner_id)
    and public.user_can_access_propiedad(propiedad_id)
  );

create policy "movimientos_update" on public.movimientos_financieros
  for update to authenticated
  using (public.user_can_access_propiedad(propiedad_id))
  with check (public.user_can_access_propiedad(propiedad_id));

create policy "movimientos_delete" on public.movimientos_financieros
  for delete to authenticated
  using (public.user_can_access_propiedad(propiedad_id));

-- Storage comprobantes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'finanzas',
  'finanzas',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "finanzas_select" on storage.objects;
drop policy if exists "finanzas_insert" on storage.objects;
drop policy if exists "finanzas_update" on storage.objects;
drop policy if exists "finanzas_delete" on storage.objects;

create policy "finanzas_select" on storage.objects for select to authenticated
  using (bucket_id = 'finanzas' and split_part(name, '/', 1) = auth.uid()::text);

create policy "finanzas_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'finanzas' and split_part(name, '/', 1) = auth.uid()::text);

create policy "finanzas_update" on storage.objects for update to authenticated
  using (bucket_id = 'finanzas' and split_part(name, '/', 1) = auth.uid()::text);

create policy "finanzas_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'finanzas' and split_part(name, '/', 1) = auth.uid()::text);
