"use client";

import { useRouter } from "next/navigation";
import { PollForm } from "@/components/polls/PollForm";
import { createPoll } from "@/actions/poll.actions";
import { routes } from "@/lib/config/routes";
import { Poll } from "@/lib/types/poll.types";

export function CreatePollClient() {
  const router = useRouter();

  const handleSuccess = (poll: Poll) => {
    router.push(routes.admin.pollDetail(poll._id));
  };

  return (
    <PollForm
      onSubmit={createPoll}
      onSuccess={handleSuccess}
    />
  );
}
