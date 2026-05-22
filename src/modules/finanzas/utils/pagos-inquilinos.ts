import type {
  ContratoCobroResumen,
  ContratoPagosInquilino,
  MesCobroEstado,
  MesCobroInquilino,
  MovimientoFinanciero,
  PagosInquilinosResumen,
} from "../types";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export type ContratoPagosRow = {
  id: string;
  codigo: string;
  propiedad_id: string;
  propiedad_nombre: string;
  inquilino_id: string;
  inquilino_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_mensual: number;
  dia_pago: number;
};

function parseDateOnly(iso: string): Date {
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function etiquetaMes(mesIso: string): string {
  const [y, m] = mesIso.slice(0, 7).split("-").map(Number);
  return `${MESES_CORTOS[m - 1]} ${String(y).slice(-2)}`;
}

function dueDateForMonth(mesIso: string, diaPago: number): string {
  const [y, m] = mesIso.slice(0, 7).split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const day = Math.min(Math.max(1, diaPago), lastDay);
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Meses naturales entre inicio y fin (inclusive) por primer día del mes */
export function enumerateContractMonths(fechaInicio: string, fechaFin: string): string[] {
  const start = parseDateOnly(fechaInicio);
  const end = parseDateOnly(fechaFin);
  const months: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth() + 1;
  const endY = end.getFullYear();
  const endM = end.getMonth() + 1;

  while (y < endY || (y === endY && m <= endM)) {
    months.push(monthKey(y, m));
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

function normalizeMesCorrespondiente(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.slice(0, 7) + "-01";
}

function findMovimientoForMonth(
  movimientos: MovimientoFinanciero[],
  contrato: ContratoPagosRow,
  mes: string,
): MovimientoFinanciero | undefined {
  return movimientos.find((mov) => {
    if (normalizeMesCorrespondiente(mov.mes_correspondiente) !== mes) return false;
    if (mov.contrato_id === contrato.id) return true;
    return (
      mov.propiedad_id === contrato.propiedad_id &&
      mov.inquilino_id === contrato.inquilino_id
    );
  });
}

function resolveMesEstado(
  mes: string,
  diaPago: number,
  valorEsperado: number,
  mov: MovimientoFinanciero | undefined,
  hoy: string,
): MesCobroInquilino {
  const fechaVencimiento = dueDateForMonth(mes, diaPago);
  const hoyDate = parseDateOnly(hoy);
  const vencimientoDate = parseDateOnly(fechaVencimiento);
  const mesDate = parseDateOnly(mes);
  const [hy, hm] = hoy.slice(0, 7).split("-").map(Number);
  const esMesActual = mes === monthKey(hy, hm);

  if (!mov) {
    if (mesDate > hoyDate) {
      return {
        mes,
        etiqueta: etiquetaMes(mes),
        estado: "futuro",
        valor_esperado: valorEsperado,
        valor_pagado: null,
        fecha_vencimiento: fechaVencimiento,
        es_mes_actual: esMesActual,
      };
    }
    const estadoSinMov =
      vencimientoDate < hoyDate ? ("sin_registro" as MesCobroEstado) : ("pendiente" as MesCobroEstado);
    return {
      mes,
      etiqueta: etiquetaMes(mes),
      estado: estadoSinMov,
      valor_esperado: valorEsperado,
      valor_pagado: null,
      fecha_vencimiento: fechaVencimiento,
      es_mes_actual: esMesActual,
    };
  }

  const valorPagado = mov.valor;
  const esperado = mov.valor_esperado ?? valorEsperado;

  let estado: MesCobroEstado;
  if (mov.estado === "cancelado") estado = "cancelado";
  else if (mov.estado === "pagado") estado = "pagado";
  else if (mov.estado === "parcial") estado = "parcial";
  else if (mov.estado === "vencido") estado = "vencido";
  else if (mov.estado === "pendiente") {
    estado = vencimientoDate < hoyDate ? "vencido" : "pendiente";
  } else estado = "pendiente";

  if (estado === "pendiente" && vencimientoDate < hoyDate) estado = "vencido";

  return {
    mes,
    etiqueta: etiquetaMes(mes),
    estado,
    valor_esperado: esperado,
    valor_pagado: valorPagado,
    fecha_vencimiento: mov.fecha_vencimiento ?? fechaVencimiento,
    movimiento_id: mov.id,
    es_mes_actual: esMesActual,
  };
}

function computeContratoResumen(meses: MesCobroInquilino[], hoy: string): {
  resumen: ContratoCobroResumen;
  meses_vencidos: number;
  meses_pagados: number;
} {
  const hoyDate = parseDateOnly(hoy);
  let meses_vencidos = 0;
  let meses_pagados = 0;
  let tieneParcial = false;
  let tieneMora = false;
  let tienePendienteVencido = false;

  for (const mes of meses) {
    const mesDate = parseDateOnly(mes.mes);
    if (mesDate > hoyDate) continue;

    if (mes.estado === "pagado") meses_pagados += 1;
    if (mes.estado === "vencido" || mes.estado === "sin_registro") {
      meses_vencidos += 1;
      tieneMora = true;
    }
    if (mes.estado === "parcial") {
      tieneParcial = true;
      const venc = parseDateOnly(mes.fecha_vencimiento);
      if (venc < hoyDate) tieneMora = true;
    }
    if (mes.estado === "pendiente") {
      const venc = parseDateOnly(mes.fecha_vencimiento);
      if (venc < hoyDate) {
        tienePendienteVencido = true;
        tieneMora = true;
      }
    }
  }

  let resumen: ContratoCobroResumen = "al_dia";
  if (tieneMora || tienePendienteVencido || meses_vencidos > 0) resumen = "mora";
  else if (tieneParcial) resumen = "parcial";

  return { resumen, meses_vencidos, meses_pagados };
}

export function buildContratoPagosInquilino(
  contrato: ContratoPagosRow,
  movimientos: MovimientoFinanciero[],
  hoy = new Date().toISOString().slice(0, 10),
): ContratoPagosInquilino {
  const monthList = enumerateContractMonths(contrato.fecha_inicio, contrato.fecha_fin);
  const meses = monthList.map((mes) =>
    resolveMesEstado(
      mes,
      contrato.dia_pago,
      contrato.valor_mensual,
      findMovimientoForMonth(movimientos, contrato, mes),
      hoy,
    ),
  );

  const { resumen, meses_vencidos, meses_pagados } = computeContratoResumen(meses, hoy);

  return {
    contrato_id: contrato.id,
    codigo: contrato.codigo,
    propiedad_id: contrato.propiedad_id,
    propiedad_nombre: contrato.propiedad_nombre,
    inquilino_id: contrato.inquilino_id,
    inquilino_nombre: contrato.inquilino_nombre,
    fecha_inicio: contrato.fecha_inicio,
    fecha_fin: contrato.fecha_fin,
    valor_mensual: contrato.valor_mensual,
    dia_pago: contrato.dia_pago,
    resumen,
    meses_vencidos,
    meses_pagados,
    meses_total: meses.length,
    meses,
  };
}

export function buildPagosInquilinosResumen(
  contratos: ContratoPagosRow[],
  movimientos: MovimientoFinanciero[],
  hoy?: string,
): PagosInquilinosResumen {
  const built = contratos.map((c) => buildContratoPagosInquilino(c, movimientos, hoy));
  return {
    contratos: built,
    total_contratos: built.length,
    al_dia: built.filter((c) => c.resumen === "al_dia").length,
    en_mora: built.filter((c) => c.resumen === "mora").length,
    parcial: built.filter((c) => c.resumen === "parcial").length,
  };
}
