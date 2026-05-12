"use client";

import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import { PollAnalytics } from "@/lib/types/analytics.types";
import { VoterRecord } from "@/lib/types/admin.types";

/* ── Font registration ───────────────────────────────────────────────
   IBM Plex Sans Arabic — same font used by the web app (html[dir="rtl"]).
   Covers full Arabic + Latin Unicode ranges with stable OpenType tables.
   ─────────────────────────────────────────────────────────────────── */
Font.register({
  family: "IBMPlexSansArabic",
  fonts: [
    { src: "/fonts/IBMPlexSansArabic-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/IBMPlexSansArabic-Bold.ttf",    fontWeight: 700 },
  ],
});

// Disable automatic hyphenation — it corrupts Arabic letter shaping.
Font.registerHyphenationCallback((word) => [word]);

/* ── Design tokens ───────────────────────────────────────────────── */
const BRAND  = "#111827";
const ACCENT = "#4e78e8";
const MUTED  = "#6b7280";
const BORDER = "#e5e7eb";
const LIGHT  = "#f9fafb";
const WHITE  = "#ffffff";

/* ── Translations interface ──────────────────────────────────────── */
export interface PDFTranslations {
  reportTitle: string;
  summary: string;
  totalVotes: string;
  options: string;
  leadingOption: string;
  voteBreakdown: string;
  vote: string;
  votes: string;
  footer: string;
  /** Called at render time to format page counters. */
  formatPage: (current: number, total: number) => string;
  voterRecords: string;
  rowNumber: string;
  name: string;
  phone: string;
  votedFor: string;
  votedAt: string;
  noVoters: string;
}

/* ── Style factory (depends on isRTL, kept outside render) ──────── */
function makeStyles(isRTL: boolean) {
  const textAlign  = isRTL ? ("right" as const) : ("left" as const);
  const rowDir     = isRTL ? ("row-reverse" as const) : ("row" as const);

  return StyleSheet.create({
    /* Page */
    page: {
      fontFamily: "IBMPlexSansArabic",
      fontSize: 10,
      color: BRAND,
      paddingTop: 36,
      paddingBottom: 52,
      paddingHorizontal: 40,
      backgroundColor: WHITE,
    },

    /* Header */
    header: {
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: ACCENT,
      borderBottomStyle: "solid",
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 4,
      textAlign,
    },
    subtitle: {
      fontSize: 10,
      color: MUTED,
      textAlign,
    },

    /* Section */
    section: { marginBottom: 18 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
      color: ACCENT,
      textAlign,
    },

    /* Summary cards — use fixed percentage widths to avoid flex clipping */
    summaryRow: { flexDirection: rowDir, gap: 8, marginBottom: 4 },
    summaryCard: {
      width: "31%",
      backgroundColor: LIGHT,
      borderRadius: 4,
      padding: 10,
      borderWidth: 1,
      borderColor: BORDER,
      borderStyle: "solid",
    },
    summaryLabel: {
      fontSize: 8,
      color: MUTED,
      marginBottom: 3,
      textAlign,
    },
    summaryValue:      { fontSize: 22, fontWeight: 700, textAlign },
    summaryValueSmall: { fontSize: 11, fontWeight: 700, textAlign },

    /* Option breakdown */
    optionRow: { marginBottom: 10 },
    optionHeader: {
      flexDirection: rowDir,
      justifyContent: "space-between",
      marginBottom: 4,
    },
    optionText: {
      fontSize: 10,
      fontWeight: 700,
      flex: 1,
      textAlign,
      paddingRight: isRTL ? 0 : 8,
      paddingLeft:  isRTL ? 8 : 0,
    },
    optionMeta: { fontSize: 9, color: MUTED },
    barBg:   { height: 7, backgroundColor: BORDER, borderRadius: 3 },
    barFill: { height: 7, backgroundColor: ACCENT, borderRadius: 3 },

    /* Shared table primitives */
    tableHead: {
      flexDirection: rowDir,
      backgroundColor: ACCENT,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 3,
      marginBottom: 1,
    },
    tableHeadCell: {
      fontSize: 9,
      fontWeight: 700,
      color: WHITE,
      textAlign,
    },
    tableRow: {
      flexDirection: rowDir,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
      borderBottomStyle: "solid",
    },
    tableRowAlt: {
      flexDirection: rowDir,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
      borderBottomStyle: "solid",
      backgroundColor: LIGHT,
    },
    tableCell: { fontSize: 9, color: BRAND, textAlign },

    /* Voter-records column widths */
    colIndex:    { flex: 0.5, textAlign: "center" as const },
    colName:     { flex: 2 },
    colPhone:    { flex: 2 },
    colVotedFor: { flex: 3 },
    colVotedAt:  { flex: 2 },

    /* Footer */
    footer: {
      position: "absolute",
      bottom: 18,
      left: 36,
      right: 36,
      flexDirection: rowDir,
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: BORDER,
      borderTopStyle: "solid",
      paddingTop: 5,
    },
    footerText: { fontSize: 7, color: MUTED },

    /* Empty state */
    emptyText: {
      fontSize: 10,
      color: MUTED,
      textAlign: "center",
      marginTop: 40,
    },
  });
}

/* ── Helpers ────────────────────────────────────────────────────── */
function fmtDateTime(raw: string, locale: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  // Use toLocaleString (not toLocaleDateString) for proper datetime output
  return d.toLocaleString(locale, {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function safeJoin(arr: unknown): string {
  if (!Array.isArray(arr)) return String(arr ?? "");
  return arr.filter(Boolean).join("، ");
}

/* ── Component ───────────────────────────────────────────────────── */
interface Props {
  analytics: PollAnalytics;
  locale: string;
  translations: PDFTranslations;
  voters: VoterRecord[];
}

export function AnalyticsPDFDocument({
  analytics,
  locale,
  translations: t,
  voters,
}: Props) {
  const isRTL        = locale === "ar";
  const dateLocale   = isRTL ? "ar-u-nu-latn" : "en-US"; // Latin numerals in dates for both
  const s            = makeStyles(isRTL);

  const { title, totalVotes, optionBreakdown = [] } = analytics;

  const exportDate = new Date().toLocaleDateString(dateLocale, {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });

  const leader = optionBreakdown[0] ?? null;

  const leaderLabel = leader
    ? (leader.text?.length ?? 0) > 25
      ? (leader.text?.slice(0, 25) ?? "") + "…"
      : `${leader.text ?? ""} (${(leader.percentage ?? 0).toFixed(1)}%)`
    : "—";

  return (
    <Document>
      {/* ══════════════════ PAGE 1 — Analytics ══════════════════ */}
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{t.reportTitle} · {exportDate}</Text>
        </View>

        {/* Summary cards */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.summary}</Text>
          <View style={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>{t.totalVotes}</Text>
              <Text style={s.summaryValue}>{totalVotes}</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>{t.options}</Text>
              <Text style={s.summaryValue}>{optionBreakdown.length}</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>{t.leadingOption}</Text>
              <Text style={s.summaryValueSmall}>{leaderLabel}</Text>
            </View>
          </View>
        </View>

        {/* Vote breakdown */}
        {optionBreakdown.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t.voteBreakdown}</Text>
            {optionBreakdown.map((opt) => {
              const pct = Math.min(Math.max(opt.percentage ?? 0, 0), 100);
              return (
                <View key={opt.optionId} style={s.optionRow}>
                  <View style={s.optionHeader}>
                    <Text style={s.optionText}>{opt.text ?? ""}</Text>
                    <Text style={s.optionMeta}>
                      {opt.count ?? 0}{" "}
                      {(opt.count ?? 0) !== 1 ? t.votes : t.vote}
                      {" · "}{(opt.percentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer — repeats on every page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{t.footer}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              t.formatPage(pageNumber, totalPages)
            }
          />
        </View>
      </Page>

      {/* ══════════════════ PAGE 2+ — Voter Records ══════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>{t.voterRecords}</Text>
          <Text style={s.subtitle}>{title} · {exportDate}</Text>
        </View>

        {voters.length === 0 ? (
          <Text style={s.emptyText}>{t.noVoters}</Text>
        ) : (
          <View>
            <View style={s.tableHead}>
              <Text style={[s.tableHeadCell, s.colIndex]}>{t.rowNumber}</Text>
              <Text style={[s.tableHeadCell, s.colName]}>{t.name}</Text>
              <Text style={[s.tableHeadCell, s.colPhone]}>{t.phone}</Text>
              <Text style={[s.tableHeadCell, s.colVotedFor]}>{t.votedFor}</Text>
              <Text style={[s.tableHeadCell, s.colVotedAt]}>{t.votedAt}</Text>
            </View>
            {voters.map((v, i) => (
              <View
                key={v._id ?? i}
                style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}
                wrap={false}
              >
                <Text style={[s.tableCell, s.colIndex]}>
                  {i + 1}
                </Text>
                <Text style={[s.tableCell, s.colName]}>
                  {v.voterName ?? ""}
                </Text>
                <Text style={[s.tableCell, s.colPhone]}>
                  {v.voterPhone ?? ""}
                </Text>
                <Text style={[s.tableCell, s.colVotedFor]}>
                  {safeJoin(v.optionTexts)}
                </Text>
                <Text style={[s.tableCell, s.colVotedAt]}>
                  {v.votedAt ? fmtDateTime(v.votedAt, dateLocale) : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{t.footer}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              t.formatPage(pageNumber, totalPages)
            }
          />
        </View>
      </Page>
    </Document>
  );
}
