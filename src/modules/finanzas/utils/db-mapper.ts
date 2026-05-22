import type { MovimientoFinanciero } from "../types";

export type MovimientoJoinRow = {
  id: string;
  owner_id: string;
  propiedad_id: string;
  contrato_id: string | null;
  inquilino_id: string | null;
  ticket_id: string | null;
  manitas_id: string | null;
  tipo: string;
  categoria: string;
  concepto: string;
  valor: number;
  valor_esperado: number | null;
  estado: string;
  metodo_pago: string | null;
  fecha_movimiento: string;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
  mes_correspondiente: string | null;
  comprobante_url: string | null;
  comprobante_storage_path: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  propiedades?: { titulo: string } | null;
  contratos?: { codigo: string } | null;
  inquilinos?: { nombres: string; apellidos: string } | null;
  tickets_mantenimiento?: { codigo: string } | null;
  manitas?: { nombres: string; apellidos: string } | null;
};

function personLabel(p?: { nombres: string; apellidos: string } | null): string | null {
  if (!p) return null;
  return `${p.nombres} ${p.apellidos}`.trim();
}

export function mapMovimientoFromDb(row: MovimientoJoinRow): MovimientoFinanciero {
  return {
    id: row.id,
    owner_id: row.owner_id,
    propiedad_id: row.propiedad_id,
    propiedad_nombre: row.propiedades?.titulo ?? "—",
    contrato_id: row.contrato_id,
    contrato_codigo: row.contratos?.codigo ?? null,
    inquilino_id: row.inquilino_id,
    inquilino_nombre: personLabel(row.inquilinos),
    ticket_id: row.ticket_id,
    ticket_codigo: row.tickets_mantenimiento?.codigo ?? null,
    manitas_id: row.manitas_id,
    manitas_nombre: personLabel(row.manitas),
    tipo: row.tipo as MovimientoFinanciero["tipo"],
    categoria: row.categoria as MovimientoFinanciero["categoria"],
    concepto: row.concepto,
    valor: Number(row.valor),
    valor_esperado: row.valor_esperado != null ? Number(row.valor_esperado) : null,
    estado: row.estado as MovimientoFinanciero["estado"],
    metodo_pago: row.metodo_pago as MovimientoFinanciero["metodo_pago"],
    fecha_movimiento: row.fecha_movimiento,
    fecha_vencimiento: row.fecha_vencimiento,
    fecha_pago: row.fecha_pago,
    mes_correspondiente: row.mes_correspondiente,
    comprobante_url: row.comprobante_url,
    observaciones: row.observaciones,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
