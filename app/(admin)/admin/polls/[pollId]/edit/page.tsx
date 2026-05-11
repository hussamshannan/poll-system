import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { EditPollClient } from "./EditPollClient";
import { getPollById } from "@/actions/poll.actions";

interface EditPollPageProps {
  params: Promise<{ pollId: string }>;
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { pollId } = await params;
  const [result, t] = await Promise.all([
    getPollById(pollId),
    getTranslations("admin"),
  ]);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader title={t("editPollTitle")} description={t("editPollDesc")} />
      <EditPollClient poll={result.data} />
    </div>
  );
}
