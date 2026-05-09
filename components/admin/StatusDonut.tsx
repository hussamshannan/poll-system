"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DashboardOverview } from "@/lib/types/admin.types";

interface StatusDonutProps {
  data: DashboardOverview["statusBreakdown"];
}

export function StatusDonut({ data }: StatusDonutProps) {
  const t = useTranslations("stats");
  const tStatus = useTranslations("status");

  const statusData = useMemo(() => {
    const desired: ("open" | "closed" | "draft")[] = ["open", "closed", "draft"];
    return desired.map((status) => ({
      status,
      count: data.find((s) => s.status === status)?.count ?? 0,
    }));
  }, [data]);

  const total = statusData.reduce((acc, p) => acc + p.count, 0);

  const chartConfig = {
    open: { label: tStatus("open"), color: "var(--chart-1)" },
    closed: { label: tStatus("closed"), color: "var(--chart-2)" },
    draft: { label: tStatus("draft"), color: "var(--chart-3)" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pollStatusChart")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total} {t("totalPolls")}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {total === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            {t("noChartData")}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-[240px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="status" />}
              />
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={`var(--color-${entry.status})`}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
