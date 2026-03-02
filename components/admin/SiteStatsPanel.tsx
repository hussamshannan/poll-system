import { SiteStats } from "@/lib/types/admin.types";
import { StatCard } from "@/components/analytics/StatCard";
import { Users, FileText, Vote, Activity, TrendingUp, Zap } from "lucide-react";

interface SiteStatsPanelProps {
  stats: SiteStats;
}

export function SiteStatsPanel({ stats }: SiteStatsPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Users"
        value={stats.totalUsers}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        label="Total Polls"
        value={stats.totalPolls}
        icon={<FileText className="h-5 w-5" />}
      />
      <StatCard
        label="Total Votes"
        value={stats.totalVotes}
        icon={<Vote className="h-5 w-5" />}
      />
      <StatCard
        label="Active Polls"
        value={stats.activePolls}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        label="Polls Created Today"
        value={stats.pollsCreatedToday}
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <StatCard
        label="Votes Today"
        value={stats.votesToday}
        icon={<Zap className="h-5 w-5" />}
      />
    </div>
  );
}
