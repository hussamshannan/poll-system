import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { HeroVoteLoop } from "@/components/hero/HeroVoteLoop";
import { routes } from "@/lib/config/routes";

export default async function HomePage() {
  const t = await getTranslations("landing");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle perspective grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [perspective:1000px]"
        >
          <div
            className="absolute inset-x-0 top-0 h-[120%] origin-top [transform:rotateX(55deg)_scale(1.4)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent_75%)]"
          />
        </div>

        {/* Hero */}
        <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 py-20 text-center">
          <HeroVoteLoop />
          <h1 className="max-w-3xl tracking-tight">
            <span className="block text-3xl font-medium sm:text-4xl lg:text-5xl">
              {t("subtitle")}
            </span>
            <span className="mt-3 block text-5xl font-semibold sm:text-6xl lg:text-7xl">
              <span className="inline-flex items-baseline gap-1.5">
                {t("title")}
                <Sparkles className="h-5 w-5 self-start text-primary sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </span>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("description")}
          </p>

          <div className="mt-10">
            <div className="inline-block rounded-full bg-[linear-gradient(90deg,#f5b7b1,#f9e79f,#a3e4d7,#aed6f1,#bb8fce,#f5b7b1)] p-[1.5px]">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-0 bg-background hover:bg-background"
                asChild
              >
                <Link href={routes.vote.list}>
                  <Plus className="me-2 h-4 w-4" />
                  {t("browsePolls")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
