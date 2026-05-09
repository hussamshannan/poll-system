"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { DashboardOverview } from "@/lib/types/admin.types";

interface KpiHeroProps {
  kpis: DashboardOverview["kpis"];
}

interface KpiCardProps {
  label: string;
  current: number;
  previous: number;
  sparkline: number[];
}

const sparkConfig = {
  v: { label: "", color: "var(--primary)" },
} satisfies ChartConfig;

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function KpiCard({ label, current, previous, sparkline }: KpiCardProps) {
  const t = useTranslations("stats");
  const delta = useMemo(
    () => deltaPercent(current, previous),
    [current, previous]
  );

  const data = useMemo(
    () => sparkline.map((v, i) => ({ i, v })),
    [sparkline]
  );

  const Trend =
    delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendClass =
    delta === null
      ? "text-muted-foreground"
      : delta > 0
      ? "text-green-600 dark:text-green-500"
      : delta < 0
      ? "text-red-600 dark:text-red-500"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold tabular-nums">
            {formatNumber(current)}
          </span>
          <span
            className={cn("flex items-center gap-1 text-xs font-medium", trendClass)}
          >
            <Trend className="h-3.5 w-3.5" />
            {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t("vsLast14")}</p>
        <ChartContainer
          config={sparkConfig}
          className="aspect-auto h-12 w-full"
        >
          <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-v)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-v)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="v"
              type="monotone"
              stroke="var(--color-v)"
              strokeWidth={1.5}
              fill="url(#sparkFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function KpiHero({ kpis }: KpiHeroProps) {
  const t = useTranslations("stats");

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard
        label={t("totalVotes")}
        current={kpis.totalVotes.current}
        previous={kpis.totalVotes.previous}
        sparkline={kpis.totalVotes.sparkline}
      />
      <KpiCard
        label={t("activePolls")}
        current={kpis.activePolls.current}
        previous={kpis.activePolls.previous}
        sparkline={kpis.activePolls.sparkline}
      />
      <KpiCard
        label={t("uniqueVoters")}
        current={kpis.uniqueVoters.current}
        previous={kpis.uniqueVoters.previous}
        sparkline={kpis.uniqueVoters.sparkline}
      />
    </div>
  );
}
