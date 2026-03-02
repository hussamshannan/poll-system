import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VoteConfirmationProps {
  pollTitle: string;
  selectedOptions: string[];
  voterName: string;
}

export function VoteConfirmation({
  pollTitle,
  selectedOptions,
  voterName,
}: VoteConfirmationProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center gap-4 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Thank you, {voterName}!</h2>
          <p className="text-muted-foreground mt-1">
            Your vote on &ldquo;{pollTitle}&rdquo; has been recorded.
          </p>
        </div>
        {selectedOptions.length > 0 && (
          <div className="w-full text-start space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              You voted for:
            </p>
            <ul className="space-y-1">
              {selectedOptions.map((opt, i) => (
                <li
                  key={i}
                  className="text-sm bg-primary/5 border border-primary/20 rounded-md px-3 py-1.5"
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
