"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteOverTime } from "@/lib/types/analytics.types";
import { useChartColors } from "@/hooks/useChartColors";
import { useTranslations } from "next-intl";

interface TrendChartProps {
  data: VoteOverTime[];
}

export function TrendChart({ data }: TrendChartProps) {
  const c = useChartColors();
  const t = useTranslations("chart");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("votingTrend")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("noActivity")}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.chart[1]} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={c.chart[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
              <XAxis
                dataKey="date"
                stroke={c.border}
                tick={{ fill: c.cardForeground, fontSize: 12 }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                allowDecimals={false}
                stroke={c.border}
                width={32}
                tick={{ fill: c.cardForeground, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: c.card,
                  border: `1px solid ${c.border}`,
                  color: c.cardForeground,
                  borderRadius: c.radius,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={c.chart[1]}
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={{ r: 3, fill: c.chart[1] }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
