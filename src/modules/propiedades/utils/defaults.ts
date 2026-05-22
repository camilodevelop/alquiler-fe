import type { PropiedadFormValues } from "@/shared/schemas/propiedad";
import type { Propiedad } from "../types";

export const PROPIEDAD_FORM_DEFAULTS: PropiedadFormValues = {
  titulo: "",
  descripcion: "",
  tipo_propiedad: "apartamento",
  tipo_renta: "tradicional",
  direccion: "",
  ciudad: "",
  codigo_postal: "",
  precio_mes: 0,
  estado: "disponible",
  habitaciones: 1,
  banos: 1,
};

export function propiedadToFormValues(propiedad: Propiedad): PropiedadFormValues {
  return {
    titulo: propiedad.titulo,
    descripcion: propiedad.descripcion ?? "",
    tipo_propiedad: propiedad.tipo_propiedad,
    tipo_renta: propiedad.tipo_renta,
    direccion: propiedad.direccion,
    ciudad: propiedad.ciudad,
    codigo_postal: propiedad.codigo_postal,
    precio_mes: propiedad.precio_mes,
    estado: propiedad.estado,
    habitaciones: propiedad.habitaciones,
    banos: propiedad.banos,
    metros_cuadrados: propiedad.metros_cuadrados ?? undefined,
    duracion_minima_dias: propiedad.duracion_minima_dias ?? undefined,
  };
}

export function formValuesToDbPayload(
  values: PropiedadFormValues,
  ownerId: string,
  paisCodigo: string,
) {
  return {
    owner_id: ownerId,
    titulo: values.titulo,
    descripcion: values.descripcion?.trim() || null,
    tipo_propiedad: values.tipo_propiedad,
    tipo_renta: values.tipo_renta,
    direccion: values.direccion,
    ciudad: values.ciudad,
    codigo_postal: values.codigo_postal,
    precio_mes: values.precio_mes,
    estado: values.estado,
    habitaciones: values.habitaciones ?? 0,
    banos: values.banos ?? 1,
    metros_cuadrados: values.metros_cuadrados ?? null,
    duracion_minima_dias: values.duracion_minima_dias ?? null,
    pais_codigo: paisCodigo,
  };
}
