import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { getSiteTheme } from "@/actions/theme.actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PollApp — Create & Share Polls",
  description: "Create polls, collect votes, and view analytics",
};

const RTL_LOCALES = ["ar", "he", "fa", "ur", "ps", "ku", "sd", "yi"];

function detectDir(acceptLanguage: string | null): "ltr" | "rtl" {
  if (!acceptLanguage) return "ltr";
  const primary = acceptLanguage
    .split(",")[0]
    .split(";")[0]
    .trim()
    .toLowerCase()
    .split("-")[0];
  return RTL_LOCALES.includes(primary) ? "rtl" : "ltr";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeResult, headersList] = await Promise.all([
    getSiteTheme(),
    headers(),
  ]);

  const theme = themeResult.success ? themeResult.data : null;
  const dir = detectDir(headersList.get("accept-language"));

  const themeName = theme?.themeName ?? "vercel";
  const isDark = theme?.mode === "dark";

  return (
    <ClerkProvider>
      <html
        lang={dir === "rtl" ? "ar" : "en"}
        dir={dir}
        data-theme={themeName}
        className={isDark ? "dark" : ""}
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
