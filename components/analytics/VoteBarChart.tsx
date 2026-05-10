"use client";

import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionVoteCount } from "@/lib/types/analytics.types";
import { useChartColors } from "@/hooks/useChartColors";
import { paletteColor } from "@/lib/utils/chart-palette";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface VoteBarChartProps {
  data: OptionVoteCount[];
}

export function VoteBarChart({ data }: VoteBarChartProps) {
  const c = useChartColors();
  const t = useTranslations("chart");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const chartData = data.map((d) => ({
    name: d.text.length > 24 ? d.text.slice(0, 24) + "…" : d.text,
    votes: d.count,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{t("voteDistribution")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={isRTL ? { right: 16 } : { left: 16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={c.border}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              reversed={isRTL}
              stroke={c.border}
              tick={{ fill: c.mutedForeground }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              orientation={isRTL ? "right" : "left"}
              stroke={c.border}
              tick={{ fill: c.cardForeground, fontSize: 12 }}
              interval={0}
            />
            <Tooltip
              contentStyle={{
                background: c.card,
                border: `1px solid ${c.border}`,
                color: c.cardForeground,
                borderRadius: c.radius,
                
              }}
            />
            <Bar
              dataKey="votes"
              name={t("votes")}
              radius={[4, 4, 4, 4]}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={paletteColor(i)} />
              ))}
              <LabelList
                dataKey="votes"
                position={isRTL ? "insideLeft" : "insideRight"}
                offset={8}
                fill={c.cardForeground}
                fontSize={12}
                fontWeight={500}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
