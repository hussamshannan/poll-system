import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

export const pollStatusConfig: Record<
  "draft" | "open" | "closed" | "expired",
  StatusConfig
> = {
  open: { label: "Open", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  closed: { label: "Closed", variant: "destructive" },
  draft: { label: "Draft", variant: "outline" },
  expired: { label: "Expired", variant: "secondary" },
};

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, variant, label, className }: StatusBadgeProps) {
  const config = pollStatusConfig[status as keyof typeof pollStatusConfig];
  const resolvedVariant = variant ?? config?.variant ?? "secondary";
  const resolvedLabel = label ?? config?.label ?? status;
  const resolvedClassName = className ?? config?.className;

  return (
    <Badge variant={resolvedVariant} className={resolvedClassName}>
      {resolvedLabel}
    </Badge>
  );
}
