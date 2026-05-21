"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { VoteSubmit } from "@/components/voting/VoteSubmit";
import { VoteConfirmation } from "@/components/voting/VoteConfirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVote } from "@/hooks/useVote";
import { castVote } from "@/actions/vote.actions";
import { Poll } from "@/lib/types/poll.types";
import { routes } from "@/lib/config/routes";
import { isPollReleased } from "@/lib/utils/poll.utils";
import { hasVotedLocally } from "@/lib/utils/local-vote-tracker";

interface VotePageClientProps {
  poll: Poll;
}

type LocalStatus = "checking" | "fresh" | "alreadyVoted";

const subscribeNoop = () => () => {};
const getServerLocalStatus = (): LocalStatus => "checking";

export function VotePageClient({ poll }: VotePageClientProps) {
  const t = useTranslations("votePage");
  const locale = useLocale();
  const [submittedName, setSubmittedName] = useState("");
  const [submittedOptions, setSubmittedOptions] = useState<string[]>([]);

  const localStatus = useSyncExternalStore<LocalStatus>(
    subscribeNoop,
    () => (hasVotedLocally(poll._id, poll.releaseAt) ? "alreadyVoted" : "fresh"),
    getServerLocalStatus
  );

  const { submit, isPending, error, fieldErrors, isSubmitted } = useVote({
    castVoteAction: castVote,
  });

  if (isSubmitted) {
    return (
      <VoteConfirmation
        pollTitle={poll.title}
        selectedOptions={submittedOptions}
        voterName={submittedName}
      />
    );
  }

  if (!isPollReleased(poll)) {
    const releaseDate = new Date(poll.releaseAt!).toLocaleString();
    return (
      <Card>
        <CardHeader>
          <CardTitle dir="auto">{poll.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("notReleased", { date: releaseDate })}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (poll.status !== "open" || poll.isExpired) {
    if (poll.isExpired) {
      const dateFmt: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const opened = new Date(poll.createdAt).toLocaleDateString(
        locale,
        dateFmt
      );
      const closed = poll.expiresAt
        ? new Date(poll.expiresAt).toLocaleDateString(locale, dateFmt)
        : null;
      return (
        <section className="flex flex-col items-center text-center px-4 py-16 md:py-20">
          <span className="rise inline-flex items-center gap-3.5 text-[11px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            <span aria-hidden className="block h-px w-7 bg-border" />
            {t("expiredLabel")}
            <span aria-hidden className="block h-px w-7 bg-border" />
          </span>

          <div
            className="rise rise-d1 mt-7 inline-flex items-center gap-2.5 text-[11.5px] font-medium uppercase tracking-[0.32em]"
            style={{ color: "#4a3a2e" }}
          >
            <span
              aria-hidden
              className="block h-[7px] w-[7px] rounded-full"
              style={{ background: "#4a3a2e" }}
            />
            {t("expiredStatus")}
          </div>

          <h1
            dir="auto"
            className="rise rise-d2 mt-6 max-w-3xl text-2xl md:text-[42px] font-medium leading-[1.5] text-foreground text-balance"
          >
            {poll.title}
          </h1>

          <p className="rise rise-d2 mt-3 max-w-xl text-base md:text-[16.5px] leading-[1.8] text-muted-foreground">
            {t("expired")}
          </p>

          <div
            className="rise rise-d3 mt-14 flex items-center gap-3.5"
            aria-hidden
          >
            <span className="block h-px w-12 md:w-[60px] bg-border" />
            <span
              className="block h-[5px] w-[5px] rotate-45"
              style={{ background: "#4a3a2e", opacity: 0.9 }}
            />
            <span className="block h-px w-12 md:w-[60px] bg-border" />
          </div>

          <div className="rise rise-d4 mt-6 grid w-full max-w-[680px] grid-cols-1 sm:grid-cols-3 border-y border-border">
            <div className="flex flex-col items-center gap-2 p-5 sm:border-e sm:border-border sm:[&:first-child]:border-s-0">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t("expiredOpened")}
              </span>
              <span className="text-base font-medium text-foreground tabular-nums">
                {opened}
              </span>
            </div>
            {closed && (
              <div className="flex flex-col items-center gap-2 p-5 border-t border-border sm:border-t-0 sm:border-e sm:border-border">
                <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {t("expiredClosed")}
                </span>
                <span className="text-base font-medium text-foreground tabular-nums">
                  {closed}
                </span>
              </div>
            )}
            <div className="flex flex-col items-center gap-2 p-5 border-t border-border sm:border-t-0">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t("expiredVotes")}
              </span>
              <span className="text-base font-medium text-foreground tabular-nums">
                {poll.totalVotes.toLocaleString(locale)}
              </span>
            </div>
          </div>

          <div className="rise rise-d5 mt-14 flex flex-col items-center gap-[18px]">
            <Link
              href={routes.vote.list}
              className="inline-flex h-[50px] items-center gap-3 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("viewOtherPolls")}
              <span
                className="font-mono text-[15px]"
                data-dir-flip
                style={{ display: "inline-block" }}
              >
                ←
              </span>
            </Link>
          </div>
        </section>
      );
    }
    return (
      <Alert>
        <AlertDescription>{t("closed")}</AlertDescription>
      </Alert>
    );
  }

  if (localStatus === "checking") {
    return (
      <Card>
        <CardHeader>
          <CardTitle dir="auto">{poll.title}</CardTitle>
        </CardHeader>
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (localStatus === "alreadyVoted") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center text-center gap-4 py-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("alreadyVotedTitle")}</h2>
            <p dir="auto" className="text-muted-foreground mt-1">
              {poll.title}
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            {t("alreadyVotedDesc")}
          </p>
          <Button asChild>
            <Link href={routes.vote.list}>{t("viewOtherPolls")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <VoteSubmit
      poll={poll}
      onSubmit={({ voterName, voterPhone, optionIds }) => {
        setSubmittedName(voterName);
        setSubmittedOptions(
          poll.options
            .filter((o) => optionIds.includes(o._id))
            .map((o) => o.text)
        );
        submit({
          pollId: poll._id,
          optionIds,
          voterName,
          voterPhone,
          releaseAt: poll.releaseAt,
        });
      }}
      isPending={isPending}
      error={error}
      fieldErrors={fieldErrors}
    />
  );
}
