"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Type,
  ListChecks,
  Settings2,
  CalendarClock,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  const t = useTranslations("pollForm");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreatePollSchema) as never,
    defaultValues: {
      title: poll?.title || "",
      description: poll?.description || "",
      options: poll?.options.map((o) => ({ _id: o._id, text: o.text })) || [
        { text: "" },
        { text: "" },
      ],
      choicesPerVoter: poll?.choicesPerVoter ?? 1,
      isAnonymous: poll?.isAnonymous || false,
      expiresAt: poll?.expiresAt ? poll.expiresAt.slice(0, 16) : null,
      releaseAt: poll?.releaseAt ? poll.releaseAt.slice(0, 16) : null,
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

  const submitLabel = isPending
    ? poll
      ? t("updating")
      : t("creating")
    : poll
      ? t("updateBtn")
      : t("createBtn");

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* ─── Left column: the content voters will see ────────────────── */}
        <div className="space-y-4">
          {/* Basics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Type className="h-4 w-4" />
                {t("basicsTitle")}
              </CardTitle>
              <CardDescription>{t("basicsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("titleLabel")}</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder={t("titlePlaceholder")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("descLabel")}</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder={t("descPlaceholder")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="h-4 w-4" />
                {t("optionsTitle")}
              </CardTitle>
              <CardDescription>{t("optionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <OptionEditor
                control={form.control}
                errors={
                  form.formState.errors.options as
                    | Record<string, { message?: string }>
                    | undefined
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* ─── Right column: rules, schedule, submit ───────────────────── */}
        <div className="space-y-4">
          {/* Voting rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />
                {t("rulesTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="choicesPerVoter">{t("choicesLabel")}</Label>
                <Input
                  id="choicesPerVoter"
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  {...form.register("choicesPerVoter", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  {t("choicesHelp")}
                </p>
                {form.formState.errors.choicesPerVoter && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.choicesPerVoter.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <Label htmlFor="isAnonymous" className="cursor-pointer">
                      {t("anonymous")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("anonymousHelp")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="isAnonymous"
                  checked={form.watch("isAnonymous")}
                  onCheckedChange={(val) =>
                    form.setValue("isAnonymous", val)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4" />
                {t("scheduleTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="releaseAt">{t("releaseLabel")}</Label>
                <Input
                  id="releaseAt"
                  type="datetime-local"
                  {...form.register("releaseAt")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("releaseHelp")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">{t("expiry")}</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  {...form.register("expiresAt")}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
