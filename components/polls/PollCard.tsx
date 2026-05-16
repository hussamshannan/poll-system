"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react";
import { Poll } from "@/lib/types/poll.types";
import { formatRelative } from "@/lib/utils/format";
import { routes } from "@/lib/config/routes";
import { isPollReleased } from "@/lib/utils/poll.utils";
import { cn } from "@/lib/utils";

interface PollCardProps {
  poll: Poll;
  href?: string;
  actions?: React.ReactNode;
}

type EffectiveStatus = "open" | "closed" | "draft" | "expired" | "scheduled";

function getEffectiveStatus(poll: Poll): EffectiveStatus {
  if (poll.isExpired) return "expired";
  if (!isPollReleased(poll)) return "scheduled";
  return poll.status;
}

const STATUS_DOT: Record<EffectiveStatus, string> = {
  open: "text-green-600",
  scheduled: "text-blue-500",
  closed: "text-muted-foreground",
  draft: "text-muted-foreground",
  expired: "text-destructive",
};

export function PollCard({ poll, href, actions }: PollCardProps) {
  const t = useTranslations("pollCard");
  const tv = useTranslations("vote");
  const tStatus = useTranslations("status");
  const locale = useLocale();

  const status = getEffectiveStatus(poll);
  const defaultHref = href ?? routes.vote.poll(poll._id);
  const choicesLabel =
    poll.choicesPerVoter === 1
      ? tv("chooseOne")
      : tv("chooseN", { count: poll.choicesPerVoter });
  const deadlineLabel = poll.expiresAt
    ? tv("closes", { when: formatRelative(poll.expiresAt, locale) })
    : tv("noDeadline");
  const isUrgent =
    status === "open" &&
    !!poll.expiresAt &&
    new Date(poll.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  const statusLabel = tStatus(status);

  return (
    <article className="group relative overflow-hidden rounded-[20px] border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_48px_-32px_rgba(20,20,20,0.18)]">
      <Link
        href={defaultHref}
        aria-label={poll.title}
        className="absolute inset-0 z-10"
      />

      <div className="flex h-full flex-col px-6 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.04em] text-foreground">
            <span
              className={cn(
                "h-1.75 w-1.75 rounded-full bg-current",
                STATUS_DOT[status],
                status === "open" && "pulse-dot"
              )}
            />
            <span>{statusLabel}</span>
          </span>
          <div className="text-end font-mono">
            <div className="text-[26px] font-medium leading-none tracking-tight tabular-nums sm:text-[28px]">
              {poll.totalVotes}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              {t("votes")}
            </div>
          </div>
        </div>

        <h3
          dir="auto"
          className="mt-6 line-clamp-2 text-[17px] font-semibold leading-[1.55] sm:mt-7 sm:text-[19px]"
        >
          {poll.title}
        </h3>

        {poll.description && (
          <p
            dir="auto"
            className="mt-3 line-clamp-2 text-sm leading-[1.75] text-muted-foreground"
          >
            {poll.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-foreground/85 sm:mt-6 sm:gap-x-4.5">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 opacity-55" />
            {choicesLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <ListChecks className="h-3.5 w-3.5 opacity-55" />
            {tv("optionsCount", { count: poll.options.length })}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-2",
              isUrgent && "text-primary"
            )}
          >
            <Clock
              className={cn(
                "h-3.5 w-3.5",
                isUrgent ? "opacity-100" : "opacity-55"
              )}
            />
            {deadlineLabel}
          </span>
        </div>

        <div className="-mx-6 mt-5 border-t sm:-mx-8" />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {formatRelative(poll.createdAt, locale)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-colors group-hover:bg-primary sm:px-4.5 sm:py-2.5">
            {tv("cardCta")}
            <ArrowRight
              data-dir-flip
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>

        {actions && (
          <div className="relative z-20 mt-4 flex gap-2">{actions}</div>
        )}
      </div>
    </article>
  );
}
