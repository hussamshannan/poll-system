import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { PollTable } from "@/components/admin/PollTable";
import { listAllPolls, adminDeletePoll } from "@/actions/admin.actions";
import { routes } from "@/lib/config/routes";

export default async function AdminPollsPage() {
  const [result, t] = await Promise.all([
    listAllPolls(1, 50),
    getTranslations("admin"),
  ]);

  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("allPollsTitle")}
        description={t("allPollsDesc")}
      >
        <Button asChild>
          <Link href={routes.admin.pollNew}>
            <PlusCircle className="me-2 h-4 w-4" />
            {t("createPoll")}
          </Link>
        </Button>
      </PageHeader>
      <PollTable
        polls={result.data.polls}
        total={result.data.total}
        onDelete={adminDeletePoll}
      />
    </div>
  );
}
