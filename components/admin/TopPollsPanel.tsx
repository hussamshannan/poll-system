"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DashboardOverview } from "@/lib/types/admin.types";
import { routes } from "@/lib/config/routes";
import { formatNumber } from "@/lib/utils/format";
import { isPollReleased } from "@/lib/utils/poll.utils";

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
            {polls.map((poll, index) => {
              const pct = max > 0 ? (poll.totalVotes / max) * 100 : 0;
              const effectiveStatus = poll.isExpired
                ? "expired"
                : !isPollReleased(poll)
                ? "scheduled"
                : poll.status;
              const barColor = `var(--chart-${(index % 5) + 1})`;
              return (
                <li key={poll._id}>
                  <Link
                    href={routes.admin.pollDetail(poll._id)}
                    className="block rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span dir="auto" className="truncate font-medium">
                          {poll.title}
                        </span>
                        <StatusBadge status={effectiveStatus} />
                      </div>
                      <span className="shrink-0 text-sm font-mono tabular-nums text-muted-foreground">
                        {formatNumber(poll.totalVotes)} {tCard("votes")}
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
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
