"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Landmark,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Propiedad } from "@/modules/propiedades/types";
import type { Inquilino } from "@/modules/inquilinos/types";
import type {
  ContabilidadTotales,
  MovimientoFilters,
  MovimientoFinanciero,
  PagosInquilinosResumen,
} from "@/modules/finanzas/types";
import { PagosInquilinosPanel } from "@/modules/finanzas/components/pagos-inquilinos-panel";
import { ContabilidadStats } from "@/modules/finanzas/components/contabilidad-stats";
import { ContabilidadPropiedadSwitcher } from "@/modules/finanzas/components/contabilidad-propiedad-switcher";
import { MovimientosFilters } from "@/modules/finanzas/components/movimientos-filters";
import { MovimientosTable } from "@/modules/finanzas/components/movimientos-table";
import { MovimientoDetailDialog } from "@/modules/finanzas/components/movimiento-detail-dialog";
import { MovimientosEmpty } from "@/modules/finanzas/components/movimientos-empty";
import { finanzasService } from "@/modules/finanzas/services/finanzas.service";
import { hasActiveMovimientoFilters } from "@/modules/finanzas/utils/filters";

type TabId = "todos" | "ingresos" | "gastos" | "pagos_inquilinos";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "todos", label: "Libro general", icon: Wallet },
  { id: "ingresos", label: "Ingresos", icon: TrendingUp },
  { id: "gastos", label: "Gastos", icon: TrendingDown },
  { id: "pagos_inquilinos", label: "Pagos inquilinos", icon: Users },
];

export function ContabilidadPageClient({
  initialData,
  initialTotales,
  propiedades,
  inquilinos,
  initialPropiedadId,
  dbError,
}: {
  initialData: MovimientoFinanciero[];
  initialTotales: ContabilidadTotales;
  propiedades: Propiedad[];
  inquilinos: Inquilino[];
  initialPropiedadId?: string;
  dbError?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [movimientos, setMovimientos] = useState(initialData);
  const [totales, setTotales] = useState(initialTotales);
  const [filters, setFilters] = useState<MovimientoFilters>(() => ({
    propiedad_id: initialPropiedadId,
  }));
  const [tab, setTab] = useState<TabId>("todos");
  const [pagosResumen, setPagosResumen] = useState<PagosInquilinosResumen>({
    contratos: [],
    total_contratos: 0,
    al_dia: 0,
    en_mora: 0,
    parcial: 0,
  });
  const [detail, setDetail] = useState<MovimientoFinanciero | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedPropiedadId = filters.propiedad_id;
  const selectedPropiedad = propiedades.find((p) => p.id === selectedPropiedadId);

  const buildQuery = useCallback((f: MovimientoFilters, t: TabId): MovimientoFilters => {
    const base: MovimientoFilters = { ...f };
    if (t === "ingresos") base.tipo = "ingreso";
    else if (t === "gastos") base.tipo = "gasto";
    else if (t === "pagos_inquilinos") {
      base.solo_pagos_inquilinos = true;
      delete base.tipo;
    }
    return base;
  }, []);

  const fetchList = useCallback(
    (f: MovimientoFilters, t: TabId) => {
      startTransition(async () => {
        const { data, totales: newTotales, error } = await finanzasService.listMovimientos(
          buildQuery(f, t),
        );
        if (!error) {
          setMovimientos(data);
          setTotales(newTotales);
        }
      });
    },
    [buildQuery],
  );

  const fetchPagos = useCallback((propiedadId?: string) => {
    startTransition(async () => {
      const { data, error } = await finanzasService.listPagosInquilinos(propiedadId);
      if (!error) setPagosResumen(data);
    });
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("propiedad_id") ?? undefined;
    setFilters((prev) => {
      if (prev.propiedad_id === fromUrl) return prev;
      const next = { ...prev, propiedad_id: fromUrl };
      if (tab === "pagos_inquilinos") fetchPagos(fromUrl);
      else fetchList(next, tab);
      return next;
    });
    // Solo sincronizar navegación (atrás/adelante); selectPropiedad actualiza por su cuenta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectPropiedad = (propiedadId: string | null) => {
    const next: MovimientoFilters = {
      ...filters,
      propiedad_id: propiedadId ?? undefined,
    };
    setFilters(next);
    if (tab === "pagos_inquilinos") fetchPagos(propiedadId ?? undefined);
    else fetchList(next, tab);
    const url = propiedadId
      ? `/dashboard/finanzas?propiedad_id=${propiedadId}`
      : "/dashboard/finanzas";
    router.replace(url, { scroll: false });
  };

  const handleFiltersChange = (f: MovimientoFilters) => {
    const next = { ...f, propiedad_id: selectedPropiedadId };
    setFilters(next);
    fetchList(next, tab);
    const url = selectedPropiedadId
      ? `/dashboard/finanzas?propiedad_id=${selectedPropiedadId}`
      : "/dashboard/finanzas";
    router.replace(url, { scroll: false });
  };

  const handleTab = (id: TabId) => {
    setTab(id);
    if (id === "pagos_inquilinos") {
      fetchPagos(selectedPropiedadId);
    } else {
      fetchList(filters, id);
    }
  };

  const clearFilters = () => {
    const base: MovimientoFilters = selectedPropiedadId
      ? { propiedad_id: selectedPropiedadId }
      : {};
    setFilters(base);
    fetchList(base, tab);
  };

  const handleDelete = async (m: MovimientoFinanciero) => {
    if (!confirm(`¿Eliminar el movimiento «${m.concepto}»?`)) return;
    setDeletingId(m.id);
    const { error } = await finanzasService.deleteMovimiento(m.id);
    setDeletingId(null);
    if (error) alert(error);
    else fetchList(filters, tab);
  };

  const isPagosTab = tab === "pagos_inquilinos";

  const filtersActive = hasActiveMovimientoFilters({
    ...filters,
    propiedad_id: undefined,
  });
  const isEmpty = movimientos.length === 0 && !dbError;
  const showEmptyAll = isEmpty && tab === "todos" && !filtersActive && !selectedPropiedadId;

  const nuevoQuery = selectedPropiedadId ? `&propiedad_id=${selectedPropiedadId}` : "";

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 sm:px-8 sm:py-10 shadow-lg">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-emerald-500/10"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex gap-4 min-w-0">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
              <Landmark size={28} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Libro contable
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                {selectedPropiedad ? selectedPropiedad.titulo : "Contabilidad"}
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                {selectedPropiedad ? (
                  <>
                    <Building2 size={14} className="inline mr-1 -mt-0.5" />
                    Movimientos de esta propiedad. Cambia de inmueble con el selector inferior.
                  </>
                ) : (
                  "Toda la cartera — movimientos, cobros y gastos. Los totales excluyen cancelados."
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={`/dashboard/finanzas/nuevo?tipo=ingreso${nuevoQuery}`}>
              <Button
                variant="primary"
                size="md"
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 border-0 shadow-md shadow-emerald-900/30"
              >
                <Plus size={16} />
                Nuevo ingreso
              </Button>
            </Link>
            <Link href={`/dashboard/finanzas/nuevo?tipo=gasto${nuevoQuery}`}>
              <Button
                variant="secondary"
                size="md"
                className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <TrendingDown size={16} />
                Nuevo gasto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {dbError && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/90 rounded-xl px-4 py-3 shadow-sm">
          {dbError}. Ejecuta{" "}
          <code className="text-xs font-mono bg-amber-100/80 px-1.5 py-0.5 rounded">
            supabase/scripts/10_modulo_finanzas.sql
          </code>
        </p>
      )}

      <ContabilidadPropiedadSwitcher
        propiedades={propiedades}
        selectedId={selectedPropiedadId}
        onSelect={selectPropiedad}
      />

      {!isPagosTab && <ContabilidadStats totales={totales} />}

      <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        )}

        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50/50 scrollbar-thin">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTab(t.id)}
                className={[
                  "relative shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium transition-colors",
                  active
                    ? "text-brand-800 bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60",
                ].join(" ")}
              >
                <Icon size={16} className={active ? "text-brand-600" : "text-gray-400"} />
                <span className="whitespace-nowrap">{t.label}</span>
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        {!isPagosTab && (
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-b from-slate-50/40 to-white">
            <MovimientosFilters
              filters={filters}
              onChange={handleFiltersChange}
              propiedades={propiedades}
              inquilinos={inquilinos}
              showPropiedadFilter={false}
            />
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/80">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-800 tabular-nums">{movimientos.length}</span>{" "}
                movimiento{movimientos.length !== 1 ? "s" : ""}
                {selectedPropiedad && (
                  <>
                    {" "}
                    en <span className="font-medium text-gray-700">{selectedPropiedad.titulo}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {isPagosTab ? (
          <PagosInquilinosPanel resumen={pagosResumen} isLoading={isPending} />
        ) : showEmptyAll ? (
          <MovimientosEmpty variant="empty" />
        ) : (
          <MovimientosTable
            movimientos={movimientos}
            onView={setDetail}
            onDelete={handleDelete}
            deletingId={deletingId}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      <MovimientoDetailDialog
        movimiento={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        onEdit={() => {
          if (detail) router.push(`/dashboard/finanzas/${detail.id}/editar`);
        }}
      />
    </div>
  );
}
