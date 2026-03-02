"use client";

import { useState, useTransition } from "react";
import { ActionResult } from "@/lib/types/action-result.types";

interface CastVoteInput {
  pollId: string;
  optionIds: string[];
  voterName: string;
  voterPhone: string;
}

interface UseVoteOptions {
  castVoteAction: (
    input: CastVoteInput
  ) => Promise<ActionResult<{ voteId: string }>>;
}

export function useVote({ castVoteAction }: UseVoteOptions) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined> | undefined
  >();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = (input: CastVoteInput) => {
    setError(null);
    setFieldErrors(undefined);
    startTransition(async () => {
      const result = await castVoteAction(input);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors);
      }
    });
  };

  return { submit, isPending, error, fieldErrors, isSubmitted };
}
