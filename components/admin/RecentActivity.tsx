"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FilePlus, Vote as VoteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardOverview } from "@/lib/types/admin.types";
import { routes } from "@/lib/config/routes";
import { formatRelative } from "@/lib/utils/format";

interface RecentActivityProps {
  events: DashboardOverview["recentActivity"];
}

export function RecentActivity({ events }: RecentActivityProps) {
  const t = useTranslations("stats");
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noChartData")}</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event, idx) => {
              const Icon = event.type === "poll_created" ? FilePlus : VoteIcon;
              const inner = (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {event.type === "poll_created"
                        ? t("pollCreatedEvent", { title: event.title })
                        : t("voteCastEvent", {
                            voter: event.meta ?? "",
                            title: event.title,
                          })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(event.timestamp, locale)}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={`${event.timestamp}-${idx}`}>
                  {event.pollId ? (
                    <Link
                      href={routes.admin.pollDetail(event.pollId)}
                      className="block rounded-md p-2 -m-2 transition-colors hover:bg-accent"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="p-2 -m-2">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
