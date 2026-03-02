import { PageHeader } from "@/components/shared/PageHeader";
import { CreatePollClient } from "./CreatePollClient";

export default function CreatePollPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Poll"
        description="Set up a new poll for your organisation"
      />
      <CreatePollClient />
    </div>
  );
}
