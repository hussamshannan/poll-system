"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionVoteCount } from "@/lib/types/analytics.types";
import { formatPercent } from "@/lib/utils/format";
import { paletteColor } from "@/lib/utils/chart-palette";

interface VoteResultProps {
  title: string;
  totalVotes: number;
  optionBreakdown: OptionVoteCount[];
}

export function VoteResult({ title, totalVotes, optionBreakdown }: VoteResultProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {optionBreakdown.map((option, i) => {
          const color = paletteColor(i);
          return (
            <div key={option.optionId} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate font-medium">{option.text}</span>
                </div>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {option.count} ({formatPercent(option.percentage)})
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, option.percentage))}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
