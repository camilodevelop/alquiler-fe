import type { ReportTableColumn, ReportTableRow } from "../types";

export function ReportSummaryTable({
  columns,
  rows,
  title = "Detalle por registro",
}: {
  columns: ReportTableColumn[];
  rows: ReportTableRow[];
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {rows.length} registro{rows.length !== 1 ? "s" : ""} en el periodo
        </p>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                  ].join(" ")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  Sin datos para los filtros seleccionados
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={[
                    "border-b border-slate-50 transition-colors hover:bg-brand-50/30",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                  ].join(" ")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "px-4 py-3 text-slate-700 whitespace-nowrap",
                        col.align === "right" ? "text-right tabular-nums font-medium" : "",
                        ["propiedad", "inquilino", "nombre", "codigo", "ticket"].includes(col.key)
                          ? "font-medium text-slate-900 max-w-[220px] truncate"
                          : "",
                      ].join(" ")}
                    >
                      {row.cells[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
