"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { PollAnalytics } from "@/lib/types/analytics.types";
import { VoterRecord } from "@/lib/types/admin.types";
import type { PDFTranslations } from "./AnalyticsPDFDocument";

interface ExportPDFButtonProps {
  analytics: PollAnalytics;
  pollTitle: string;
  voters: VoterRecord[];
}

export function ExportPDFButton({ analytics, pollTitle, voters }: ExportPDFButtonProps) {
  const t      = useTranslations("pdf");
  const locale = useLocale();

  const [exporting,   setExporting]   = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      const [{ pdf }, { AnalyticsPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./AnalyticsPDFDocument"),
      ]);

      // Build translations object outside PDF render (hooks unavailable inside react-pdf).
      // formatPage is a plain function — safe to call inside react-pdf render props.
      const translations: PDFTranslations = {
        reportTitle:  t("reportTitle"),
        summary:      t("summary"),
        totalVotes:   t("totalVotes"),
        options:      t("options"),
        leadingOption: t("leadingOption"),
        voteBreakdown: t("voteBreakdown"),
        vote:          t("vote"),
        votes:         t("votes"),
        footer:        t("footer"),
        // Use next-intl's proper interpolation instead of manual string replace
        formatPage: (current, total) =>
          t("page", { current: String(current), total: String(total) }),
        voterRecords:  t("voterRecords"),
        name:          t("name"),
        phone:         t("phone"),
        votedFor:      t("votedFor"),
        votedAt:       t("votedAt"),
        noVoters:      t("noVoters"),
      };

      const blob = await pdf(
        <AnalyticsPDFDocument
          analytics={analytics}
          locale={locale}
          translations={translations}
          voters={voters ?? []}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${pollTitle.replace(/\s+/g, "-")}-results.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export error:", err);
      setExportError(t("error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={handleExport} disabled={exporting} variant="outline">
        <FileDown className="ms-2 h-4 w-4" />
        {exporting ? t("exporting") : t("export")}
      </Button>
      {exportError && (
        <p className="text-sm text-destructive">{exportError}</p>
      )}
    </div>
  );
}
