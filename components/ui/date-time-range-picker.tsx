"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateTimeRangeValue {
  from: string | null;
  to: string | null;
}

interface DateTimeRangePickerProps {
  id?: string;
  value: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parseValue(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function serialize(date: Date): string {
  return date.toISOString();
}

function getTimeString(value: string | null): string {
  const d = parseValue(value);
  if (!d) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateAndTime(
  date: Date,
  time: string,
  fallback: [number, number]
): Date {
  const next = new Date(date);
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (match) {
    next.setHours(Number(match[1]), Number(match[2]), 0, 0);
  } else {
    next.setHours(fallback[0], fallback[1], 0, 0);
  }
  return next;
}

export function DateTimeRangePicker({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: DateTimeRangePickerProps) {
  const t = useTranslations("dateTime");
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  const fromDate = parseValue(value.from);
  const toDate = parseValue(value.to);
  const fromTime = getTimeString(value.from);
  const toTime = getTimeString(value.to);

  const selectedRange: DateRange | undefined =
    fromDate || toDate
      ? { from: fromDate ?? undefined, to: toDate ?? undefined }
      : undefined;

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range || (!range.from && !range.to)) {
      onChange({ from: null, to: null });
      return;
    }
    const nextFrom = range.from
      ? serialize(combineDateAndTime(range.from, fromTime, [9, 0]))
      : null;
    const nextTo = range.to
      ? serialize(combineDateAndTime(range.to, toTime, [18, 0]))
      : null;
    onChange({ from: nextFrom, to: nextTo });
  };

  const handleFromTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!fromDate) return;
    const next = combineDateAndTime(fromDate, event.target.value, [9, 0]);
    onChange({ ...value, from: serialize(next) });
  };

  const handleToTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!toDate) return;
    const next = combineDateAndTime(toDate, event.target.value, [18, 0]);
    onChange({ ...value, to: serialize(next) });
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange({ from: null, to: null });
  };

  const displayLocale = locale === "ar" ? arLocale : undefined;
  const isRtl = locale === "ar";
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const hasValue = Boolean(fromDate || toDate);
  const fromStr = fromDate
    ? format(fromDate, "PPP p", { locale: displayLocale })
    : t("any");
  const toStr = toDate
    ? format(toDate, "PPP p", { locale: displayLocale })
    : t("any");
  const triggerLabel = hasValue ? (
    <span className="flex flex-1 items-center gap-2 truncate">
      <span className="truncate">{fromStr}</span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
        data-dir-flip
      />
      <span className="truncate">{toStr}</span>
    </span>
  ) : (
    <span className="flex-1 truncate">
      {placeholder ?? t("rangePlaceholder")}
    </span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-start font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
          {triggerLabel}
          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label={t("clear")}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange({ from: null, to: null });
                }
              }}
              className="ms-2 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          captionLayout="dropdown"
          dir={isRtl ? "rtl" : "ltr"}
          locale={displayLocale}
          disabled={{ before: today }}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3 border-t p-3">
          <div className="space-y-1.5">
            <Label
              htmlFor={id ? `${id}-from-time` : undefined}
              className="text-xs text-muted-foreground"
            >
              {t("startTime")}
            </Label>
            <Input
              id={id ? `${id}-from-time` : undefined}
              type="time"
              step={60}
              value={fromTime}
              onChange={handleFromTimeChange}
              disabled={!fromDate}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={id ? `${id}-to-time` : undefined}
              className="text-xs text-muted-foreground"
            >
              {t("endTime")}
            </Label>
            <Input
              id={id ? `${id}-to-time` : undefined}
              type="time"
              step={60}
              value={toTime}
              onChange={handleToTimeChange}
              disabled={!toDate}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
