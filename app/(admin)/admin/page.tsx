import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiHero } from "@/components/admin/KpiHero";
import { MetricSwitcher } from "@/components/admin/MetricSwitcher";
import { ActivityHeatmap } from "@/components/admin/ActivityHeatmap";
import { StatusDonut } from "@/components/admin/StatusDonut";
import { TopPollsPanel } from "@/components/admin/TopPollsPanel";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { getDashboardOverview } from "@/actions/admin.actions";

export default async function AdminPage() {
  const [overviewResult, t] = await Promise.all([
    getDashboardOverview(),
    getTranslations("admin"),
  ]);

  if (!overviewResult.success) {
    return <p className="text-destructive">{overviewResult.error}</p>;
  }

  const overview = overviewResult.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboardTitle")}
        description={t("dashboardDesc")}
      />
      <KpiHero kpis={overview.kpis} />
      <MetricSwitcher series={overview.metricSeries} />
      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityHeatmap data={overview.heatmap} className="lg:col-span-2" />
        <StatusDonut data={overview.statusBreakdown} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPollsPanel polls={overview.topPolls} />
        <RecentActivity events={overview.recentActivity} />
      </div>
    </div>
  );
}
