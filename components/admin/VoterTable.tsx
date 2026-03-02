import { DataTable, Column } from "@/components/common/DataTable";
import { VoterRecord } from "@/lib/types/admin.types";
import { formatDate } from "@/lib/utils/format";

interface VoterTableProps {
  voters: VoterRecord[];
  total: number;
}

const columns: Column<VoterRecord>[] = [
  {
    key: "name",
    header: "Name",
    render: (v) => <span className="font-medium">{v.voterName}</span>,
  },
  {
    key: "phone",
    header: "Phone",
    render: (v) => (
      <span className="text-muted-foreground font-mono" dir="ltr">
        {v.voterPhone}
      </span>
    ),
  },
  {
    key: "options",
    header: "Voted For",
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
    header: "Voted At",
    render: (v) => (
      <span className="text-muted-foreground">{formatDate(v.votedAt)}</span>
    ),
  },
];

export function VoterTable({ voters, total }: VoterTableProps) {
  return (
    <DataTable
      columns={columns}
      data={voters}
      keyExtractor={(v) => v._id}
      title="Voters"
      total={total}
      emptyMessage="No votes recorded yet."
    />
  );
}
