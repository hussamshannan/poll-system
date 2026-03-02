"use client";

import { useState } from "react";
import { VoteSubmit } from "@/components/voting/VoteSubmit";
import { VoteConfirmation } from "@/components/voting/VoteConfirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVote } from "@/hooks/useVote";
import { castVote } from "@/actions/vote.actions";
import { Poll } from "@/lib/types/poll.types";

interface VotePageClientProps {
  poll: Poll;
}

export function VotePageClient({ poll }: VotePageClientProps) {
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

  if (poll.status !== "open" || poll.isExpired) {
    return (
      <Alert>
        <AlertDescription>
          {poll.isExpired
            ? "This poll has expired and is no longer accepting votes."
            : "This poll is not currently open for voting."}
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
