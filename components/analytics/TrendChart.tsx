"use client";

import {
  LineChart,
  Line,
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
              <XAxis
                dataKey="date"
                stroke={c.border}
                tick={{ fill: c.mutedForeground }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                allowDecimals={false}
                stroke={c.border}
                tick={{ fill: c.mutedForeground }}
              />
              <Tooltip
                contentStyle={{
                  background: c.card,
                  border: `1px solid ${c.border}`,
                  color: c.cardForeground,
                  borderRadius: c.radius,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={c.primary}
                strokeWidth={2}
                dot={{ r: 4, fill: c.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
