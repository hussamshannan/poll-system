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
  metadataBase: new URL("https://cbosra-poll.vercel.app"),
  title: "CBOSRA — Member Voting Portal",
  description:
    "Secure member voting portal for the Central Bank of Sudan Retirees Association. Cast your vote on the matters that shape our association.",
  openGraph: {
    title: "CBOSRA — Member Voting Portal",
    description:
      "Secure member voting portal for the Central Bank of Sudan Retirees Association.",
    siteName: "CBOSRA",
    type: "website",
    images: [
      {
        url: "/hero-img.jpg",
        width: 2400,
        height: 3067,
        alt: "Central Bank of Sudan Retirees Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CBOSRA — Member Voting Portal",
    description:
      "Secure member voting portal for the Central Bank of Sudan Retirees Association.",
    images: ["/hero-img.jpg"],
  },
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
