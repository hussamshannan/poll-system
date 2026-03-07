import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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

const arabicFont = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PollApp — Create & Share Polls",
  description: "Create polls, collect votes, and view analytics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeResult, locale, messages] = await Promise.all([
    getSiteTheme(),
    getLocale(),
    getMessages(),
  ]);

  const theme = themeResult.success ? themeResult.data : null;
  const themeName = theme?.themeName ?? "vercel";
  const isDark = theme?.mode === "dark";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <ClerkProvider>
      <html
        lang={locale}
        dir={dir}
        data-theme={themeName}
        className={`${geistSans.variable} ${geistMono.variable} ${arabicFont.variable}${isDark ? " dark" : ""}`}
      >
        <body className="antialiased">
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
