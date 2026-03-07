"use client";

import { useTranslations } from "next-intl";
import { DataTable, Column } from "@/components/common/DataTable";
import { VoterRecord } from "@/lib/types/admin.types";
import { formatDate } from "@/lib/utils/format";

interface VoterTableProps {
  voters: VoterRecord[];
  total: number;
}

export function VoterTable({ voters, total }: VoterTableProps) {
  const t = useTranslations("voterTable");

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
    <DataTable
      columns={columns}
      data={voters}
      keyExtractor={(v) => v._id}
      title={t("tableTitle")}
      total={total}
      emptyMessage={t("empty")}
    />
  );
}
