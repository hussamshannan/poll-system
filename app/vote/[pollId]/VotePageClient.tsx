"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
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
  const [submittedName, setSubmittedName] = useState("");
  const [submittedOptions, setSubmittedOptions] = useState<string[]>([]);

  const localStatus = useSyncExternalStore<LocalStatus>(
    subscribeNoop,
    () => (hasVotedLocally(poll._id) ? "alreadyVoted" : "fresh"),
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
    return (
      <Alert>
        <AlertDescription>
          {poll.isExpired ? t("expired") : t("closed")}
        </AlertDescription>
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
        submit({ pollId: poll._id, optionIds, voterName, voterPhone });
      }}
      isPending={isPending}
      error={error}
      fieldErrors={fieldErrors}
    />
  );
}
