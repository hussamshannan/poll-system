"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  _id: string;
  text: string;
}

interface OptionSelectorProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  choicesPerVoter: number;
  disabled?: boolean;
}

export function OptionSelector({
  options,
  selectedIds,
  onToggle,
  choicesPerVoter,
  disabled,
}: OptionSelectorProps) {
  const t = useTranslations("votePage");
  const isMulti = choicesPerVoter > 1;

  // When at the cap, only currently-selected options remain clickable
  // (so the voter can untoggle to swap a choice).
  const atCap = isMulti && selectedIds.length >= choicesPerVoter;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {isMulti
          ? t("selectExactly", { count: choicesPerVoter })
          : t("selectOne")}
      </p>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option._id);
          const isLocked = !isSelected && atCap;
          return (
            <button
              key={option._id}
              type="button"
              onClick={() => onToggle(option._id)}
              disabled={disabled || isLocked}
              className={cn(
                "w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-start transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
                (disabled || isLocked) && "opacity-60 cursor-not-allowed"
              )}
            >
              <span>{option.text}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 ms-2" />}
            </button>
          );
        })}
      </div>
      {isMulti && (
        <p
          className={cn(
            "text-xs tabular-nums",
            selectedIds.length === choicesPerVoter
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {t("selectedOf", {
            selected: selectedIds.length,
            required: choicesPerVoter,
          })}
        </p>
      )}
    </div>
  );
}
