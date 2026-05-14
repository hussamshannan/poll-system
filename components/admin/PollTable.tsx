"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AdminPoll } from "@/lib/types/admin.types";
import { formatDate } from "@/lib/utils/format";
import { isPollReleased } from "@/lib/utils/poll.utils";
import { routes } from "@/lib/config/routes";

interface PollTableProps {
  polls: AdminPoll[];
  total: number;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PollTable({ polls: initialPolls, total, onDelete }: PollTableProps) {
  const t = useTranslations("pollTable");
  const locale = useLocale();
  const [polls, setPolls] = useState(initialPolls);
  const [deleteTarget, setDeleteTarget] = useState<AdminPoll | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await onDelete(deleteTarget._id);
      if (result.success) {
        setPolls((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    });
  };

  const columns: Column<AdminPoll>[] = [
    {
      key: "title",
      header: t("colTitle"),
      render: (poll) => (
        <span dir="auto" className="font-medium">
          {poll.title}
        </span>
      ),
    },
    {
      key: "status",
      header: t("colStatus"),
      render: (poll) => {
        const effectiveStatus = poll.isExpired
          ? "expired"
          : !isPollReleased(poll)
          ? "scheduled"
          : poll.status;
        return <StatusBadge status={effectiveStatus} />;
      },
    },
    {
      key: "votes",
      header: t("colVotes"),
      render: (poll) => poll.totalVotes,
    },
    {
      key: "created",
      header: t("colCreated"),
      className: "hidden sm:table-cell",
      render: (poll) => (
        <span className="text-muted-foreground">{formatDate(poll.createdAt, locale)}</span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={polls}
        keyExtractor={(p) => p._id}
        title={t("tableTitle")}
        total={total}
        emptyMessage={t("empty")}
        actions={(poll) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={routes.admin.pollDetail(poll._id)}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={routes.admin.pollEdit(poll._id)}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteTarget(poll)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("deleteTitle")}
        description={t("deleteDesc", { title: deleteTarget?.title ?? "" })}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
