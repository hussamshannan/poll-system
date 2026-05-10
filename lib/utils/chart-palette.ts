/**
 * Stable categorical palette for poll-option charts.
 *
 * Every theme defines `--chart-1..5` differently — some themes set 3+ of
 * those tokens to near-grayscale, so option N collapses into option N+1.
 * For chart slices/bars/legend dots we want option N to ALWAYS be the same
 * recognisable color regardless of which theme is active. This palette is
 * Tailwind's *-500 hues, picked for high distinctness in both light and
 * dark backgrounds.
 *
 * Use `paletteColor(i)` with a 0-based index; it cycles infinitely.
 */
export const CHART_PALETTE: readonly string[] = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#84cc16", // lime-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
];

export function paletteColor(index: number): string {
  if (!Number.isFinite(index) || index < 0) return CHART_PALETTE[0];
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
