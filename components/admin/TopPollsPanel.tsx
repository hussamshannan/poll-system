"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DashboardOverview } from "@/lib/types/admin.types";
import { routes } from "@/lib/config/routes";
import { formatNumber } from "@/lib/utils/format";

interface TopPollsPanelProps {
  polls: DashboardOverview["topPolls"];
}

export function TopPollsPanel({ polls }: TopPollsPanelProps) {
  const t = useTranslations("stats");
  const tCard = useTranslations("pollCard");

  const max = polls.reduce((acc, p) => Math.max(acc, p.totalVotes), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("topPollsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {polls.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noChartData")}</p>
        ) : (
          <ul className="space-y-3">
            {polls.map((poll) => {
              const pct = max > 0 ? (poll.totalVotes / max) * 100 : 0;
              return (
                <li key={poll._id}>
                  <Link
                    href={routes.admin.pollDetail(poll._id)}
                    className="block rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate font-medium">
                          {poll.title}
                        </span>
                        <StatusBadge status={poll.status} />
                      </div>
                      <span className="shrink-0 text-sm font-mono tabular-nums text-muted-foreground">
                        {formatNumber(poll.totalVotes)} {tCard("votes")}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
