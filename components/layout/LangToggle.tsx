"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { setLocale } from "@/actions/locale.actions";

export function LangToggle() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();

  const next = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setLocale(next))}
      aria-label={t("langSwitch")}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60 sm:px-4"
    >
      <Globe className="h-4 w-4" aria-hidden strokeWidth={1.8} />
      <span className="hidden xs:inline sm:inline">{t("langSwitch")}</span>
    </button>
  );
}
