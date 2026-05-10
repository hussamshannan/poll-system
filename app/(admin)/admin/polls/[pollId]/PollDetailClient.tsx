"use client";

import Link from "next/link";
import { Pencil, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { VoterTable } from "@/components/admin/VoterTable";
import { ExportPDFButton } from "@/components/pdf/ExportPDFButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PollAnalytics } from "@/lib/types/analytics.types";
import { VoterRecord } from "@/lib/types/admin.types";
import { routes } from "@/lib/config/routes";
import { isPollReleased } from "@/lib/utils/poll.utils";
import { resetPollVotes } from "@/actions/admin.actions";

interface PollDetailClientProps {
  pollId: string;
  pollTitle: string;
  pollStatus: "draft" | "open" | "closed";
  pollIsExpired: boolean;
  pollReleaseAt: string | null;
  analytics: PollAnalytics;
  voters: VoterRecord[];
  votersTotal: number;
}

export function PollDetailClient({
  pollId,
  pollTitle,
  pollStatus,
  pollIsExpired,
  pollReleaseAt,
  analytics,
  voters,
  votersTotal,
}: PollDetailClientProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      await resetPollVotes(pollId);
      setResetOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pollTitle}</h1>
          <div className="mt-1">
            <StatusBadge
              status={
                pollIsExpired
                  ? "expired"
                  : !isPollReleased({ releaseAt: pollReleaseAt })
                  ? "scheduled"
                  : pollStatus
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <ExportPDFButton analytics={analytics} pollTitle={pollTitle} voters={voters} />
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw className="me-2 h-4 w-4" />
            {t("resetVotesBtn")}
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.admin.pollEdit(pollId)}>
              <Pencil className="me-2 h-4 w-4" />
              {t("editBtn")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics */}
      <AnalyticsPanel analytics={analytics} />

      {/* Voter records */}
      <VoterTable
        pollId={pollId}
        initialVoters={voters}
        initialTotal={votersTotal}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={(open) => !isPending && setResetOpen(open)}
        title={t("resetVotesTitle")}
        description={t("resetVotesDesc", { count: analytics.totalVotes })}
        confirmLabel={t("resetVotesBtn")}
        onConfirm={handleReset}
        loading={isPending}
      />
    </div>
  );
}
