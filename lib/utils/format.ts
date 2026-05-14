import { format, formatDistanceToNow } from "date-fns";
import { ar, enUS, type Locale } from "date-fns/locale";

const LOCALES: Record<string, Locale> = { ar, en: enUS };

function resolveLocale(locale?: string): Locale {
  return (locale && LOCALES[locale]) || enUS;
}

export function formatDate(date: string | Date, locale?: string): string {
  return format(new Date(date), "PP", { locale: resolveLocale(locale) });
}

export function formatDateTime(date: string | Date, locale?: string): string {
  return format(new Date(date), "PP p", { locale: resolveLocale(locale) });
}

export function formatRelative(
  date: string | Date,
  locale?: string
): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: resolveLocale(locale),
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}
