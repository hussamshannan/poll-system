"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionVoteCount } from "@/lib/types/analytics.types";
import { useChartColors } from "@/hooks/useChartColors";
import { paletteColor } from "@/lib/utils/chart-palette";
import { useTranslations } from "next-intl";

interface VotePieChartProps {
  data: OptionVoteCount[];
}

export function VotePieChart({ data }: VotePieChartProps) {
  const c = useChartColors();
  const t = useTranslations("chart");

  const chartData = data.map((d) => ({
    name: d.text,
    value: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("voteBreakdown")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill={paletteColor(0)}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(props: any) => {
                const RADIAN = Math.PI / 180;
                const radius =
                  props.innerRadius +
                  (props.outerRadius - props.innerRadius) * 0.5;
                const x =
                  props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                const y =
                  props.cy + radius * Math.sin(-props.midAngle * RADIAN);
                const percent = (Number(props.percent) || 0) * 100;
                if (percent < 5) return null;
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#ffffff"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {percent.toFixed(0)}%
                  </text>
                );
              }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={paletteColor(index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: c.card,
                border: `1px solid ${c.border}`,
                color: c.cardForeground,
                borderRadius: c.radius,
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: c.cardForeground }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
