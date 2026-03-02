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
  allowMultiple: boolean;
  disabled?: boolean;
}

export function OptionSelector({
  options,
  selectedIds,
  onToggle,
  allowMultiple,
  disabled,
}: OptionSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {allowMultiple ? "Select one or more options" : "Select one option"}
      </p>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option._id);
          return (
            <button
              key={option._id}
              type="button"
              onClick={() => onToggle(option._id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm text-start transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <span>{option.text}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 ms-2" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
