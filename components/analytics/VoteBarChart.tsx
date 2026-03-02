"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionVoteCount } from "@/lib/types/analytics.types";
import { useChartColors } from "@/hooks/useChartColors";

interface VoteBarChartProps {
  data: OptionVoteCount[];
}

export function VoteBarChart({ data }: VoteBarChartProps) {
  const c = useChartColors();

  const chartData = data.map((d) => ({
    name: d.text.length > 20 ? d.text.slice(0, 20) + "..." : d.text,
    votes: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vote Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
            <XAxis
              type="number"
              allowDecimals={false}
              stroke={c.border}
              tick={{ fill: c.mutedForeground }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
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
            <Bar dataKey="votes" fill={c.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
