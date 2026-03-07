import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const VALID_LOCALES = ["en", "ar"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValidLocale(v: string | undefined): v is Locale {
  return VALID_LOCALES.includes(v as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  const locale: Locale = isValidLocale(raw) ? raw : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
