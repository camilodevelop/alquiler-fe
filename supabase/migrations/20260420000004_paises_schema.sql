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
