"use client";

import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type {
  Contract,
  ContractFormInput,
  ContractHistorialEntry,
  ContractSignature,
  ContractStatus,
  ContractTemplate,
  SignatureRole,
  TemplateFormInput,
} from "../types";
import { STORAGE_CONTRACTS_KEY, STORAGE_TEMPLATES_KEY } from "../constants";
import { createSeedTemplates } from "./seed-templates";
import { renderContractContent } from "../utils/template-engine";
import { DEFAULT_PLANTILLA_HTML } from "../utils/defaults";

let templatesMemory: ContractTemplate[] | null = null;
let contractsMemory: Contract[] | null = null;

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function loadTemplates(): ContractTemplate[] {
  if (typeof window === "undefined") {
    return templatesMemory ?? createSeedTemplates();
  }
  try {
    const raw = localStorage.getItem(STORAGE_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ContractTemplate[];
      templatesMemory = parsed;
      return parsed;
    }
  } catch {
    /* ignore */
  }
  const seed = createSeedTemplates();
  templatesMemory = seed;
  localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(seed));
  return seed;
}

function saveTemplates(list: ContractTemplate[]) {
  templatesMemory = list;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(list));
  }
}

function loadContracts(): Contract[] {
  if (typeof window === "undefined") {
    return contractsMemory ?? [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_CONTRACTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Contract[];
      contractsMemory = parsed;
      return parsed;
    }
  } catch {
    /* ignore */
  }
  contractsMemory = [];
  localStorage.setItem(STORAGE_CONTRACTS_KEY, JSON.stringify([]));
  return [];
}

function saveContracts(list: Contract[]) {
  contractsMemory = list;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_CONTRACTS_KEY, JSON.stringify(list));
  }
}

function defaultFirmas(): ContractSignature[] {
  return [
    { rol: "administrador", firmante_nombre: "", fecha_firma: null, estado: "pendiente" },
    { rol: "inquilino", firmante_nombre: "", fecha_firma: null, estado: "pendiente" },
  ];
}

function addHistorial(
  entries: ContractHistorialEntry[],
  tipo: ContractHistorialEntry["tipo"],
  descripcion: string,
): ContractHistorialEntry[] {
  return [
    {
      id: uid("hist"),
      tipo,
      descripcion,
      fecha: nowIso(),
    },
    ...entries,
  ];
}

function nextCodigo(contracts: Contract[]): string {
  const year = new Date().getFullYear();
  const prefix = `CTR-${year}-`;
  const nums = contracts
    .map((c) => c.codigo)
    .filter((c) => c.startsWith(prefix))
    .map((c) => parseInt(c.replace(prefix, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export function getTemplatesFromStore(activeOnly = false): ContractTemplate[] {
  const list = loadTemplates();
  return activeOnly ? list.filter((t) => t.activo) : list;
}

export function getTemplateByIdFromStore(id: string): ContractTemplate | null {
  return loadTemplates().find((t) => t.id === id) ?? null;
}

export function createTemplateInStore(input: TemplateFormInput): ContractTemplate {
  const list = loadTemplates();
  const t: ContractTemplate = {
    id: uid("tpl"),
    nombre: input.nombre,
    descripcion: input.descripcion,
    plantilla_html: input.plantilla_html || DEFAULT_PLANTILLA_HTML,
    activo: input.activo ?? true,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  saveTemplates([t, ...list]);
  return t;
}

export function updateTemplateInStore(
  id: string,
  input: Partial<TemplateFormInput>,
): ContractTemplate | null {
  const list = loadTemplates();
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated: ContractTemplate = {
    ...list[idx],
    ...input,
    plantilla_html: input.plantilla_html ?? list[idx].plantilla_html,
    updated_at: nowIso(),
  };
  const next = [...list];
  next[idx] = updated;
  saveTemplates(next);
  return updated;
}

export function toggleTemplateActiveInStore(id: string): ContractTemplate | null {
  const t = getTemplateByIdFromStore(id);
  if (!t) return null;
  return updateTemplateInStore(id, { activo: !t.activo });
}

export function getContractsFromStore(): Contract[] {
  return loadContracts();
}

export function getContractByIdFromStore(id: string): Contract | null {
  return loadContracts().find((c) => c.id === id) ?? null;
}

export function hasActiveContractOnProperty(
  propiedadId: string,
  excludeContractId?: string,
): boolean {
  return loadContracts().some(
    (c) =>
      c.propiedad_id === propiedadId &&
      c.estado === "activo" &&
      c.id !== excludeContractId,
  );
}

function resolveEntities(
  input: ContractFormInput,
  propiedades: Propiedad[],
  inquilinos: Inquilino[],
) {
  const prop = propiedades.find((p) => p.id === input.propiedad_id);
  const inq = inquilinos.find((i) => i.id === input.inquilino_id);
  const tpl = getTemplateByIdFromStore(input.tipo_contrato_id);
  return { prop, inq, tpl };
}

export function createContractInStore(
  input: ContractFormInput,
  propiedades: Propiedad[],
  inquilinos: Inquilino[],
): { data?: Contract; error?: string } {
  if (!input.propiedad_id || !input.inquilino_id) {
    return { error: "Debes seleccionar propiedad e inquilino." };
  }
  if (!input.tipo_contrato_id) {
    return { error: "Debes seleccionar un tipo de contrato con plantilla." };
  }
  if (new Date(input.fecha_fin) <= new Date(input.fecha_inicio)) {
    return { error: "La fecha de fin debe ser posterior a la de inicio." };
  }

  const contracts = loadContracts();
  if (hasActiveContractOnProperty(input.propiedad_id)) {
    return { error: "Esta propiedad ya tiene un contrato activo." };
  }

  const { prop, inq, tpl } = resolveEntities(input, propiedades, inquilinos);
  if (!prop) return { error: "Propiedad no encontrada." };
  if (!inq) return { error: "Inquilino no encontrado." };
  if (!tpl) return { error: "Tipo de contrato no encontrado." };
  if (!tpl.activo) return { error: "El tipo de contrato está desactivado." };

  const codigo = nextCodigo(contracts);
  const base: Omit<Contract, "contenido_generado" | "id" | "created_at" | "updated_at"> = {
    codigo,
    tipo_contrato_id: tpl.id,
    tipo_contrato_nombre: tpl.nombre,
    propiedad_id: prop.id,
    propiedad_nombre: prop.titulo,
    propiedad_direccion: [prop.direccion, prop.ciudad].filter(Boolean).join(", "),
    unidad: input.unidad ?? null,
    inquilino_id: inq.id,
    inquilino_nombre: `${inq.nombres} ${inq.apellidos}`.trim(),
    inquilino_documento: inq.numero_documento,
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin,
    valor_mensual: input.valor_mensual,
    deposito: input.deposito,
    dia_pago: input.dia_pago,
    observaciones: input.observaciones ?? null,
    plantilla_html: tpl.plantilla_html,
    estado: "borrador",
    firmas: defaultFirmas(),
    historial: [],
  };

  const draft = {
    ...base,
    id: uid("ctr"),
    contenido_generado: "",
    created_at: nowIso(),
    updated_at: nowIso(),
  } as Contract;

  draft.contenido_generado = renderContractContent(tpl.plantilla_html, draft);
  draft.historial = addHistorial(draft.historial, "creado", `Contrato ${codigo} creado en borrador`);

  saveContracts([draft, ...contracts]);
  return { data: draft };
}

export function updateContractInStore(
  id: string,
  input: ContractFormInput,
  propiedades: Propiedad[],
  inquilinos: Inquilino[],
): { data?: Contract; error?: string } {
  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };

  const current = contracts[idx];
  if (current.estado === "activo" || current.estado === "finalizado" || current.estado === "cancelado") {
    return { error: "No se puede editar un contrato en este estado." };
  }

  if (!input.propiedad_id || !input.inquilino_id) {
    return { error: "Debes seleccionar propiedad e inquilino." };
  }
  if (new Date(input.fecha_fin) <= new Date(input.fecha_inicio)) {
    return { error: "La fecha de fin debe ser posterior a la de inicio." };
  }
  if (
    input.propiedad_id !== current.propiedad_id &&
    hasActiveContractOnProperty(input.propiedad_id, id)
  ) {
    return { error: "Esta propiedad ya tiene un contrato activo." };
  }

  const { prop, inq, tpl } = resolveEntities(input, propiedades, inquilinos);
  if (!prop || !inq || !tpl) return { error: "Datos de referencia no válidos." };

  const updated: Contract = {
    ...current,
    tipo_contrato_id: tpl.id,
    tipo_contrato_nombre: tpl.nombre,
    propiedad_id: prop.id,
    propiedad_nombre: prop.titulo,
    propiedad_direccion: [prop.direccion, prop.ciudad].filter(Boolean).join(", "),
    unidad: input.unidad ?? null,
    inquilino_id: inq.id,
    inquilino_nombre: `${inq.nombres} ${inq.apellidos}`.trim(),
    inquilino_documento: inq.numero_documento,
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin,
    valor_mensual: input.valor_mensual,
    deposito: input.deposito,
    dia_pago: input.dia_pago,
    observaciones: input.observaciones ?? null,
    plantilla_html: tpl.plantilla_html,
    updated_at: nowIso(),
  };

  updated.contenido_generado = renderContractContent(tpl.plantilla_html, updated);
  updated.historial = addHistorial(updated.historial, "editado", "Datos del contrato actualizados");

  const next = [...contracts];
  next[idx] = updated;
  saveContracts(next);
  return { data: updated };
}

export function sendContractToSignatureInStore(id: string): { data?: Contract; error?: string } {
  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };
  const c = contracts[idx];
  if (c.estado !== "borrador") return { error: "Solo los borradores pueden enviarse a firma." };

  const updated: Contract = {
    ...c,
    estado: "pendiente_firma",
    updated_at: nowIso(),
    historial: addHistorial(c.historial, "editado", "Contrato enviado a firma"),
  };
  const next = [...contracts];
  next[idx] = updated;
  saveContracts(next);
  return { data: updated };
}

export function signContractInStore(
  id: string,
  rol: SignatureRole,
  firmanteNombre: string,
): { data?: Contract; error?: string; activated?: boolean } {
  if (!firmanteNombre.trim()) return { error: "Indica el nombre del firmante." };

  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };

  let c = contracts[idx];
  if (c.estado !== "pendiente_firma" && c.estado !== "firmado") {
    return { error: "El contrato debe estar pendiente de firma." };
  }

  const firmas = c.firmas.map((f) =>
    f.rol === rol
      ? { ...f, firmante_nombre: firmanteNombre.trim(), fecha_firma: nowIso(), estado: "firmado" as const }
      : f,
  );

  const histTipo = rol === "administrador" ? "firma_admin" : "firma_inquilino";
  c = {
    ...c,
    firmas,
    estado: "pendiente_firma",
    updated_at: nowIso(),
    historial: addHistorial(
      c.historial,
      histTipo,
      `Firma de ${rol === "administrador" ? "administrador" : "inquilino"}: ${firmanteNombre.trim()}`,
    ),
  };

  const allSigned = firmas.every((f) => f.estado === "firmado");
  if (allSigned) {
    c = { ...c, estado: "firmado", historial: addHistorial(c.historial, "editado", "Ambas partes han firmado") };
    const next = [...contracts];
    next[idx] = c;
    saveContracts(next);
    return activateContractInStore(id);
  }

  const next = [...contracts];
  next[idx] = c;
  saveContracts(next);
  return { data: c };
}

export function activateContractInStore(id: string): {
  data?: Contract;
  error?: string;
  activated?: boolean;
} {
  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };

  const c = contracts[idx];
  const allSigned = c.firmas.every((f) => f.estado === "firmado");
  if (!allSigned) {
    return { error: "No se puede activar sin las dos firmas." };
  }
  if (c.estado === "activo") return { data: c, activated: false };
  if (hasActiveContractOnProperty(c.propiedad_id, id)) {
    return { error: "La propiedad ya tiene otro contrato activo." };
  }

  const updated: Contract = {
    ...c,
    estado: "activo",
    updated_at: nowIso(),
    historial: addHistorial(
      c.historial,
      "activado",
      "Contrato activado — propiedad ocupada e inquilino activo",
    ),
  };

  const next = [...contracts];
  next[idx] = updated;
  saveContracts(next);

  return { data: updated, activated: true };
}

export function finalizeContractInStore(id: string): { data?: Contract; error?: string } {
  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };
  const c = contracts[idx];
  if (c.estado !== "activo") return { error: "Solo contratos activos pueden finalizarse." };

  const updated: Contract = {
    ...c,
    estado: "finalizado",
    updated_at: nowIso(),
    historial: addHistorial(c.historial, "finalizado", "Contrato finalizado"),
  };
  const next = [...contracts];
  next[idx] = updated;
  saveContracts(next);
  return { data: updated };
}

export function cancelContractInStore(id: string): { data?: Contract; error?: string } {
  const contracts = loadContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx < 0) return { error: "Contrato no encontrado." };
  const c = contracts[idx];
  if (c.estado === "activo") return { error: "Finaliza el contrato antes de cancelar uno activo." };

  const updated: Contract = {
    ...c,
    estado: "cancelado",
    updated_at: nowIso(),
    historial: addHistorial(c.historial, "cancelado", "Contrato cancelado"),
  };
  const next = [...contracts];
  next[idx] = updated;
  saveContracts(next);
  return { data: updated };
}

/** IDs con contrato activo en mock (para validar formularios) */
export function getOccupiedPropertyIdsFromStore(): string[] {
  return loadContracts()
    .filter((c) => c.estado === "activo")
    .map((c) => c.propiedad_id);
}
