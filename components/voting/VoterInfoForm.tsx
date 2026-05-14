"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VoterInfoFormProps {
  name: string;
  phone: string;
  onChange: (field: "name" | "phone", value: string) => void;
  errors?: { name?: string; phone?: string };
  disabled?: boolean;
}

export function VoterInfoForm({
  name,
  phone,
  onChange,
  errors,
  disabled,
}: VoterInfoFormProps) {
  const t = useTranslations("voterForm");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voterName">{t("nameLabel")}</Label>
        <Input
          id="voterName"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={t("namePlaceholder")}
          disabled={disabled}
          autoFocus
          dir="auto"
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="voterPhone">{t("phoneLabel")}</Label>
        <Input
          id="voterPhone"
          type="tel"
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder={t("phonePlaceholder")}
          dir="ltr"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t("phoneHint")}</p>
        {errors?.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
    </div>
  );
}
