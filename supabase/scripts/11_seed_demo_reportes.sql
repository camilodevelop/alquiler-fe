-- ============================================================
-- SEED DEMO (ampliado) — Informes / Reportes / Contabilidad
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- Requisitos: módulos 02, 04, 05, 06, 10 aplicados.
-- Cuenta destino: juanprueba@yopmail.com (rol propietario)
-- Idempotente · Marcadores: [DEMO], DEMO-*, demo.*@rentyva.test
--
-- Volúmenes:
--   12 propiedades · 14 inquilinos · 5 manitas
--   12 contratos (8 activos) · 22 tickets
--   ~60+ movimientos (arriendos 6 meses + gastos)
-- ============================================================

-- ------------------------------------------------------------------
-- 1) Limpiar datos demo previos
-- ------------------------------------------------------------------
delete from public.movimientos_financieros
where concepto like '[DEMO]%'
   or contrato_id in (select id from public.contratos where codigo like 'DEMO-%')
   or ticket_id in (select id from public.tickets_mantenimiento where codigo like 'DEMO-%');

delete from public.ticket_historial
where ticket_id in (select id from public.tickets_mantenimiento where codigo like 'DEMO-%');
delete from public.ticket_comentarios
where ticket_id in (select id from public.tickets_mantenimiento where codigo like 'DEMO-%');
delete from public.ticket_evidencias
where ticket_id in (select id from public.tickets_mantenimiento where codigo like 'DEMO-%');

update public.tickets_mantenimiento set gasto_id = null where codigo like 'DEMO-%';
delete from public.tickets_mantenimiento where codigo like 'DEMO-%';

delete from public.contrato_historial
where contrato_id in (select id from public.contratos where codigo like 'DEMO-%');
delete from public.contrato_firmas
where contrato_id in (select id from public.contratos where codigo like 'DEMO-%');
delete from public.contratos where codigo like 'DEMO-%';

delete from public.inquilino_historial
where inquilino_id in (select id from public.inquilinos where email like 'demo.%@rentyva.test');
delete from public.inquilino_documentos
where inquilino_id in (select id from public.inquilinos where email like 'demo.%@rentyva.test');
delete from public.inquilino_scoring
where inquilino_id in (select id from public.inquilinos where email like 'demo.%@rentyva.test');
delete from public.inquilino_referencias
where inquilino_id in (select id from public.inquilinos where email like 'demo.%@rentyva.test');
delete from public.inquilinos where email like 'demo.%@rentyva.test';

delete from public.manitas where email like 'demo.manitas.%@rentyva.test';
delete from public.propiedades where titulo like '[DEMO]%';
delete from public.contrato_tipos where nombre like '[DEMO]%';

-- ------------------------------------------------------------------
-- 2) Insertar datos demo
-- ------------------------------------------------------------------
do $$
declare
  v_owner uuid;
  v_tipo uuid;
  v_plantilla text := '<h1>Contrato de arrendamiento</h1><p>Contrato demo Rentyva.</p>';

  -- Propiedades (12)
  p01 uuid := gen_random_uuid(); p02 uuid := gen_random_uuid(); p03 uuid := gen_random_uuid();
  p04 uuid := gen_random_uuid(); p05 uuid := gen_random_uuid(); p06 uuid := gen_random_uuid();
  p07 uuid := gen_random_uuid(); p08 uuid := gen_random_uuid(); p09 uuid := gen_random_uuid();
  p10 uuid := gen_random_uuid(); p11 uuid := gen_random_uuid(); p12 uuid := gen_random_uuid();

  -- Inquilinos (14)
  i01 uuid := gen_random_uuid(); i02 uuid := gen_random_uuid(); i03 uuid := gen_random_uuid();
  i04 uuid := gen_random_uuid(); i05 uuid := gen_random_uuid(); i06 uuid := gen_random_uuid();
  i07 uuid := gen_random_uuid(); i08 uuid := gen_random_uuid(); i09 uuid := gen_random_uuid();
  i10 uuid := gen_random_uuid(); i11 uuid := gen_random_uuid(); i12 uuid := gen_random_uuid();
  i13 uuid := gen_random_uuid(); i14 uuid := gen_random_uuid();

  -- Manitas (5)
  m01 uuid := gen_random_uuid(); m02 uuid := gen_random_uuid(); m03 uuid := gen_random_uuid();
  m04 uuid := gen_random_uuid(); m05 uuid := gen_random_uuid();

  -- Contratos (12)
  ca01 uuid := gen_random_uuid(); ca02 uuid := gen_random_uuid(); ca03 uuid := gen_random_uuid();
  ca04 uuid := gen_random_uuid(); ca05 uuid := gen_random_uuid(); ca06 uuid := gen_random_uuid();
  ca07 uuid := gen_random_uuid(); ca08 uuid := gen_random_uuid();
  cp01 uuid := gen_random_uuid(); cp02 uuid := gen_random_uuid();
  cf01 uuid := gen_random_uuid(); cf02 uuid := gen_random_uuid();

  -- Tickets (22)
  tk01 uuid := gen_random_uuid(); tk02 uuid := gen_random_uuid(); tk03 uuid := gen_random_uuid();
  tk04 uuid := gen_random_uuid(); tk05 uuid := gen_random_uuid(); tk06 uuid := gen_random_uuid();
  tk07 uuid := gen_random_uuid(); tk08 uuid := gen_random_uuid(); tk09 uuid := gen_random_uuid();
  tk10 uuid := gen_random_uuid(); tk11 uuid := gen_random_uuid(); tk12 uuid := gen_random_uuid();
  tk13 uuid := gen_random_uuid(); tk14 uuid := gen_random_uuid(); tk15 uuid := gen_random_uuid();
  tk16 uuid := gen_random_uuid(); tk17 uuid := gen_random_uuid(); tk18 uuid := gen_random_uuid();
  tk19 uuid := gen_random_uuid(); tk20 uuid := gen_random_uuid(); tk21 uuid := gen_random_uuid();
  tk22 uuid := gen_random_uuid();

  v_mes date;
  v_i int;
  v_estado text;
  v_rol text;
  rec record;
begin
  select id, rol::text into v_owner, v_rol
  from public.profiles
  where email = 'juanprueba@yopmail.com';

  if v_owner is null then
    raise exception 'No existe perfil con email juanprueba@yopmail.com. Regístrate con esa cuenta primero.';
  end if;
  if v_rol <> 'propietario' then
    raise exception 'juanprueba@yopmail.com debe tener rol propietario (actual: %)', v_rol;
  end if;

  raise notice 'Seed demo → juanprueba@yopmail.com (owner_id: %)', v_owner;

  insert into public.contrato_tipos (owner_id, nombre, descripcion, plantilla_html, activo)
  values (v_owner, '[DEMO] Arrendamiento estándar', 'Plantilla demo', v_plantilla, true)
  returning id into v_tipo;

  -- ========== 12 PROPIEDADES ==========
  insert into public.propiedades (
    id, owner_id, titulo, direccion, ciudad, codigo_postal, precio_mes,
    habitaciones, banos, metros_cuadrados, tipo_renta, tipo_propiedad, estado, pais_codigo
  ) values
    (p01, v_owner, '[DEMO] Piso Centro Madrid', 'Calle Mayor 12, 3ºA', 'Madrid', '28013', 950, 2, 1, 72, 'tradicional', 'apartamento', 'alquilada', 'ES'),
    (p02, v_owner, '[DEMO] Ático Diagonal BCN', 'Av. Diagonal 88, 2ºB', 'Barcelona', '08019', 1200, 3, 2, 95, 'tradicional', 'apartamento', 'alquilada', 'ES'),
    (p03, v_owner, '[DEMO] Estudio Plaza España', 'Plaza España 5, 1ºC', 'Madrid', '28008', 780, 1, 1, 38, 'temporal', 'apartaestudio', 'disponible', 'ES'),
    (p04, v_owner, '[DEMO] Casa Goya reforma', 'Calle Goya 31', 'Madrid', '28001', 1050, 4, 2, 110, 'tradicional', 'casa', 'mantenimiento', 'ES'),
    (p05, v_owner, '[DEMO] Habitaciones Castellana', 'Paseo Castellana 14', 'Madrid', '28046', 650, 5, 2, 140, 'habitaciones', 'apartamento', 'alquilada', 'ES'),
    (p06, v_owner, '[DEMO] Local Gran Vía', 'Gran Vía 42', 'Madrid', '28013', 1800, 0, 1, 55, 'comercial', 'local', 'disponible', 'ES'),
    (p07, v_owner, '[DEMO] Piso Salamanca', 'Calle Serrano 45, 1º', 'Madrid', '28001', 1100, 2, 2, 85, 'tradicional', 'apartamento', 'alquilada', 'ES'),
    (p08, v_owner, '[DEMO] Chalet Las Rozas', 'Av. Europa 8', 'Las Rozas', '28232', 1400, 4, 3, 180, 'tradicional', 'casa', 'alquilada', 'ES'),
    (p09, v_owner, '[DEMO] Loft Malasaña', 'Calle Manuela Malasaña 22', 'Madrid', '28004', 880, 1, 1, 52, 'tradicional', 'apartamento', 'alquilada', 'ES'),
    (p10, v_owner, '[DEMO] Garaje Nuevos Ministerios', 'C/ Ríos Rosas 18', 'Madrid', '28003', 120, 0, 0, 15, 'comercial', 'garaje', 'alquilada', 'ES'),
    (p11, v_owner, '[DEMO] Finca Toledo', 'Camino Viejo 3', 'Toledo', '45001', 750, 3, 2, 200, 'tradicional', 'finca', 'inactiva', 'ES'),
    (p12, v_owner, '[DEMO] Oficina AZCA', 'Paseo de la Castellana 50', 'Madrid', '28046', 2200, 0, 2, 120, 'comercial', 'oficina', 'alquilada', 'ES');

  -- ========== 14 INQUILINOS ==========
  insert into public.inquilinos (
    id, owner_id, nombres, apellidos, tipo_documento, numero_documento, telefono, email,
    status, propiedad_id, fecha_ingreso, canon_mensual, estado_pago, total_pagado, total_pendiente, pagos_vencidos
  ) values
    (i01, v_owner, 'Ana', 'García López', 'dni', 'DEMO10000001', '600111001', 'demo.ana@rentyva.test', 'activo', p01, current_date - 240, 950, 'al_dia', 7600, 0, 0),
    (i02, v_owner, 'Carlos', 'Martínez Ruiz', 'dni', 'DEMO10000002', '600111002', 'demo.carlos@rentyva.test', 'moroso', p02, current_date - 180, 1200, 'vencido', 4800, 2400, 2),
    (i03, v_owner, 'Laura', 'Sánchez Díaz', 'nie', 'DEMO10000003', '600111003', 'demo.laura@rentyva.test', 'activo', p05, current_date - 120, 650, 'al_dia', 2600, 0, 0),
    (i04, v_owner, 'Miguel', 'Torres Vega', 'dni', 'DEMO10000004', '600111004', 'demo.miguel@rentyva.test', 'candidato', null, null, null, 'pendiente', 0, 0, 0),
    (i05, v_owner, 'Elena', 'Romero Prieto', 'dni', 'DEMO10000005', '600111005', 'demo.elena@rentyva.test', 'en_revision', null, null, null, 'pendiente', 0, 0, 0),
    (i06, v_owner, 'Jorge', 'Navarro Gil', 'dni', 'DEMO10000006', '600111006', 'demo.jorge@rentyva.test', 'finalizado', p01, current_date - 800, 900, 'al_dia', 21600, 0, 0),
    (i07, v_owner, 'Sofía', 'Herrera Molina', 'pasaporte', 'DEMO10000007', '600111007', 'demo.sofia@rentyva.test', 'aprobado', null, null, null, 'pendiente', 0, 780, 0),
    (i08, v_owner, 'Pablo', 'Iglesias Mora', 'dni', 'DEMO10000008', '600111008', 'demo.pablo@rentyva.test', 'activo', p07, current_date - 200, 1100, 'al_dia', 6600, 0, 0),
    (i09, v_owner, 'María', 'López Castro', 'dni', 'DEMO10000009', '600111009', 'demo.maria@rentyva.test', 'activo', p08, current_date - 90, 1400, 'al_dia', 4200, 0, 0),
    (i10, v_owner, 'Diego', 'Ruiz Pardo', 'dni', 'DEMO10000010', '600111010', 'demo.diego@rentyva.test', 'activo', p09, current_date - 60, 880, 'pendiente', 1760, 880, 0),
    (i11, v_owner, 'Carmen', 'Vega Solís', 'nie', 'DEMO10000011', '600111011', 'demo.carmen@rentyva.test', 'activo', p10, current_date - 300, 120, 'al_dia', 3600, 0, 0),
    (i12, v_owner, 'Andrés', 'Muñoz León', 'dni', 'DEMO10000012', '600111012', 'demo.andres@rentyva.test', 'moroso', p12, current_date - 150, 2200, 'impagado', 6600, 4400, 3),
    (i13, v_owner, 'Lucía', 'Fernández Rey', 'dni', 'DEMO10000013', '600111013', 'demo.lucia@rentyva.test', 'activo', p12, current_date - 30, 2200, 'pendiente', 2200, 1100, 1),
    (i14, v_owner, 'Raúl', 'Ortega Núñez', 'dni', 'DEMO10000014', '600111014', 'demo.raul@rentyva.test', 'rechazado', null, null, null, 'pendiente', 0, 0, 0);

  insert into public.inquilino_scoring (inquilino_id, nivel, documentacion_completa, ingresos_suficientes, historial_pagos, referencias_positivas, estabilidad_laboral) values
    (i01, 'excelente', true, true, true, true, true),
    (i02, 'bajo', true, false, false, false, true),
    (i03, 'alto', true, true, true, true, true),
    (i04, 'sin_evaluar', false, false, false, false, false),
    (i05, 'medio', true, true, false, true, false),
    (i06, 'alto', true, true, true, true, true),
    (i07, 'medio', true, true, false, false, true),
    (i08, 'excelente', true, true, true, true, true),
    (i09, 'alto', true, true, true, true, true),
    (i10, 'medio', true, true, false, true, true),
    (i11, 'alto', true, true, true, true, false),
    (i12, 'bajo', true, false, false, false, false),
    (i13, 'medio', true, true, false, true, true),
    (i14, 'bajo', false, false, false, false, false);

  -- ========== 5 MANITAS ==========
  insert into public.manitas (id, owner_id, nombres, apellidos, telefono, email, especialidad, zona_cobertura, estado, rating) values
    (m01, v_owner, 'Pedro', 'Fontanero', '600222001', 'demo.manitas.pedro@rentyva.test', 'plomeria', 'Madrid centro', 'disponible', 4.85),
    (m02, v_owner, 'Rosa', 'Electro', '600222002', 'demo.manitas.rosa@rentyva.test', 'electricidad', 'Madrid y BCN', 'ocupado', 4.50),
    (m03, v_owner, 'Luis', 'Multi', '600222003', 'demo.manitas.luis@rentyva.test', 'general', 'Comunidad de Madrid', 'disponible', 4.20),
    (m04, v_owner, 'Ana', 'Pintura Pro', '600222004', 'demo.manitas.ana@rentyva.test', 'pintura', 'Madrid norte', 'disponible', 4.65),
    (m05, v_owner, 'Marcos', 'Cerrajería', '600222005', 'demo.manitas.marcos@rentyva.test', 'cerrajeria', 'Madrid', 'ocupado', 4.35);

  -- ========== 12 CONTRATOS (8 activos + 4 históricos/pendientes) ==========
  insert into public.contratos (
    id, owner_id, codigo, tipo_contrato_id, propiedad_id, inquilino_id,
    fecha_inicio, fecha_fin, valor_mensual, deposito, dia_pago, plantilla_html, contenido_generado, estado
  ) values
    (ca01, v_owner, 'DEMO-CON-001', v_tipo, p01, i01, current_date - 240, current_date + 240, 950, 1900, 5, v_plantilla, v_plantilla, 'activo'),
    (ca02, v_owner, 'DEMO-CON-002', v_tipo, p02, i02, current_date - 180, current_date + 30, 1200, 2400, 1, v_plantilla, v_plantilla, 'activo'),
    (ca03, v_owner, 'DEMO-CON-003', v_tipo, p05, i03, current_date - 120, current_date + 600, 650, 1300, 10, v_plantilla, v_plantilla, 'activo'),
    (ca04, v_owner, 'DEMO-CON-004', v_tipo, p07, i08, current_date - 200, current_date + 400, 1100, 2200, 3, v_plantilla, v_plantilla, 'activo'),
    (ca05, v_owner, 'DEMO-CON-005', v_tipo, p08, i09, current_date - 90, current_date + 630, 1400, 2800, 7, v_plantilla, v_plantilla, 'activo'),
    (ca06, v_owner, 'DEMO-CON-006', v_tipo, p09, i10, current_date - 60, current_date + 300, 880, 1760, 15, v_plantilla, v_plantilla, 'activo'),
    (ca07, v_owner, 'DEMO-CON-007', v_tipo, p10, i11, current_date - 300, current_date + 365, 120, 240, 1, v_plantilla, v_plantilla, 'activo'),
    (ca08, v_owner, 'DEMO-CON-008', v_tipo, p12, i12, current_date - 150, current_date + 210, 2200, 4400, 5, v_plantilla, v_plantilla, 'activo'),
    (cp01, v_owner, 'DEMO-CON-009', v_tipo, p03, i07, current_date + 15, current_date + 380, 780, 1560, 3, v_plantilla, v_plantilla, 'pendiente_firma'),
    (cp02, v_owner, 'DEMO-CON-010', v_tipo, p06, i04, current_date + 30, current_date + 390, 1800, 3600, 1, v_plantilla, v_plantilla, 'firmado'),
    (cf01, v_owner, 'DEMO-CON-011', v_tipo, p01, i06, current_date - 800, current_date - 400, 900, 1800, 5, v_plantilla, v_plantilla, 'finalizado'),
    (cf02, v_owner, 'DEMO-CON-012', v_tipo, p11, i14, current_date - 400, current_date - 100, 750, 1500, 1, v_plantilla, v_plantilla, 'cancelado');

  insert into public.contrato_firmas (contrato_id, rol, firmante_nombre, estado, fecha_firma)
  select c.id, f.rol, f.nombre, f.est, f.fecha
  from public.contratos c
  join (values
    ('DEMO-CON-001', 'administrador', 'Gestor Demo', 'firmado', now() - interval '8 months'),
    ('DEMO-CON-001', 'inquilino', 'Ana García', 'firmado', now() - interval '8 months'),
    ('DEMO-CON-002', 'administrador', 'Gestor Demo', 'firmado', now() - interval '6 months'),
    ('DEMO-CON-002', 'inquilino', 'Carlos Martínez', 'firmado', now() - interval '6 months'),
    ('DEMO-CON-003', 'administrador', 'Gestor Demo', 'firmado', now() - interval '4 months'),
    ('DEMO-CON-003', 'inquilino', 'Laura Sánchez', 'firmado', now() - interval '4 months'),
    ('DEMO-CON-004', 'administrador', 'Gestor Demo', 'firmado', now() - interval '7 months'),
    ('DEMO-CON-004', 'inquilino', 'Pablo Iglesias', 'firmado', now() - interval '7 months'),
    ('DEMO-CON-005', 'administrador', 'Gestor Demo', 'firmado', now() - interval '3 months'),
    ('DEMO-CON-005', 'inquilino', 'María López', 'firmado', now() - interval '3 months'),
    ('DEMO-CON-006', 'administrador', 'Gestor Demo', 'firmado', now() - interval '2 months'),
    ('DEMO-CON-006', 'inquilino', 'Diego Ruiz', 'firmado', now() - interval '2 months'),
    ('DEMO-CON-007', 'administrador', 'Gestor Demo', 'firmado', now() - interval '10 months'),
    ('DEMO-CON-007', 'inquilino', 'Carmen Vega', 'firmado', now() - interval '10 months'),
    ('DEMO-CON-008', 'administrador', 'Gestor Demo', 'firmado', now() - interval '5 months'),
    ('DEMO-CON-008', 'inquilino', 'Andrés Muñoz', 'firmado', now() - interval '5 months'),
    ('DEMO-CON-009', 'administrador', 'Gestor Demo', 'firmado', now()),
    ('DEMO-CON-009', 'inquilino', 'Sofía Herrera', 'pendiente', null),
    ('DEMO-CON-010', 'administrador', 'Gestor Demo', 'firmado', now()),
    ('DEMO-CON-010', 'inquilino', 'Miguel Torres', 'firmado', now()),
    ('DEMO-CON-011', 'administrador', 'Gestor Demo', 'firmado', now() - interval '24 months'),
    ('DEMO-CON-011', 'inquilino', 'Jorge Navarro', 'firmado', now() - interval '24 months')
  ) as f(codigo, rol, nombre, est, fecha) on c.codigo = f.codigo;

  insert into public.contrato_historial (contrato_id, tipo, descripcion)
  select id, 'creado', '[DEMO] Alta contrato' from public.contratos where codigo like 'DEMO-%';

  -- ========== 22 TICKETS ==========
  insert into public.tickets_mantenimiento (
    id, owner_id, codigo, propiedad_id, inquilino_id, manitas_id, tipo, urgencia, estado,
    titulo, descripcion, fecha_reporte, costo, created_at, updated_at
  ) values
    (tk01, v_owner, 'DEMO-TKT-001', p04, null, m01, 'plomeria', 'alta', 'en_proceso', 'Fuga baño', '[DEMO]', current_date - 12, 320, now() - interval '12 days', now() - interval '2 days'),
    (tk02, v_owner, 'DEMO-TKT-002', p01, i01, m02, 'electricidad', 'media', 'asignado', 'Enchufe cocina', '[DEMO]', current_date - 5, null, now() - interval '5 days', now() - interval '5 days'),
    (tk03, v_owner, 'DEMO-TKT-003', p02, i02, m05, 'cerrajeria', 'critica', 'nuevo', 'Puerta atascada', '[DEMO]', current_date, null, now() - interval '1 day', now() - interval '1 day'),
    (tk04, v_owner, 'DEMO-TKT-004', p01, i01, m04, 'pintura', 'baja', 'resuelto', 'Pintura salón', '[DEMO]', current_date - 25, 180, now() - interval '25 days', now() - interval '18 days'),
    (tk05, v_owner, 'DEMO-TKT-005', p05, i03, m03, 'limpieza', 'baja', 'cerrado', 'Limpieza hab.', '[DEMO]', current_date - 40, 95, now() - interval '40 days', now() - interval '35 days'),
    (tk06, v_owner, 'DEMO-TKT-006', p02, i02, null, 'humedad_filtraciones', 'alta', 'nuevo', 'Humedad techo', '[DEMO]', current_date - 3, null, now() - interval '3 days', now() - interval '3 days'),
    (tk07, v_owner, 'DEMO-TKT-007', p04, null, m02, 'electricidad', 'media', 'resuelto', 'Luminarias', '[DEMO]', current_date - 20, 240, now() - interval '20 days', now() - interval '14 days'),
    (tk08, v_owner, 'DEMO-TKT-008', p07, i08, m01, 'plomeria', 'media', 'en_proceso', 'Grifo cocina', '[DEMO]', current_date - 8, null, now() - interval '8 days', now() - interval '3 days'),
    (tk09, v_owner, 'DEMO-TKT-009', p08, i09, m03, 'electrodomesticos', 'alta', 'asignado', 'Caldera avería', '[DEMO]', current_date - 6, null, now() - interval '6 days', now() - interval '6 days'),
    (tk10, v_owner, 'DEMO-TKT-010', p09, i10, m04, 'pintura', 'baja', 'resuelto', 'Habitación', '[DEMO]', current_date - 30, 150, now() - interval '30 days', now() - interval '22 days'),
    (tk11, v_owner, 'DEMO-TKT-011', p12, i12, m02, 'internet_tecnologia', 'media', 'cerrado', 'Router oficina', '[DEMO]', current_date - 45, 85, now() - interval '45 days', now() - interval '40 days'),
    (tk12, v_owner, 'DEMO-TKT-012', p03, null, null, 'otro', 'baja', 'nuevo', 'Revisión estudio', '[DEMO]', current_date - 2, null, now() - interval '2 days', now() - interval '2 days'),
    (tk13, v_owner, 'DEMO-TKT-013', p06, null, m03, 'limpieza', 'media', 'cancelado', 'Limpieza local', '[DEMO]', current_date - 10, null, now() - interval '10 days', now() - interval '9 days'),
    (tk14, v_owner, 'DEMO-TKT-014', p07, i08, m05, 'cerrajeria', 'alta', 'resuelto', 'Cerradura puerta', '[DEMO]', current_date - 15, 95, now() - interval '15 days', now() - interval '10 days'),
    (tk15, v_owner, 'DEMO-TKT-015', p08, i09, m01, 'plomeria', 'critica', 'cerrado', 'Tubería rota', '[DEMO]', current_date - 55, 410, now() - interval '55 days', now() - interval '48 days'),
    (tk16, v_owner, 'DEMO-TKT-016', p10, i11, null, 'otro', 'baja', 'nuevo', 'Remote garaje', '[DEMO]', current_date - 4, null, now() - interval '4 days', now() - interval '4 days'),
    (tk17, v_owner, 'DEMO-TKT-017', p01, i01, m03, 'muebles', 'media', 'en_proceso', 'Armario roto', '[DEMO]', current_date - 9, null, now() - interval '9 days', now() - interval '4 days'),
    (tk18, v_owner, 'DEMO-TKT-018', p05, i03, m02, 'electricidad', 'alta', 'resuelto', 'Placa vitro', '[DEMO]', current_date - 22, 275, now() - interval '22 days', now() - interval '16 days'),
    (tk19, v_owner, 'DEMO-TKT-019', p12, i13, m04, 'pintura', 'baja', 'asignado', 'Recepción', '[DEMO]', current_date - 7, null, now() - interval '7 days', now() - interval '7 days'),
    (tk20, v_owner, 'DEMO-TKT-020', p09, i10, null, 'humedad_filtraciones', 'media', 'nuevo', 'Filtración ventana', '[DEMO]', current_date - 1, null, now() - interval '1 day', now() - interval '1 day'),
    (tk21, v_owner, 'DEMO-TKT-021', p04, null, m01, 'danos_estructurales', 'critica', 'en_proceso', 'Grieta muro', '[DEMO]', current_date - 18, null, now() - interval '18 days', now() - interval '5 days'),
    (tk22, v_owner, 'DEMO-TKT-022', p02, i02, m02, 'limpieza', 'baja', 'cerrado', 'Post-obra', '[DEMO]', current_date - 60, 70, now() - interval '60 days', now() - interval '55 days');

  insert into public.ticket_historial (ticket_id, tipo, descripcion)
  select id, 'creado', '[DEMO] Ticket registrado' from public.tickets_mantenimiento where codigo like 'DEMO-TKT-%' and codigo in ('DEMO-TKT-001', 'DEMO-TKT-004', 'DEMO-TKT-015');

  -- ========== MOVIMIENTOS — 6 meses × 8 contratos activos ==========
  for v_i in 0..5 loop
    v_mes := (date_trunc('month', current_date)::date - (v_i || ' months')::interval)::date;

    for rec in
      select * from (values
        (ca01, p01, i01, 950::numeric, 5),
        (ca02, p02, i02, 1200::numeric, 1),
        (ca03, p05, i03, 650::numeric, 10),
        (ca04, p07, i08, 1100::numeric, 3),
        (ca05, p08, i09, 1400::numeric, 7),
        (ca06, p09, i10, 880::numeric, 15),
        (ca07, p10, i11, 120::numeric, 1),
        (ca08, p12, i12, 2200::numeric, 5)
      ) as t(c_id, p_id, i_id, canon, dia_pago)
    loop
      -- Morosos: BCN y oficina — 2 meses sin pagar
      if rec.c_id in (ca02, ca08) and v_i <= 1 then
        v_estado := case when v_i = 0 then 'vencido' else 'pendiente' end;
        insert into public.movimientos_financieros (
          owner_id, propiedad_id, contrato_id, inquilino_id, tipo, categoria, concepto,
          valor, valor_esperado, estado, metodo_pago, fecha_movimiento, fecha_vencimiento, mes_correspondiente
        ) values (
          v_owner, rec.p_id, rec.c_id, rec.i_id, 'ingreso', 'pago_arriendo',
          '[DEMO] Arriendo ' || to_char(v_mes, 'TMMonth YYYY'),
          rec.canon, rec.canon, v_estado, 'transferencia',
          v_mes + rec.dia_pago, v_mes + rec.dia_pago, v_mes
        );
      elsif rec.c_id = ca06 and v_i = 0 then
        insert into public.movimientos_financieros (
          owner_id, propiedad_id, contrato_id, inquilino_id, tipo, categoria, concepto,
          valor, valor_esperado, estado, metodo_pago, fecha_movimiento, fecha_pago, mes_correspondiente
        ) values (
          v_owner, rec.p_id, rec.c_id, rec.i_id, 'ingreso', 'pago_arriendo',
          '[DEMO] Arriendo ' || to_char(v_mes, 'TMMonth YYYY'),
          440, rec.canon, 'parcial', 'bizum', v_mes + 15, v_mes + 16, v_mes
        );
      else
        insert into public.movimientos_financieros (
          owner_id, propiedad_id, contrato_id, inquilino_id, tipo, categoria, concepto,
          valor, valor_esperado, estado, metodo_pago, fecha_movimiento, fecha_pago, mes_correspondiente
        ) values (
          v_owner, rec.p_id, rec.c_id, rec.i_id, 'ingreso', 'pago_arriendo',
          '[DEMO] Arriendo ' || to_char(v_mes, 'TMMonth YYYY'),
          rec.canon, rec.canon, 'pagado', 'transferencia',
          v_mes + rec.dia_pago, v_mes + rec.dia_pago + 2, v_mes
        );
      end if;
    end loop;
  end loop;

  -- Penalizaciones mora
  insert into public.movimientos_financieros (owner_id, propiedad_id, contrato_id, inquilino_id, tipo, categoria, concepto, valor, estado, fecha_movimiento, mes_correspondiente) values
    (v_owner, p02, ca02, i02, 'ingreso', 'penalizacion_mora', '[DEMO] Mora BCN', 80, 'pendiente', current_date - 10, date_trunc('month', current_date)::date),
    (v_owner, p12, ca08, i12, 'ingreso', 'penalizacion_mora', '[DEMO] Mora oficina', 120, 'vencido', current_date - 20, date_trunc('month', current_date)::date);

  -- Gastos vinculados a tickets y operativos
  insert into public.movimientos_financieros (owner_id, propiedad_id, ticket_id, manitas_id, tipo, categoria, concepto, valor, estado, metodo_pago, fecha_movimiento, fecha_pago) values
    (v_owner, p04, tk01, m01, 'gasto', 'reparacion', '[DEMO] Fontanería Goya', 320, 'pagado', 'transferencia', current_date - 10, current_date - 8),
    (v_owner, p01, tk04, m04, 'gasto', 'mantenimiento', '[DEMO] Pintura Centro', 180, 'pagado', 'efectivo', current_date - 18, current_date - 17),
    (v_owner, p04, tk07, m02, 'gasto', 'reparacion', '[DEMO] Luz pasillo Goya', 240, 'pagado', 'transferencia', current_date - 14, current_date - 12),
    (v_owner, p08, tk15, m01, 'gasto', 'reparacion', '[DEMO] Tubería chalet', 410, 'pagado', 'transferencia', current_date - 48, current_date - 45),
    (v_owner, p05, tk18, m02, 'gasto', 'reparacion', '[DEMO] Vitro habitaciones', 275, 'pagado', 'tarjeta', current_date - 16, current_date - 14),
    (v_owner, p07, tk14, m05, 'gasto', 'reparacion', '[DEMO] Cerradura Salamanca', 95, 'pagado', 'efectivo', current_date - 10, current_date - 9),
    (v_owner, p02, null, null, 'gasto', 'administracion_comunidad', '[DEMO] Comunidad BCN', 195, 'pagado', 'domiciliacion', current_date - 25, current_date - 24),
    (v_owner, p07, null, null, 'gasto', 'administracion_comunidad', '[DEMO] Comunidad Salamanca', 165, 'pagado', 'domiciliacion', current_date - 25, current_date - 24),
    (v_owner, p01, null, null, 'gasto', 'seguro', '[DEMO] Seguro hogar p01', 48, 'pagado', 'transferencia', current_date - 30, current_date - 28),
    (v_owner, p08, null, null, 'gasto', 'seguro', '[DEMO] Seguro hogar p08', 62, 'pagado', 'transferencia', current_date - 30, current_date - 28),
    (v_owner, p12, null, null, 'gasto', 'seguro', '[DEMO] Seguro oficina', 90, 'pagado', 'transferencia', current_date - 28, current_date - 26),
    (v_owner, p03, null, null, 'gasto', 'publicidad', '[DEMO] Anuncio Idealista', 120, 'pendiente', null, current_date - 5, null),
    (v_owner, p06, null, null, 'gasto', 'impuestos', '[DEMO] IBI local', 420, 'pendiente', null, current_date - 3, null),
    (v_owner, p09, null, null, 'gasto', 'limpieza', '[DEMO] Limpieza loft', 75, 'pagado', 'efectivo', current_date - 12, current_date - 11),
    (v_owner, p05, null, null, 'gasto', 'comision', '[DEMO] Comisión gestión', 130, 'pagado', 'transferencia', current_date - 35, current_date - 34);

  -- Ingresos pendientes / otros
  insert into public.movimientos_financieros (owner_id, propiedad_id, tipo, categoria, concepto, valor, valor_esperado, estado, fecha_movimiento, fecha_vencimiento) values
    (v_owner, p03, 'ingreso', 'otro_ingreso', '[DEMO] Reserva estudio', 390, 390, 'pendiente', current_date - 7, current_date + 7),
    (v_owner, p06, 'ingreso', 'deposito_fianza', '[DEMO] Fianza local (pendiente)', 3600, 3600, 'pendiente', current_date - 2, current_date + 14);

  insert into public.movimientos_financieros (owner_id, propiedad_id, tipo, categoria, concepto, valor, estado, metodo_pago, fecha_movimiento, fecha_pago) values
    (v_owner, p12, 'ingreso', 'servicios_publicos', '[DEMO] Reembolso luz oficina', 145, 'pagado', 'transferencia', current_date - 8, current_date - 5);

  raise notice '✓ Seed ampliado: 12 propiedades, 14 inquilinos, 12 contratos, 22 tickets, 5 manitas, ~60+ movimientos.';
  raise notice '  Cuenta: juanprueba@yopmail.com (id: %) → /dashboard/informes', v_owner;
end $$;

-- Resumen
select 'propiedades' as entidad, count(*) as total from public.propiedades where titulo like '[DEMO]%'
union all select 'inquilinos', count(*) from public.inquilinos where email like 'demo.%@rentyva.test'
union all select 'contratos', count(*) from public.contratos where codigo like 'DEMO-%'
union all select 'tickets', count(*) from public.tickets_mantenimiento where codigo like 'DEMO-%'
union all select 'manitas', count(*) from public.manitas where email like 'demo.manitas.%@rentyva.test'
union all select 'movimientos', count(*) from public.movimientos_financieros where concepto like '[DEMO]%'
order by entidad;
