import { notFound } from "next/navigation";
import { getPollById } from "@/actions/poll.actions";
import { getPollAnalytics } from "@/actions/analytics.actions";
import { getVotersForPoll } from "@/actions/admin.actions";
import { PollDetailClient } from "./PollDetailClient";

interface AdminPollDetailPageProps {
  params: Promise<{ pollId: string }>;
}

export default async function AdminPollDetailPage({
  params,
}: AdminPollDetailPageProps) {
  const { pollId } = await params;

  const [pollResult, analyticsResult, votersResult] = await Promise.all([
    getPollById(pollId),
    getPollAnalytics(pollId),
    getVotersForPoll(pollId, 1, 100),
  ]);

  if (!pollResult.success) {
    notFound();
  }

  const poll = pollResult.data;
  const analytics = analyticsResult.success
    ? analyticsResult.data
    : {
        pollId: poll._id,
        title: poll.title,
        totalVotes: poll.totalVotes,
        optionBreakdown: poll.options.map((o) => ({
          optionId: o._id,
          text: o.text,
          count: 0,
          percentage: 0,
        })),
        votesOverTime: [],
      };

  const voters = votersResult.success ? votersResult.data.voters : [];
  const votersTotal = votersResult.success ? votersResult.data.total : 0;

  return (
    <PollDetailClient
      pollId={poll._id}
      pollTitle={poll.title}
      pollStatus={poll.status}
      pollIsExpired={poll.isExpired}
      pollReleaseAt={poll.releaseAt}
      analytics={analytics}
      voters={voters}
      votersTotal={votersTotal}
    />
  );
}
