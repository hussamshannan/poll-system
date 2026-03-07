import { Vote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PollGrid } from "@/components/polls/PollGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { listOpenPolls } from "@/actions/poll.actions";
import { routes } from "@/lib/config/routes";

export default async function VoteListPage() {
  const [result, t] = await Promise.all([
    listOpenPolls(),
    getTranslations("vote"),
  ]);
  const polls = result.success ? result.data : [];

  const subtitle =
    polls.length > 0
      ? polls.length === 1
        ? t("available", { count: polls.length })
        : t("availablePlural", { count: polls.length })
      : t("noneOpen");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          </div>

          <PollGrid
            polls={polls}
            hrefBuilder={(poll) => routes.vote.poll(poll._id)}
            emptyState={
              <EmptyState
                title={t("noActivePolls")}
                description={t("noActivePollsDesc")}
                icon={<Vote size={48} strokeWidth={1} />}
              />
            }
          />
        </div>
      </main>
    </div>
  );
}
