import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EditPollClient } from "./EditPollClient";
import { getPollById } from "@/actions/poll.actions";

interface EditPollPageProps {
  params: Promise<{ pollId: string }>;
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { pollId } = await params;
  const result = await getPollById(pollId);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Edit Poll" description="Update the poll details" />
      <EditPollClient poll={result.data} />
    </div>
  );
}
