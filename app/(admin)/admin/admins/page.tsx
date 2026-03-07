import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AdminsClient } from "@/components/admin/AdminsClient";
import { listUsersWithRoles } from "@/actions/admin.actions";

export default async function AdminsPage() {
  const [{ userId }, result, t] = await Promise.all([
    auth(),
    listUsersWithRoles(),
    getTranslations("admin"),
  ]);

  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t("adminsTitle")} description={t("adminsDesc")} />
      <AdminsClient users={result.data} currentClerkId={userId ?? ""} />
    </div>
  );
}
