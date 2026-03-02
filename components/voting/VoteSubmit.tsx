"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VoterInfoForm } from "./VoterInfoForm";
import { OptionSelector } from "./OptionSelector";
import { Poll } from "@/lib/types/poll.types";

interface VoteSubmitProps {
  poll: Poll;
  onSubmit: (data: {
    voterName: string;
    voterPhone: string;
    optionIds: string[];
  }) => void;
  isPending: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function VoteSubmit({
  poll,
  onSubmit,
  isPending,
  error,
  fieldErrors,
}: VoteSubmitProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    if (poll.allowMultipleVotes) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ voterName: name, voterPhone: phone, optionIds: selectedIds });
  };

  const voterErrors = {
    name: fieldErrors?.voterName?.[0],
    phone: fieldErrors?.voterPhone?.[0],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{poll.title}</CardTitle>
        {poll.description && (
          <p className="text-sm text-muted-foreground">{poll.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VoterInfoForm
            name={name}
            phone={phone}
            onChange={(field, value) => {
              if (field === "name") setName(value);
              else setPhone(value);
            }}
            errors={voterErrors}
            disabled={isPending}
          />

          <Separator />

          <OptionSelector
            options={poll.options}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            allowMultiple={poll.allowMultipleVotes}
            disabled={isPending}
          />

          {fieldErrors?.optionIds && (
            <p className="text-sm text-destructive">
              {fieldErrors.optionIds[0]}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending || selectedIds.length === 0}
            className="w-full"
          >
            {isPending ? "Submitting..." : "Cast Vote"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
