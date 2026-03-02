import { z } from "zod";

export const SiteThemeSchema = z.object({
  themeName: z.enum([
    "vercel",
    "violet-bloom",
    "modern-minimal",
    "nature",
    "pastel-dreams",
  ]),
  mode: z.enum(["light", "dark"]),
});

export type SiteThemeInput = z.infer<typeof SiteThemeSchema>;
