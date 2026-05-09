"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DashboardOverview } from "@/lib/types/admin.types";

interface ActivityHeatmapProps {
  data: DashboardOverview["heatmap"];
  className?: string;
}

const HOUR_TICKS = [0, 6, 12, 18];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function intensityClass(ratio: number): string {
  if (ratio === 0) return "bg-muted/30";
  if (ratio < 0.2) return "bg-primary/20";
  if (ratio < 0.45) return "bg-primary/40";
  if (ratio < 0.7) return "bg-primary/60";
  if (ratio < 0.9) return "bg-primary/80";
  return "bg-primary";
}

export function ActivityHeatmap({ data, className }: ActivityHeatmapProps) {
  const t = useTranslations("stats");

  const { matrix, max } = useMemo(() => {
    const m: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );
    let mx = 0;
    for (const cell of data) {
      if (cell.day < 0 || cell.day > 6 || cell.hour < 0 || cell.hour > 23)
        continue;
      m[cell.day][cell.hour] = cell.count;
      if (cell.count > mx) mx = cell.count;
    }
    return { matrix: m, max: mx };
  }, [data]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("heatmapTitle")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("heatmapHint")}</p>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={150}>
          <div className="space-y-1">
            {/* Hour ticks */}
            <div className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] items-center gap-1 pb-1">
              <span />
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className="text-[10px] tabular-nums text-muted-foreground text-center"
                >
                  {HOUR_TICKS.includes(h) ? String(h).padStart(2, "0") : ""}
                </span>
              ))}
            </div>
            {/* Rows */}
            {DAY_KEYS.map((dayKey, dayIdx) => (
              <div
                key={dayKey}
                className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] items-center gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  {t(dayKey)}
                </span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = matrix[dayIdx][hour];
                  const ratio = max === 0 ? 0 : count / max;
                  return (
                    <Tooltip key={hour}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "aspect-square rounded-[3px] transition-opacity",
                            intensityClass(ratio)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <span className="font-mono">
                          {t(dayKey)} {String(hour).padStart(2, "0")}:00 ·{" "}
                          {count} {t("votes")}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
