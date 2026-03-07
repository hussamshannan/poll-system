"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { PollAnalytics } from "@/lib/types/analytics.types";

interface ExportPDFButtonProps {
  analytics: PollAnalytics;
  pollTitle: string;
}

export function ExportPDFButton({ analytics, pollTitle }: ExportPDFButtonProps) {
  const t = useTranslations("pdf");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      const [{ pdf }, { AnalyticsPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./AnalyticsPDFDocument"),
      ]);

      const blob = await pdf(
        <AnalyticsPDFDocument analytics={analytics} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pollTitle.replace(/\s+/g, "-")}-results.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export error:", error);
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
