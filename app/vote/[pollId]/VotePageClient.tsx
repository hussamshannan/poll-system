"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { VoteSubmit } from "@/components/voting/VoteSubmit";
import { VoteConfirmation } from "@/components/voting/VoteConfirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVote } from "@/hooks/useVote";
import { castVote } from "@/actions/vote.actions";
import { Poll } from "@/lib/types/poll.types";
import { isPollReleased } from "@/lib/utils/poll.utils";

interface VotePageClientProps {
  poll: Poll;
}

export function VotePageClient({ poll }: VotePageClientProps) {
  const t = useTranslations("votePage");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedOptions, setSubmittedOptions] = useState<string[]>([]);

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
          <CardTitle>{poll.title}</CardTitle>
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
