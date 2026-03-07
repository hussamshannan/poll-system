"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/actions/locale.actions";

export function LangToggle() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();

  const next = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => setLocale(next))}
      className="font-medium"
    >
      {t("langSwitch")}
    </Button>
  );
}
