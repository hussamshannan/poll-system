"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Poll } from "@/lib/types/poll.types";
import { formatRelative } from "@/lib/utils/format";
import { routes } from "@/lib/config/routes";
import { isPollReleased } from "@/lib/utils/poll.utils";

interface PollCardProps {
  poll: Poll;
  href?: string;
  actions?: React.ReactNode;
}

export function PollCard({ poll, href, actions }: PollCardProps) {
  const t = useTranslations("pollCard");
  const tv = useTranslations("vote");
  const status = poll.isExpired
    ? "expired"
    : !isPollReleased(poll)
    ? "scheduled"
    : poll.status;
  const defaultHref = href ?? routes.vote.poll(poll._id);
  const choicesLabel =
    poll.choicesPerVoter === 1
      ? tv("chooseOne")
      : tv("chooseN", { count: poll.choicesPerVoter });
  const deadlineLabel = poll.expiresAt
    ? tv("closes", { when: formatRelative(poll.expiresAt) })
    : tv("noDeadline");

  return (
    <Card className="group relative overflow-hidden border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
      <Link
        href={defaultHref}
        aria-label={poll.title}
        className="absolute inset-0 z-10"
      />

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={status} />
          <div className="text-end">
            <div className="text-2xl font-semibold tabular-nums leading-none">
              {poll.totalVotes}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t("votes")}
            </div>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {poll.title}
        </h3>

        {poll.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {poll.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {choicesLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            {tv("optionsCount", { count: poll.options.length })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {deadlineLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            {formatRelative(poll.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
            {tv("cardCta")}
            <ArrowRight
              data-dir-flip
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>

        {actions && (
          <div className="relative z-20 mt-3 flex gap-2">{actions}</div>
        )}
      </div>
    </Card>
  );
}
