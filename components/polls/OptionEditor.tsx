"use client";

import { Control, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface OptionEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  errors?: Record<string, { message?: string }>;
}

export function OptionEditor({ control, errors }: OptionEditorProps) {
  const t = useTranslations("optionEditor");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {fields.map((field, index) => (
          <li key={field.id} className="group flex items-center gap-2">
            <input
              type="hidden"
              {...control.register(`options.${index}._id`)}
            />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground tabular-nums">
              {index + 1}
            </span>
            <Input
              {...control.register(`options.${index}.text`)}
              placeholder={t("placeholder", { n: index + 1 })}
              className="flex-1"
              dir="auto"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length <= 2}
              aria-label="Remove option"
              className="opacity-60 transition-opacity hover:opacity-100 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {errors && typeof errors === "object" && "root" in errors && (
        <p className="text-sm text-destructive">
          {(errors as Record<string, { message?: string }>).root?.message}
        </p>
      )}

      {fields.length < 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ text: "" })}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="me-2 h-4 w-4" />
          {t("addOption")}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        {t("hint", { min: 2, max: 10, current: fields.length })}
      </p>
    </div>
  );
}
