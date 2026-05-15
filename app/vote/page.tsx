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
  const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 relative">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [perspective:1000px]"
          >
            <div className="absolute inset-x-0 top-0 h-[120%] origin-top [transform:rotateX(55deg)_scale(1.4)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent_75%)]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="rise text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="rise rise-d1 mt-2 text-sm text-muted-foreground sm:text-base">
                  {t("subtitle")}
                </p>
              </div>

              <div className="flex gap-6 sm:gap-8">
                <div className="rise rise-d2">
                  <div className="text-3xl font-semibold tabular-nums sm:text-4xl">
                    {polls.length}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {t("statOpenPolls")}
                  </div>
                </div>
                <div className="rise rise-d3 border-s ps-6 sm:ps-8">
                  <div className="text-3xl font-semibold tabular-nums sm:text-4xl">
                    {totalVotes}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {t("statTotalVotes")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
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
        </section>
      </main>
    </div>
  );
}
