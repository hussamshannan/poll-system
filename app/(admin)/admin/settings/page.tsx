import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { getSiteTheme } from "@/actions/theme.actions";
import { DEFAULT_THEME } from "@/lib/types/theme.types";

export default async function AdminSettingsPage() {
  const result = await getSiteTheme();
  const theme = result.success ? result.data : DEFAULT_THEME;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Choose a theme and appearance for the entire site"
      />
      <ThemeEditor initialTheme={theme} />
    </div>
  );
}
