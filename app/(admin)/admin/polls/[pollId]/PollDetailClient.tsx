"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnalyticsPanel } from "@/components/analytics/AnalyticsPanel";
import { VoterTable } from "@/components/admin/VoterTable";
import { ExportPDFButton } from "@/components/pdf/ExportPDFButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PollAnalytics } from "@/lib/types/analytics.types";
import { VoterRecord } from "@/lib/types/admin.types";
import { routes } from "@/lib/config/routes";

interface PollDetailClientProps {
  pollId: string;
  pollTitle: string;
  pollStatus: "draft" | "open" | "closed";
  pollIsExpired: boolean;
  analytics: PollAnalytics;
  voters: VoterRecord[];
  votersTotal: number;
}

export function PollDetailClient({
  pollId,
  pollTitle,
  pollStatus,
  pollIsExpired,
  analytics,
  voters,
  votersTotal,
}: PollDetailClientProps) {
  const t = useTranslations("admin");

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pollTitle}</h1>
          <div className="mt-1">
            <StatusBadge status={pollIsExpired ? "expired" : pollStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <ExportPDFButton analytics={analytics} pollTitle={pollTitle} />
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
      <VoterTable voters={voters} total={votersTotal} />
    </div>
  );
}
