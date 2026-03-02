"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import SiteSettings from "@/lib/models/SiteSettings.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";
import { SiteTheme, DEFAULT_THEME } from "@/lib/types/theme.types";
import { SiteThemeSchema } from "@/lib/validations/theme.schema";
import { requireAdmin } from "@/lib/utils/admin.utils";

export async function getSiteTheme(): Promise<ActionResult<SiteTheme>> {
  try {
    await connectToDatabase();

    const settings = await SiteSettings.findOneAndUpdate(
      { _id: "singleton" },
      { $setOnInsert: { theme: DEFAULT_THEME } },
      { upsert: true, returnDocument: "after", lean: true }
    );

    const raw = settings?.theme as Record<string, unknown> | undefined;

    // Graceful migration: old documents have `primaryColor` instead of `themeName`
    if (raw && typeof raw.themeName === "string" && typeof raw.mode === "string") {
      return ok({ themeName: raw.themeName, mode: raw.mode } as SiteTheme);
    }

    return ok(DEFAULT_THEME);
  } catch (error) {
    console.error("getSiteTheme error:", error);
    return ok(DEFAULT_THEME);
  }
}

export async function updateSiteTheme(
  input: unknown
): Promise<ActionResult<SiteTheme>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    const parsed = SiteThemeSchema.safeParse(input);
    if (!parsed.success) {
      return err("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const { userId } = await (await import("@clerk/nextjs/server")).auth();

    await SiteSettings.findByIdAndUpdate(
      "singleton",
      {
        $set: {
          theme: parsed.data,
          updatedBy: userId || "",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    revalidatePath("/", "layout");
    return ok(parsed.data);
  } catch (error) {
    console.error("updateSiteTheme error:", error);
    return err("Failed to update theme");
  }
}
