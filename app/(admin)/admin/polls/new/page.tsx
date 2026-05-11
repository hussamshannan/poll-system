import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreatePollClient } from "./CreatePollClient";

export default async function CreatePollPage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader title={t("newPollTitle")} description={t("newPollDesc")} />
      <CreatePollClient />
    </div>
  );
}
