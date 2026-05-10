"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  normalizeVoterData,
  type NormalizeVoterDataResult,
} from "@/actions/admin.actions";

export function VoterDataMaintenanceCard() {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<NormalizeVoterDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await normalizeVoterData();
      setOpen(false);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {t("maintenanceTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("maintenanceDesc")}</p>

          {result && (
            <Alert>
              <AlertDescription>
                {t("maintenanceSuccess", {
                  phones: result.phonesNormalized,
                  names: result.namesNormalized,
                  dupes: result.duplicatesRemoved,
                  polls: result.pollsAffected,
                })}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button variant="outline" onClick={() => setOpen(true)}>
            {t("maintenanceBtn")}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={open}
        onOpenChange={(o) => !isPending && setOpen(o)}
        title={t("maintenanceConfirmTitle")}
        description={t("maintenanceConfirmDesc")}
        confirmLabel={t("maintenanceBtn")}
        onConfirm={handleRun}
        loading={isPending}
      />
    </>
  );
}
