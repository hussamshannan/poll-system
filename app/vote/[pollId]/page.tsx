import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VotePageClient } from "./VotePageClient";
import { getPollById } from "@/actions/poll.actions";

interface VotePollPageProps {
  params: Promise<{ pollId: string }>;
}

export default async function VotePollPage({ params }: VotePollPageProps) {
  const { pollId } = await params;
  const result = await getPollById(pollId);

  if (!result.success) {
    notFound();
  }

  const poll = result.data;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div
          className={`mx-auto ${poll.isExpired ? "max-w-4xl" : "max-w-xl"}`}
        >
          <VotePageClient poll={poll} />
        </div>
      </main>
    </div>
  );
}
