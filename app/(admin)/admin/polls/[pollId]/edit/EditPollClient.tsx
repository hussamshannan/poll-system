"use client";

import { useRouter } from "next/navigation";
import { PollForm } from "@/components/polls/PollForm";
import { updatePoll } from "@/actions/poll.actions";
import { routes } from "@/lib/config/routes";
import { Poll } from "@/lib/types/poll.types";
import { z } from "zod";
import { CreatePollSchema } from "@/lib/validations/poll.schema";

type FormValues = z.input<typeof CreatePollSchema>;

interface EditPollClientProps {
  poll: Poll;
}

export function EditPollClient({ poll }: EditPollClientProps) {
  const router = useRouter();

  const handleSubmit = (data: FormValues) => {
    return updatePoll({ pollId: poll._id, ...data });
  };

  const handleSuccess = (updated: Poll) => {
    router.push(routes.admin.pollDetail(updated._id));
  };

  return (
    <PollForm
      poll={poll}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
    />
  );
}
