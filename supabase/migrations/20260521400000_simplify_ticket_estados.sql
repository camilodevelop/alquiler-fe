-- Simplificar estados de tickets a 6 valores

update public.tickets_mantenimiento
set estado = case estado
  when 'pendiente_revision' then 'nuevo'
  when 'en_espera_repuesto' then 'en_proceso'
  when 'en_espera_aprobacion' then 'en_proceso'
  else estado
end
where estado in ('pendiente_revision', 'en_espera_repuesto', 'en_espera_aprobacion');

alter table public.tickets_mantenimiento
  drop constraint if exists tickets_estado_check;

alter table public.tickets_mantenimiento
  add constraint tickets_estado_check
  check (estado in (
    'nuevo', 'asignado', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'
  ));
