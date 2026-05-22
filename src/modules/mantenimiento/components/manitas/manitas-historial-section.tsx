"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import type { ManitasTrabajo } from "../../types";
import { formatFecha } from "../../utils/labels";
import { mantenimientoService } from "../../services/mantenimiento.service";
import { ManitasTrabajoFormSchema, type ManitasTrabajoFormValues } from "@/shared/schemas/mantenimiento";

export function ManitasHistorialSection({
  manitasId,
  trabajos,
  onRefresh,
}: {
  manitasId: string;
  trabajos: ManitasTrabajo[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ManitasTrabajoFormValues>({
    titulo: "",
    descripcion: "",
    propiedad_nombre: "",
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const parsed = ManitasTrabajoFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await mantenimientoService.addTrabajo(manitasId, parsed.data);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setForm({
      titulo: "",
      descripcion: "",
      propiedad_nombre: "",
      fecha: new Date().toISOString().slice(0, 10),
    });
    setShowForm(false);
    onRefresh();
  };

  const remove = async (id: string, origen: "ticket" | "manual") => {
    if (origen !== "manual") return;
    if (!confirm("¿Eliminar este trabajo del historial?")) return;
    const { error: err } = await mantenimientoService.deleteTrabajo(manitasId, id);
    if (err) alert(err);
    else onRefresh();
  };

  return (
    <Card>
      <CardHeader className="px-5 py-4 flex flex-row items-center justify-between gap-3 border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Briefcase size={20} />
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">Historial de trabajos</h2>
            <p className="text-xs text-gray-500">Tickets cerrados y trabajos externos registrados</p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} />
          Añadir trabajo
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 space-y-4">
        {showForm && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 space-y-3">
            <input
              placeholder="Título del trabajo *"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                placeholder="Propiedad / lugar"
                value={form.propiedad_nombre ?? ""}
                onChange={(e) => setForm({ ...form, propiedad_nombre: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <textarea
              placeholder="Descripción"
              rows={2}
              value={form.descripcion ?? ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button type="button" variant="primary" size="sm" onClick={submit} disabled={loading}>
              Guardar trabajo
            </Button>
          </div>
        )}

        {trabajos.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Sin trabajos registrados aún.</p>
        ) : (
          <ul className="space-y-2">
            {trabajos.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{t.titulo}</p>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        t.origen === "ticket"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.origen === "ticket" ? "Plataforma" : "Externo"}
                    </span>
                  </div>
                  {t.propiedad_nombre && (
                    <p className="text-xs text-gray-500 mt-0.5">{t.propiedad_nombre}</p>
                  )}
                  {t.descripcion && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{t.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatFecha(t.fecha)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {t.ticket_id && (
                    <Link
                      href={`/dashboard/mantenimiento/${t.ticket_id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                      title="Ver ticket"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  {t.origen === "manual" && (
                    <button
                      type="button"
                      onClick={() => remove(t.id, t.origen)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
