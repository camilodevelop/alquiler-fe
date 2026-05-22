import type { ContabilidadTotales, MovimientoFinanciero } from "../types";

/** Totales excluyen movimientos cancelados */
export function computeContabilidadTotales(movimientos: MovimientoFinanciero[]): ContabilidadTotales {
  const activos = movimientos.filter((m) => m.estado !== "cancelado");

  const ingresosPagados = activos
    .filter((m) => m.tipo === "ingreso" && m.estado === "pagado")
    .reduce((s, m) => s + m.valor, 0);

  const gastosPagados = activos
    .filter((m) => m.tipo === "gasto" && m.estado === "pagado")
    .reduce((s, m) => s + m.valor, 0);

  const pendienteCobrar = activos
    .filter(
      (m) =>
        m.tipo === "ingreso" && (m.estado === "pendiente" || m.estado === "vencido" || m.estado === "parcial"),
    )
    .reduce((s, m) => {
      if (m.estado === "parcial" && m.valor_esperado != null) {
        return s + Math.max(0, m.valor_esperado - m.valor);
      }
      return s + (m.valor_esperado ?? m.valor);
    }, 0);

  const pendientePagar = activos
    .filter((m) => m.tipo === "gasto" && (m.estado === "pendiente" || m.estado === "vencido"))
    .reduce((s, m) => s + m.valor, 0);

  return {
    ingresosPagados,
    gastosPagados,
    pendienteCobrar,
    pendientePagar,
    saldoNeto: ingresosPagados - gastosPagados,
  };
}
