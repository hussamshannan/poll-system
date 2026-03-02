import { PageHeader } from "@/components/shared/PageHeader";
import { SiteStatsPanel } from "@/components/admin/SiteStatsPanel";
import { getSiteStats } from "@/actions/admin.actions";

export default async function AdminPage() {
  const result = await getSiteStats();
  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" description="Platform-wide overview" />
      <SiteStatsPanel stats={result.data} />
    </div>
  );
}
