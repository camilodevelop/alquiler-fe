import { getDashboardDataAction } from "@/app/actions/dashboard";
import { DashboardPageClient } from "./dashboard-page-client";

export default async function DashboardPage() {
  const { data, error } = await getDashboardDataAction();

  return <DashboardPageClient data={data} error={error} />;
}
