"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Search, Users, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  findDuplicateCandidates,
  resolveDuplicateGroup,
  type DuplicateScanResult,
  type DuplicateGroup,
  type DuplicatePollGroup,
} from "@/actions/admin.actions";
import { routes } from "@/lib/config/routes";

type ReasonKey =
  | "smartDedupReasonPhone"
  | "smartDedupReasonPrefix"
  | "smartDedupReasonSubset";

const REASON_KEY: Record<DuplicateGroup["reason"], ReasonKey> = {
  "phone-match": "smartDedupReasonPhone",
  "name-prefix": "smartDedupReasonPrefix",
  "name-subset": "smartDedupReasonSubset",
};

export function VoterDataMaintenanceCard() {
  const t = useTranslations("admin");
  const locale = useLocale();

  const [scanPending, startScan] = useTransition();
  const [scan, setScan] = useState<DuplicateScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [keepByGroup, setKeepByGroup] = useState<Record<string, string>>({});
  const [dismissedGroups, setDismissedGroups] = useState<Set<string>>(new Set());
  const [resolvedGroups, setResolvedGroups] = useState<Set<string>>(new Set());
  const [confirmGroup, setConfirmGroup] = useState<{
    pollId: string;
    group: DuplicateGroup;
  } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveMessage, setResolveMessage] = useState<string | null>(null);

  const handleScan = () => {
    setScanError(null);
    setResolveError(null);
    setResolveMessage(null);
    startScan(async () => {
      const res = await findDuplicateCandidates();
      if (res.success) {
        setScan(res.data);
        // default-keep the oldest vote in each group (sorted asc by date)
        const defaults: Record<string, string> = {};
        for (const poll of res.data.polls) {
          for (const g of poll.groups) {
            defaults[g.groupId] = g.votes[0]._id;
          }
        }
        setKeepByGroup(defaults);
        setDismissedGroups(new Set());
        setResolvedGroups(new Set());
      } else {
        setScanError(res.error);
      }
    });
  };

  const openResolve = (pollId: string, group: DuplicateGroup) => {
    setResolveError(null);
    setConfirmGroup({ pollId, group });
  };

  const handleResolveConfirm = async () => {
    if (!confirmGroup) return;
    const { pollId, group } = confirmGroup;
    const keepId = keepByGroup[group.groupId];
    const removeIds = group.votes
      .map((v) => v._id)
      .filter((id) => id !== keepId);

    setResolvingId(group.groupId);
    const res = await resolveDuplicateGroup({
      pollId,
      keepVoteId: keepId,
      removeVoteIds: removeIds,
    });
    setResolvingId(null);
    setConfirmGroup(null);

    if (res.success) {
      setResolvedGroups((s) => new Set(s).add(group.groupId));
      setResolveMessage(t("smartDedupResolved", { count: res.data.removed }));
    } else {
      setResolveError(res.error);
    }
  };

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Hide dismissed + resolved groups, and any polls left with nothing.
  const visiblePolls: DuplicatePollGroup[] =
    scan?.polls
      .map((p) => ({
        ...p,
        groups: p.groups.filter(
          (g) => !dismissedGroups.has(g.groupId) && !resolvedGroups.has(g.groupId)
        ),
      }))
      .filter((p) => p.groups.length > 0) ?? [];

  const visibleGroupCount = visiblePolls.reduce(
    (sum, p) => sum + p.groups.length,
    0
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {t("maintenanceTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("maintenanceDesc")}</p>

          {scanError && (
            <Alert variant="destructive">
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {resolveMessage && (
            <Alert>
              <AlertDescription>{resolveMessage}</AlertDescription>
            </Alert>
          )}

          {resolveError && (
            <Alert variant="destructive">
              <AlertDescription>{resolveError}</AlertDescription>
            </Alert>
          )}

          <Button variant="outline" onClick={handleScan} disabled={scanPending}>
            {scanPending ? (
              <>
                <LoadingSpinner className="me-2 h-4 w-4" />
                {t("smartDedupScanning")}
              </>
            ) : (
              <>
                <Search className="me-2 h-4 w-4" data-dir-flip />
                {t("smartDedupScanBtn")}
              </>
            )}
          </Button>

          {scan && !scanPending && (
            <>
              {visibleGroupCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("smartDedupNone")}
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("smartDedupSummary", {
                      groups: visibleGroupCount,
                      polls: visiblePolls.length,
                    })}
                  </p>

                  <div className="space-y-4">
                    {visiblePolls.map((poll) => (
                      <div
                        key={poll.pollId}
                        className="rounded-lg border border-border/60"
                      >
                        <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
                          <Link
                            href={routes.admin.pollDetail(poll.pollId)}
                            dir="auto"
                            className="text-sm font-semibold hover:underline"
                          >
                            {poll.pollTitle}
                          </Link>
                        </div>

                        <div className="divide-y divide-border/60">
                          {poll.groups.map((group) => (
                            <GroupCard
                              key={group.groupId}
                              group={group}
                              keepId={keepByGroup[group.groupId]}
                              onKeepChange={(id) =>
                                setKeepByGroup((m) => ({
                                  ...m,
                                  [group.groupId]: id,
                                }))
                              }
                              onResolve={() => openResolve(poll.pollId, group)}
                              onSkip={() =>
                                setDismissedGroups((s) =>
                                  new Set(s).add(group.groupId)
                                )
                              }
                              resolving={resolvingId === group.groupId}
                              dateFmt={dateFmt}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmGroup}
        onOpenChange={(o) => {
          if (!resolvingId && !o) setConfirmGroup(null);
        }}
        title={t("smartDedupConfirmTitle")}
        description={
          confirmGroup
            ? t("smartDedupConfirmDesc", {
                count: confirmGroup.group.votes.length - 1,
              })
            : ""
        }
        confirmLabel={t("smartDedupResolve")}
        onConfirm={handleResolveConfirm}
        loading={!!resolvingId}
      />
    </>
  );
}

interface GroupCardProps {
  group: DuplicateGroup;
  keepId: string | undefined;
  onKeepChange: (id: string) => void;
  onResolve: () => void;
  onSkip: () => void;
  resolving: boolean;
  dateFmt: Intl.DateTimeFormat;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function GroupCard({
  group,
  keepId,
  onKeepChange,
  onResolve,
  onSkip,
  resolving,
  dateFmt,
  t,
}: GroupCardProps) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{t(REASON_KEY[group.reason])}</Badge>
        <Badge variant={group.confidence === "high" ? "default" : "outline"}>
          {group.confidence === "high"
            ? t("smartDedupConfidenceHigh")
            : t("smartDedupConfidenceMedium")}
        </Badge>
        <span className="text-muted-foreground">
          <Users className="me-1 inline h-3 w-3" />
          {group.votes.length}
        </span>
      </div>

      <ul className="space-y-2">
        {group.votes.map((v) => (
          <li key={v._id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/40 p-3 hover:bg-muted/30">
              <input
                type="radio"
                name={`keep-${group.groupId}`}
                value={v._id}
                checked={keepId === v._id}
                onChange={() => onKeepChange(v._id)}
                disabled={resolving}
                className="mt-1 accent-primary"
              />
              <div className="min-w-0 flex-1">
                <div dir="auto" className="text-sm font-medium">
                  {v.voterName}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {v.voterPhone}
                  </span>
                  <span>{dateFmt.format(new Date(v.votedAt))}</span>
                </div>
              </div>
              {keepId === v._id && (
                <span className="text-xs font-semibold text-primary">
                  {t("smartDedupKeep")}
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onResolve} disabled={resolving || !keepId}>
          {resolving ? t("smartDedupResolving") : t("smartDedupResolve")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onSkip} disabled={resolving}>
          {t("smartDedupSkip")}
        </Button>
      </div>
    </div>
  );
}
