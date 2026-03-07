"use client";

import { useTranslations } from "next-intl";
import { Users, FileText, Vote, Activity, TrendingUp, Zap } from "lucide-react";
import { SiteStats } from "@/lib/types/admin.types";
import { StatCard } from "@/components/analytics/StatCard";

interface SiteStatsPanelProps {
  stats: SiteStats;
}

export function SiteStatsPanel({ stats }: SiteStatsPanelProps) {
  const t = useTranslations("stats");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={t("totalUsers")}
        value={stats.totalUsers}
        icon={<Users className="h-5 w-5" />}
      />
      <StatCard
        label={t("totalPolls")}
        value={stats.totalPolls}
        icon={<FileText className="h-5 w-5" />}
      />
      <StatCard
        label={t("totalVotes")}
        value={stats.totalVotes}
        icon={<Vote className="h-5 w-5" />}
      />
      <StatCard
        label={t("activePolls")}
        value={stats.activePolls}
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        label={t("pollsToday")}
        value={stats.pollsCreatedToday}
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <StatCard
        label={t("votesToday")}
        value={stats.votesToday}
        icon={<Zap className="h-5 w-5" />}
      />
    </div>
  );
}
