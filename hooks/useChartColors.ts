"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS custom property to a #rrggbb hex string that SVG fill
 * attributes can always parse — even when the variable holds an oklch() value.
 */
function resolveColor(cssVar: string): string {
  // Step 1: get the computed value (may be oklch, rgb, or hex)
  const el = document.createElement("span");
  el.style.display = "none";
  el.style.color = `var(${cssVar})`;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);

  // Step 2: run through Canvas 2D which always serialises to #rrggbb / rgba()
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = computed;
    return ctx.fillStyle; // guaranteed hex or rgba string
  } catch {
    return computed;
  }
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ChartColors {
  primary: string;
  chart: [string, string, string, string, string];
  border: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  radius: string;
}

// Vercel-light approximations used during SSR / before first paint
const DEFAULTS: ChartColors = {
  primary: "rgb(0,0,0)",
  chart: [
    "rgb(221,185,86)",
    "rgb(88,64,210)",
    "rgb(184,184,184)",
    "rgb(235,235,235)",
    "rgb(90,90,90)",
  ],
  border: "rgb(235,235,235)",
  mutedForeground: "rgb(112,112,112)",
  card: "rgb(255,255,255)",
  cardForeground: "rgb(0,0,0)",
  radius: "0.5rem",
};

/**
 * Resolves theme CSS custom properties to concrete rgb() strings that
 * Recharts can parse. Re-reads whenever data-theme or .dark changes on <html>.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(DEFAULTS);

  useEffect(() => {
    function update() {
      setColors({
        primary: resolveColor("--primary"),
        chart: [
          resolveColor("--chart-1"),
          resolveColor("--chart-2"),
          resolveColor("--chart-3"),
          resolveColor("--chart-4"),
          resolveColor("--chart-5"),
        ],
        border: resolveColor("--border"),
        mutedForeground: resolveColor("--muted-foreground"),
        card: resolveColor("--card"),
        cardForeground: resolveColor("--card-foreground"),
        radius: getCSSVar("--radius"),
      });
    }

    update();

    // Re-read when theme or dark-mode class changes on <html>
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
