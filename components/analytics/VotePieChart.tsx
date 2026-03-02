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

interface VotePieChartProps {
  data: OptionVoteCount[];
}

export function VotePieChart({ data }: VotePieChartProps) {
  const c = useChartColors();

  const chartData = data.map((d) => ({
    name: d.text,
    value: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vote Breakdown</CardTitle>
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
              fill={c.chart[0]}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={({ name, percent }: any) =>
                `${name ?? ""} (${((Number(percent) || 0) * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={c.chart[index % c.chart.length]}
                />
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
