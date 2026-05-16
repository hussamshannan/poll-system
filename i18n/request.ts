import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const VALID_LOCALES = ["en", "ar"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValidLocale(v: string | undefined): v is Locale {
  return VALID_LOCALES.includes(v as Locale);
}

function detectFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";
  const tags = header
    .split(",")
    .map((t) => t.split(";")[0].trim().toLowerCase());
  for (const tag of tags) {
    if (tag.startsWith("ar")) return "ar";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;

  let locale: Locale;
  if (isValidLocale(raw)) {
    locale = raw;
  } else {
    const requestHeaders = await headers();
    locale = detectFromAcceptLanguage(requestHeaders.get("accept-language"));
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
