"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { VoterRecord } from "@/lib/types/admin.types";
import { formatDate } from "@/lib/utils/format";
import { getVotersForPoll } from "@/actions/admin.actions";

const PAGE_SIZE = 10;

interface VoterTableProps {
  pollId: string;
  initialVoters: VoterRecord[];
  initialTotal: number;
}

export function VoterTable({
  pollId,
  initialVoters,
  initialTotal,
}: VoterTableProps) {
  const t = useTranslations("voterTable");
  const [voters, setVoters] = useState(initialVoters);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page || isPending) return;
    startTransition(async () => {
      const res = await getVotersForPoll(pollId, next, PAGE_SIZE);
      if (res.success) {
        setVoters(res.data.voters);
        setTotal(res.data.total);
        setPage(next);
      }
    });
  };

  const columns: Column<VoterRecord>[] = [
    {
      key: "name",
      header: t("colName"),
      render: (v) => <span className="font-medium">{v.voterName}</span>,
    },
    {
      key: "phone",
      header: t("colPhone"),
      render: (v) => (
        <span className="text-muted-foreground font-mono" dir="ltr">
          {v.voterPhone}
        </span>
      ),
    },
    {
      key: "options",
      header: t("colVotedFor"),
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.optionTexts.map((text, i) => (
            <span
              key={i}
              className="inline-block bg-primary/10 text-primary text-xs rounded px-2 py-0.5"
            >
              {text}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "votedAt",
      header: t("colVotedAt"),
      className: "hidden sm:table-cell",
      render: (v) => (
        <span className="text-muted-foreground">{formatDate(v.votedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={voters}
        keyExtractor={(v) => v._id}
        title={t("tableTitle")}
        total={total}
        emptyMessage={t("empty")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            {t("pageOf", { current: page, total: totalPages })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" data-dir-flip />
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages || isPending}
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" data-dir-flip />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
