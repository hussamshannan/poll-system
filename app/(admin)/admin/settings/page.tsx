import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { getSiteTheme } from "@/actions/theme.actions";
import { DEFAULT_THEME } from "@/lib/types/theme.types";

export default async function AdminSettingsPage() {
  const [result, t] = await Promise.all([
    getSiteTheme(),
    getTranslations("admin"),
  ]);
  const theme = result.success ? result.data : DEFAULT_THEME;

  return (
    <div className="space-y-6">
      <PageHeader title={t("settingsTitle")} description={t("settingsDesc")} />
      <ThemeEditor initialTheme={theme} />
    </div>
  );
}
