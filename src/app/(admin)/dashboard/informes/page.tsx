import { getReporteTabAction, getReportesCatalogAction } from "@/app/actions/reportes";
import { ReportesPageClient } from "./reportes-page-client";
import { defaultReportDateRange } from "@/modules/reportes/utils/dates";

export default async function InformesPage() {
  const filters = defaultReportDateRange();
  const [{ data: catalog, error: catalogError }, { data: initialData }] = await Promise.all([
    getReportesCatalogAction(),
    getReporteTabAction("general", filters),
  ]);

  return (
    <ReportesPageClient
      initialCatalog={catalog}
      initialTab="general"
      initialData={
        initialData ?? {
          kpis: [],
          charts: [],
          table: { columns: [], rows: [] },
        }
      }
      catalogError={catalogError}
    />
  );
}
