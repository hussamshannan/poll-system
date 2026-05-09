"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DashboardOverview } from "@/lib/types/admin.types";

type MetricKey = "votes" | "polls" | "uniqueVoters";

interface MetricSwitcherProps {
  series: DashboardOverview["metricSeries"];
}

const chartConfig = {
  count: { label: "", color: "var(--primary)" },
} satisfies ChartConfig;

export function MetricSwitcher({ series }: MetricSwitcherProps) {
  const t = useTranslations("stats");
  const [metric, setMetric] = useState<MetricKey>("votes");

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const data = series[metric];

  return (
    <Card>
      <CardHeader>
        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as MetricKey)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="votes">{t("metricVotes")}</TabsTrigger>
            <TabsTrigger value="polls">{t("metricPolls")}</TabsTrigger>
            <TabsTrigger value="uniqueVoters">{t("metricVoters")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v: string) => dateFormatter.format(new Date(v))}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) =>
                    label !== undefined
                      ? dateFormatter.format(new Date(label))
                      : ""
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="count"
              type="natural"
              stroke="var(--color-count)"
              strokeWidth={2}
              fill="url(#metricFill)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
