"use client";

import { Control, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface OptionEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  errors?: Record<string, { message?: string }>;
}

export function OptionEditor({ control, errors }: OptionEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Options</label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            {...control.register(`options.${index}.text`)}
            placeholder={`Option ${index + 1}`}
          />
          {fields.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
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
        >
          <PlusCircle className="me-2 h-4 w-4" />
          Add Option
        </Button>
      )}
    </div>
  );
}
