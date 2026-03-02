"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { PollAnalytics } from "@/lib/types/analytics.types";

const BRAND  = "#111827";
const ACCENT = "#4e78e8";
const MUTED  = "#6b7280";
const BORDER = "#e5e7eb";
const LIGHT  = "#f9fafb";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BRAND,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },

  /* ── Header ─────────────────────────────────────────── */
  header: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: "solid",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: MUTED,
  },

  /* ── Section ─────────────────────────────────────────── */
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },

  /* ── Summary cards ───────────────────────────────────── */
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  summaryValueSmall: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Option breakdown ────────────────────────────────── */
  optionRow: {
    marginBottom: 10,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  optionText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    paddingRight: 8,
  },
  optionMeta: {
    fontSize: 10,
    color: MUTED,
  },
  barBg: {
    height: 7,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  barFill: {
    height: 7,
    backgroundColor: ACCENT,
    borderRadius: 4,
  },

  /* ── Table ───────────────────────────────────────────── */
  tableHead: {
    flexDirection: "row",
    backgroundColor: LIGHT,
    padding: "6 8",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 8",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: "solid",
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    color: BRAND,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },

  /* ── Footer ──────────────────────────────────────────── */
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
});

interface Props {
  analytics: PollAnalytics;
}

export function AnalyticsPDFDocument({ analytics }: Props) {
  const { title, totalVotes, optionBreakdown, votesOverTime } = analytics;

  const exportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const leader = optionBreakdown[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Analytics Report · {exportDate}</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Votes</Text>
              <Text style={styles.summaryValue}>{totalVotes}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Options</Text>
              <Text style={styles.summaryValue}>{optionBreakdown.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Leading Option</Text>
              <Text style={styles.summaryValueSmall}>
                {leader
                  ? leader.text.length > 20
                    ? leader.text.slice(0, 20) + "…"
                    : `${leader.text} (${leader.percentage.toFixed(1)}%)`
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vote breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vote Breakdown</Text>
          {optionBreakdown.map((opt) => (
            <View key={opt.optionId} style={styles.optionRow}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionText}>{opt.text}</Text>
                <Text style={styles.optionMeta}>
                  {opt.count} vote{opt.count !== 1 ? "s" : ""} · {opt.percentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.min(Math.max(opt.percentage, 0), 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Votes over time */}
        {votesOverTime.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votes Over Time</Text>
            <View style={styles.tableHead}>
              <Text style={styles.tableCellBold}>Date</Text>
              <Text style={styles.tableCellBold}>Votes</Text>
            </View>
            {votesOverTime.map((row) => (
              <View key={row.date} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {new Date(row.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Text style={styles.tableCell}>{row.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>PollApp · Analytics Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
}
