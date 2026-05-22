import type { Inquilino, InquilinoFilters } from "../types";
import { nombreCompleto } from "./labels";

export function hasActiveFilters(f: InquilinoFilters): boolean {
  return !!(
    f.search?.trim() ||
    f.status ||
    f.propiedad_id ||
    f.tipo_renta ||
    f.estado_pago ||
    f.fecha_ingreso_desde ||
    f.fecha_ingreso_hasta ||
    f.scoring
  );
}

export function filterInquilinos(items: Inquilino[], f: InquilinoFilters): Inquilino[] {
  let result = [...items];

  if (f.status) result = result.filter((i) => i.status === f.status);
  if (f.propiedad_id) {
    result = result.filter((i) => i.asignacion?.propiedad_id === f.propiedad_id);
  }
  if (f.tipo_renta) {
    result = result.filter((i) => i.asignacion?.tipo_renta === f.tipo_renta);
  }
  if (f.estado_pago) {
    result = result.filter((i) => i.pago_resumen.estado === f.estado_pago);
  }
  if (f.scoring) {
    result = result.filter((i) => (i.scoring?.nivel ?? "sin_evaluar") === f.scoring);
  }
  if (f.fecha_ingreso_desde) {
    result = result.filter(
      (i) => i.asignacion?.fecha_ingreso && i.asignacion.fecha_ingreso >= f.fecha_ingreso_desde!,
    );
  }
  if (f.fecha_ingreso_hasta) {
    result = result.filter(
      (i) => i.asignacion?.fecha_ingreso && i.asignacion.fecha_ingreso <= f.fecha_ingreso_hasta!,
    );
  }

  if (f.search?.trim()) {
    const q = f.search.toLowerCase();
    result = result.filter(
      (i) =>
        nombreCompleto(i.nombres, i.apellidos).toLowerCase().includes(q) ||
        i.numero_documento.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.telefono.includes(q),
    );
  }

  return result;
}
