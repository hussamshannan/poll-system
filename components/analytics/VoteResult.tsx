import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OptionVoteCount } from "@/lib/types/analytics.types";
import { formatPercent } from "@/lib/utils/format";

interface VoteResultProps {
  title: string;
  totalVotes: number;
  optionBreakdown: OptionVoteCount[];
}

export function VoteResult({ title, totalVotes, optionBreakdown }: VoteResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {optionBreakdown.map((option) => (
          <div key={option.optionId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{option.text}</span>
              <span className="text-muted-foreground">
                {option.count} ({formatPercent(option.percentage)})
              </span>
            </div>
            <Progress value={option.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
