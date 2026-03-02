import { Vote } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PollGrid } from "@/components/polls/PollGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { listOpenPolls } from "@/actions/poll.actions";
import { routes } from "@/lib/config/routes";

export default async function VoteListPage() {
  const result = await listOpenPolls();
  const polls = result.success ? result.data : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Active Polls</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {polls.length > 0
                ? `${polls.length} open poll${polls.length !== 1 ? "s" : ""} available`
                : "No polls are currently open"}
            </p>
          </div>

          <PollGrid
            polls={polls}
            hrefBuilder={(poll) => routes.vote.poll(poll._id)}
            emptyState={
              <EmptyState
                title="No active polls"
                description="There are no open polls right now. Check back later."
                icon={<Vote size={48} strokeWidth={1} />}
              />
            }
          />
        </div>
      </main>
    </div>
  );
}
