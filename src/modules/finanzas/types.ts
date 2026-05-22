export type MovimientoTipo = "ingreso" | "gasto";

export type MovimientoEstado = "pendiente" | "pagado" | "vencido" | "cancelado" | "parcial";

export type CategoriaIngreso =
  | "pago_arriendo"
  | "deposito_fianza"
  | "administracion_comunidad"
  | "servicios_publicos"
  | "penalizacion_mora"
  | "otro_ingreso";

export type CategoriaGasto =
  | "reparacion"
  | "mantenimiento"
  | "servicios_publicos"
  | "administracion_comunidad"
  | "impuestos"
  | "seguro"
  | "limpieza"
  | "comision"
  | "publicidad"
  | "reforma"
  | "otro_gasto";

export type MovimientoCategoria = CategoriaIngreso | CategoriaGasto;

export type MetodoPagoCodigo =
  | "transferencia"
  | "efectivo"
  | "tarjeta"
  | "bizum"
  | "domiciliacion"
  | "otro";

/** Estado visual del cobro de un mes de arriendo */
export type MesCobroEstado =
  | "pagado"
  | "pendiente"
  | "parcial"
  | "vencido"
  | "futuro"
  | "sin_registro"
  | "cancelado";

/** Resumen del contrato en la vista Pagos inquilinos */
export type ContratoCobroResumen = "al_dia" | "mora" | "parcial" | "pendiente_futuro";

export interface MovimientoFinanciero {
  id: string;
  owner_id?: string;
  propiedad_id: string;
  propiedad_nombre: string;
  contrato_id?: string | null;
  contrato_codigo?: string | null;
  inquilino_id?: string | null;
  inquilino_nombre?: string | null;
  ticket_id?: string | null;
  ticket_codigo?: string | null;
  manitas_id?: string | null;
  manitas_nombre?: string | null;
  tipo: MovimientoTipo;
  categoria: MovimientoCategoria;
  concepto: string;
  valor: number;
  valor_esperado?: number | null;
  estado: MovimientoEstado;
  metodo_pago?: MetodoPagoCodigo | null;
  fecha_movimiento: string;
  fecha_vencimiento?: string | null;
  fecha_pago?: string | null;
  mes_correspondiente?: string | null;
  presupuesto?: number | null;
  factura?: number | null;
  presupuesto_notas?: string | null;
  costo?: number | null;
  gasto_id?: string | null;
  comprobante_url?: string | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimientoFilters {
  search?: string;
  propiedad_id?: string;
  tipo?: MovimientoTipo | "";
  categoria?: string;
  estado?: MovimientoEstado | "";
  inquilino_id?: string;
  metodo_pago?: MetodoPagoCodigo | "";
  fecha_desde?: string;
  fecha_hasta?: string;
  solo_pagos_inquilinos?: boolean;
}

export interface ContabilidadTotales {
  ingresosPagados: number;
  gastosPagados: number;
  pendienteCobrar: number;
  pendientePagar: number;
  saldoNeto: number;
}

export interface ContratoOption {
  id: string;
  codigo: string;
  propiedad_id: string;
  inquilino_id: string;
  inquilino_nombre: string;
  valor_mensual: number;
}

export interface TicketOption {
  id: string;
  codigo: string;
  propiedad_id: string;
  titulo: string;
  costo?: number | null;
  manitas_id?: string | null;
}

export interface MesCobroInquilino {
  /** Primer día del mes YYYY-MM-01 */
  mes: string;
  etiqueta: string;
  estado: MesCobroEstado;
  valor_esperado: number;
  valor_pagado: number | null;
  fecha_vencimiento: string;
  movimiento_id?: string | null;
  es_mes_actual: boolean;
}

export interface ContratoPagosInquilino {
  contrato_id: string;
  codigo: string;
  propiedad_id: string;
  propiedad_nombre: string;
  inquilino_id: string;
  inquilino_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_mensual: number;
  dia_pago: number;
  resumen: ContratoCobroResumen;
  meses_vencidos: number;
  meses_pagados: number;
  meses_total: number;
  meses: MesCobroInquilino[];
}

export interface PagosInquilinosResumen {
  contratos: ContratoPagosInquilino[];
  total_contratos: number;
  al_dia: number;
  en_mora: number;
  parcial: number;
}
