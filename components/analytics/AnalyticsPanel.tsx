import { PollAnalytics } from "@/lib/types/analytics.types";
import { VoteResult } from "./VoteResult";
import { VoteBarChart } from "./VoteBarChart";
import { VotePieChart } from "./VotePieChart";
import { TrendChart } from "./TrendChart";

interface AnalyticsPanelProps {
  analytics: PollAnalytics;
  showBarChart?: boolean;
  showPieChart?: boolean;
  showTrend?: boolean;
}

export function AnalyticsPanel({
  analytics,
  showBarChart = true,
  showPieChart = true,
  showTrend = true,
}: AnalyticsPanelProps) {
  return (
    <div className="space-y-6">
      <VoteResult
        title={analytics.title}
        totalVotes={analytics.totalVotes}
        optionBreakdown={analytics.optionBreakdown}
      />
      {(showBarChart || showPieChart) && (
        <div className="grid gap-6 md:grid-cols-2">
          {showBarChart && <VoteBarChart data={analytics.optionBreakdown} />}
          {showPieChart && <VotePieChart data={analytics.optionBreakdown} />}
        </div>
      )}
      {showTrend && <TrendChart data={analytics.votesOverTime} />}
    </div>
  );
}
