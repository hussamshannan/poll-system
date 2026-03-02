import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <p className="text-2xl font-bold">{formatNumber(value)}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
