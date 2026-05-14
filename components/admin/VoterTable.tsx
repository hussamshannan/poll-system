"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { VoterRecord } from "@/lib/types/admin.types";
import { formatDate } from "@/lib/utils/format";
import { getVotersForPoll, deleteVotes } from "@/actions/admin.actions";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

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
  const locale = useLocale();
  const router = useRouter();
  const [voters, setVoters] = useState(initialVoters);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isFirstRender = useRef(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allVisibleSelected =
    voters.length > 0 && voters.every((v) => selectedIds.has(v._id));
  const hasSearch = debouncedSearch.trim().length > 0;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    startTransition(async () => {
      const res = await getVotersForPoll(pollId, 1, PAGE_SIZE, debouncedSearch);
      if (res.success) {
        setVoters(res.data.voters);
        setTotal(res.data.total);
        setPage(1);
        setSelectedIds(new Set());
      }
    });
  }, [debouncedSearch, pollId]);

  const togglePage = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) voters.forEach((v) => next.add(v._id));
      else voters.forEach((v) => next.delete(v._id));
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page || isPending) return;
    startTransition(async () => {
      const res = await getVotersForPoll(
        pollId,
        next,
        PAGE_SIZE,
        debouncedSearch
      );
      if (res.success) {
        setVoters(res.data.voters);
        setTotal(res.data.total);
        setPage(next);
        setSelectedIds(new Set());
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const ids = [...selectedIds];
      const res = await deleteVotes(pollId, ids);
      if (!res.success) {
        setError(t("deleteError"));
        return;
      }
      const remainingTotal = total - res.data.deletedCount;
      const newTotalPages = Math.max(1, Math.ceil(remainingTotal / PAGE_SIZE));
      const targetPage = Math.min(page, newTotalPages);
      const refresh = await getVotersForPoll(
        pollId,
        targetPage,
        PAGE_SIZE,
        debouncedSearch
      );
      if (refresh.success) {
        setVoters(refresh.data.voters);
        setTotal(refresh.data.total);
        setPage(targetPage);
      }
      setSelectedIds(new Set());
      setConfirmOpen(false);
      setError(null);
      router.refresh();
    });
  };

  const columns: Column<VoterRecord>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={allVisibleSelected}
          onCheckedChange={(checked) => togglePage(checked === true)}
          aria-label={t("selectAll")}
        />
      ),
      className: "w-8",
      render: (v) => (
        <Checkbox
          checked={selectedIds.has(v._id)}
          onCheckedChange={(checked) => toggleRow(v._id, checked === true)}
          aria-label={t("selectRow")}
        />
      ),
    },
    {
      key: "name",
      header: t("colName"),
      render: (v) => (
        <span dir="auto" className="font-medium">
          {v.voterName}
        </span>
      ),
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
              dir="auto"
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
        <span className="text-muted-foreground">{formatDate(v.votedAt, locale)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9 pe-9"
          aria-label={t("searchPlaceholder")}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label={t("clearSearch")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-sm">
            {t("selectedCount", { count: selectedIds.size })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              disabled={isPending}
            >
              {t("clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {t("deleteSelected")}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        data={voters}
        keyExtractor={(v) => v._id}
        title={t("tableTitle")}
        total={total}
        emptyMessage={hasSearch ? t("noMatches") : t("empty")}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !isPending && setConfirmOpen(open)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDesc", { count: selectedIds.size })}
        confirmLabel={t("deleteSelected")}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  );
}
