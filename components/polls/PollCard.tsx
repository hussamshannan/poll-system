"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Poll } from "@/lib/types/poll.types";
import { formatRelative } from "@/lib/utils/format";
import { routes } from "@/lib/config/routes";

interface PollCardProps {
  poll: Poll;
  href?: string;
  actions?: React.ReactNode;
}

export function PollCard({ poll, href, actions }: PollCardProps) {
  const t = useTranslations("pollCard");
  const status = poll.isExpired ? "expired" : poll.status;
  const defaultHref = href ?? routes.vote.poll(poll._id);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={defaultHref} className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1 hover:text-primary transition-colors">
              {poll.title}
            </CardTitle>
          </Link>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        {poll.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {poll.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {poll.totalVotes} {t("votes")}
          </span>
          <span>{formatRelative(poll.createdAt)}</span>
        </div>
        {actions && <div className="mt-3 flex gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
