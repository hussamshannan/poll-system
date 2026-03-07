"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  variant: BadgeVariant;
  className?: string;
}

const pollStatusConfig: Record<
  "draft" | "open" | "closed" | "expired",
  StatusConfig
> = {
  open: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
  closed: { variant: "destructive" },
  draft: { variant: "outline" },
  expired: { variant: "secondary" },
};

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, variant, label, className }: StatusBadgeProps) {
  const t = useTranslations("status");
  const config = pollStatusConfig[status as keyof typeof pollStatusConfig];
  const resolvedVariant = variant ?? config?.variant ?? "secondary";
  const resolvedLabel =
    label ??
    (status in pollStatusConfig
      ? t(status as "open" | "closed" | "draft" | "expired")
      : status);
  const resolvedClassName = className ?? config?.className;

  return (
    <Badge variant={resolvedVariant} className={resolvedClassName}>
      {resolvedLabel}
    </Badge>
  );
}
