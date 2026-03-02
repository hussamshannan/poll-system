"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { SiteTheme, ThemeName, ThemeMode, THEMES } from "@/lib/types/theme.types";
import { updateSiteTheme } from "@/actions/theme.actions";

interface ThemeEditorProps {
  initialTheme: SiteTheme;
}

export function ThemeEditor({ initialTheme }: ThemeEditorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(initialTheme.themeName);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(initialTheme.mode);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Apply preview to the DOM in real time
  useEffect(() => {
    document.documentElement.dataset.theme = selectedTheme;
    document.documentElement.classList.toggle("dark", selectedMode === "dark");
  }, [selectedTheme, selectedMode]);

  const handleThemeSelect = (id: ThemeName) => {
    setSelectedTheme(id);
    setMessage(null);
  };

  const handleModeToggle = (mode: ThemeMode) => {
    setSelectedMode(mode);
    setMessage(null);
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSiteTheme({ themeName: selectedTheme, mode: selectedMode });
      if (result.success) {
        setMessage({ type: "success", text: "Theme saved! Changes are now live site-wide." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const hasChanges =
    selectedTheme !== initialTheme.themeName || selectedMode !== initialTheme.mode;

  return (
    <div className="space-y-6">
      {/* Theme picker */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme) => {
              const swatches = theme.preview[selectedMode];
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-lg border-2 p-4 text-start transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute end-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}

                  {/* Color swatch row */}
                  <div className="flex gap-2">
                    <span
                      className="h-8 w-8 rounded-full border shadow-sm"
                      style={{ background: swatches.bg }}
                    />
                    <span
                      className="h-8 w-8 rounded-full border shadow-sm"
                      style={{ background: swatches.primary }}
                    />
                    <span
                      className="h-8 w-8 rounded-full border shadow-sm"
                      style={{ background: swatches.accent }}
                    />
                  </div>

                  {/* Mini UI preview */}
                  <div
                    className="rounded-md p-2 text-xs"
                    style={{ background: swatches.bg, color: swatches.primary }}
                  >
                    <div
                      className="mb-1 h-2 w-16 rounded-full"
                      style={{ background: swatches.primary }}
                    />
                    <div
                      className="h-1.5 w-10 rounded-full opacity-40"
                      style={{ background: swatches.primary }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mode toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedMode === "light" ? "default" : "outline"}
              onClick={() => handleModeToggle("light")}
              className="flex-1 gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={selectedMode === "dark" ? "default" : "outline"}
              onClick={() => handleModeToggle("dark")}
              className="flex-1 gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="space-y-3">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isPending} className="flex-1">
            {isPending ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </Button>
          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTheme(initialTheme.themeName);
                setSelectedMode(initialTheme.mode);
              }}
              disabled={isPending}
            >
              Discard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
