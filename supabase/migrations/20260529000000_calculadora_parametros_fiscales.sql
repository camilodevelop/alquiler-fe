-- ==========================================
-- Calculadora de Rentabilidad: Parámetros Fiscales
-- ==========================================

-- ------------------------------------------
-- Parámetros globales reutilizables
-- ------------------------------------------
create table if not exists public.parametros_generales (
  id   uuid    primary key default gen_random_uuid(),
  clave text   not null unique,
  valor text   not null,
  descripcion text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Solo lectura para todos los autenticados; escritura solo vía service role
alter table public.parametros_generales enable row level security;

create policy "parametros_generales_select"
  on public.parametros_generales for select
  to authenticated, anon
  using (true);

-- Seed: IVA obra nueva
insert into public.parametros_generales (clave, valor, descripcion) values
  ('iva_obra_nueva', '21', 'Porcentaje de IVA aplicable a obra nueva (%)')
on conflict (clave) do nothing;

-- ------------------------------------------
-- ITP por comunidad autónoma
-- ------------------------------------------
create table if not exists public.itp_comunidades_autonomas (
  id            uuid    primary key default gen_random_uuid(),
  nombre        text    not null unique,
  porcentaje    numeric(5, 2) not null check (porcentaje >= 0 and porcentaje <= 100),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.itp_comunidades_autonomas enable row level security;

create policy "itp_comunidades_select"
  on public.itp_comunidades_autonomas for select
  to authenticated, anon
  using (true);

-- Seed: 20 comunidades autónomas y ciudades con su ITP
insert into public.itp_comunidades_autonomas (nombre, porcentaje) values
  ('Andalucía',                8.0),
  ('Aragón',                   8.0),
  ('Asturias',                 8.0),
  ('Baleares',                 8.0),
  ('Cádiz',                    7.0),
  ('Cantabria',               10.0),
  ('Castilla - La Mancha',     9.0),
  ('Castilla León',            8.0),
  ('Cataluña',                10.0),
  ('Ceuta',                    6.0),
  ('Comunidad de Madrid',      6.0),
  ('Comunidad Valenciana',    10.0),
  ('Extremadura',              8.0),
  ('Galicia',                 10.0),
  ('La Rioja',                 7.0),
  ('Melilla',                  6.0),
  ('Murcia',                   8.0),
  ('Navarra',                  6.0),
  ('País Vasco',               4.0)
on conflict (nombre) do nothing;

-- ------------------------------------------
-- Tramos IRPF
-- ------------------------------------------
create table if not exists public.irpf_tramos (
  id              uuid    primary key default gen_random_uuid(),
  tramo           int     not null unique check (tramo > 0),
  descripcion     text    not null,
  base_desde      numeric(12, 2),          -- null = sin límite inferior (tramo 1)
  base_hasta      numeric(12, 2),          -- null = sin límite superior (último tramo)
  tipo_porcentaje numeric(5, 2) not null check (tipo_porcentaje >= 0 and tipo_porcentaje <= 100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.irpf_tramos enable row level security;

create policy "irpf_tramos_select"
  on public.irpf_tramos for select
  to authenticated, anon
  using (true);

-- Seed: 6 tramos IRPF España
insert into public.irpf_tramos (tramo, descripcion, base_desde, base_hasta, tipo_porcentaje) values
  (1, 'Hasta 12.450 €',              0,         12450.00,  19),
  (2, '12.450 € – 20.200 €',    12450.00,      20200.00,  24),
  (3, '20.200 € – 35.200 €',    20200.00,      35200.00,  30),
  (4, '35.200 € – 60.000 €',    35200.00,      60000.00,  37),
  (5, '60.000 € – 300.000 €',   60000.00,     300000.00,  45),
  (6, 'Más de 300.000 €',      300000.00,          null,  47)
on conflict (tramo) do nothing;
