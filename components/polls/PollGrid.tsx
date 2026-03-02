import { Vote } from "lucide-react";
import { Poll } from "@/lib/types/poll.types";
import { PollCard } from "./PollCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface PollGridProps {
  polls: Poll[];
  hrefBuilder?: (poll: Poll) => string;
  emptyState?: React.ReactNode;
}

export function PollGrid({ polls, hrefBuilder, emptyState }: PollGridProps) {
  if (polls.length === 0) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            title="No polls found"
            description="There are no polls to display right now."
            icon={<Vote size={48} strokeWidth={1} />}
          />
        )}
      </>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollCard
          key={poll._id}
          poll={poll}
          href={hrefBuilder ? hrefBuilder(poll) : undefined}
        />
      ))}
    </div>
  );
}
