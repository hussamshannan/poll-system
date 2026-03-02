"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OptionEditor } from "./OptionEditor";
import { CreatePollSchema } from "@/lib/validations/poll.schema";
import { Poll } from "@/lib/types/poll.types";
import { ActionResult } from "@/lib/types/action-result.types";
import { z } from "zod";

type FormValues = z.input<typeof CreatePollSchema>;

interface PollFormProps {
  poll?: Poll;
  onSubmit: (data: FormValues) => Promise<ActionResult<Poll>>;
  onSuccess: (poll: Poll) => void;
}

export function PollForm({ poll, onSubmit, onSuccess }: PollFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreatePollSchema) as never,
    defaultValues: {
      title: poll?.title || "",
      description: poll?.description || "",
      options: poll?.options.map((o) => ({ text: o.text })) || [
        { text: "" },
        { text: "" },
      ],
      allowMultipleVotes: poll?.allowMultipleVotes || false,
      isAnonymous: poll?.isAnonymous || false,
      expiresAt: poll?.expiresAt ? poll.expiresAt.slice(0, 16) : null,
    },
  });

  const handleSubmit = (data: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll ? "Edit Poll" : "Create a New Poll"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="What would you like to ask?"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Add more context..."
              rows={3}
            />
          </div>

          <OptionEditor
            control={form.control}
            errors={
              form.formState.errors.options as
                | Record<string, { message?: string }>
                | undefined
            }
          />

          <div className="flex items-center gap-3">
            <Switch
              id="allowMultipleVotes"
              checked={form.watch("allowMultipleVotes")}
              onCheckedChange={(val) => form.setValue("allowMultipleVotes", val)}
            />
            <Label htmlFor="allowMultipleVotes">
              Allow selecting multiple options
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isAnonymous"
              checked={form.watch("isAnonymous")}
              onCheckedChange={(val) => form.setValue("isAnonymous", val)}
            />
            <Label htmlFor="isAnonymous">Anonymous voting</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration (optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              {...form.register("expiresAt")}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? poll
                ? "Updating..."
                : "Creating..."
              : poll
                ? "Update Poll"
                : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
