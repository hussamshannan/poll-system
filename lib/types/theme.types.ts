export type ThemeName =
  | "vercel"
  | "violet-bloom"
  | "modern-minimal"
  | "nature"
  | "pastel-dreams"
  | "amber"
  | "coffee";

export type ThemeMode = "light" | "dark";

export interface SiteTheme {
  themeName: ThemeName;
  mode: ThemeMode;
}

export const DEFAULT_THEME: SiteTheme = {
  themeName: "vercel",
  mode: "light",
};

export interface ThemeMeta {
  id: ThemeName;
  name: string;
  description: string;
  /** Approximate hex swatches for preview cards (bg, primary, accent) */
  preview: {
    light: { bg: string; primary: string; accent: string };
    dark: { bg: string; primary: string; accent: string };
  };
}

export const THEMES: ThemeMeta[] = [
  {
    id: "vercel",
    name: "Vercel",
    description: "Clean monochrome",
    preview: {
      light: { bg: "#fafafa", primary: "#000000", accent: "#f0f0f0" },
      dark: { bg: "#000000", primary: "#ffffff", accent: "#333333" },
    },
  },
  {
    id: "violet-bloom",
    name: "Violet Bloom",
    description: "Bold purple",
    preview: {
      light: { bg: "#fefefe", primary: "#5523cc", accent: "#ede8fc" },
      dark: { bg: "#22223a", primary: "#7d5ff0", accent: "#2e2a50" },
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Subtle blue-grey",
    preview: {
      light: { bg: "#ffffff", primary: "#4e78e8", accent: "#eff2fb" },
      dark: { bg: "#202020", primary: "#5f7fea", accent: "#2a2a2a" },
    },
  },
  {
    id: "nature",
    name: "Nature",
    description: "Earthy greens",
    preview: {
      light: { bg: "#f8f3e6", primary: "#3d8a4e", accent: "#d9ede0" },
      dark: { bg: "#243a2a", primary: "#5aad6a", accent: "#2e4a35" },
    },
  },
  {
    id: "pastel-dreams",
    name: "Pastel Dreams",
    description: "Soft lavender",
    preview: {
      light: { bg: "#f8eaf7", primary: "#9067d8", accent: "#e9d4f8" },
      dark: { bg: "#21160d", primary: "#b08ae0", accent: "#3a2a50" },
    },
  },
  {
    id: "amber",
    name: "Amber",
    description: "Warm gold",
    preview: {
      light: { bg: "#ffffff", primary: "#f59e0b", accent: "#fffbeb" },
      dark: { bg: "#171717", primary: "#fbbf24", accent: "#92400e" },
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    description: "Cozy brown + cream",
    preview: {
      light: { bg: "#f9f9f9", primary: "#644a40", accent: "#ffdfb5" },
      dark: { bg: "#111111", primary: "#ffe0c2", accent: "#393028" },
    },
  },
];
