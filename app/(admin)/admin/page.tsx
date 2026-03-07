import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { SiteStatsPanel } from "@/components/admin/SiteStatsPanel";
import { getSiteStats } from "@/actions/admin.actions";

export default async function AdminPage() {
  const [result, t] = await Promise.all([
    getSiteStats(),
    getTranslations("admin"),
  ]);

  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("dashboardTitle")}
        description={t("dashboardDesc")}
      />
      <SiteStatsPanel stats={result.data} />
    </div>
  );
}
