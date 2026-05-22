-- Costo de reparación al resolver ticket (futuro vínculo con gastos)
-- Ejecutar tras 06_modulo_mantenimiento.sql

alter table public.tickets_mantenimiento
  add column if not exists costo numeric(12, 2);

comment on column public.tickets_mantenimiento.costo is
  'Coste real de la reparación al resolver; previsto para vincular a un gasto.';

-- Reservado para módulo de gastos (sin FK hasta exista la tabla)
alter table public.tickets_mantenimiento
  add column if not exists gasto_id uuid;

comment on column public.tickets_mantenimiento.gasto_id is
  'Referencia opcional al gasto contable asociado (módulo finanzas).';
