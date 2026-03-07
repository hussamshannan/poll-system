import Link from "next/link";
import { ArrowRight, Vote, BarChart3, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/lib/config/routes";

export default async function HomePage() {
  const t = await getTranslations("landing");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Vote className="h-3.5 w-3.5" />
            {t("badge")}
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
            <span className="text-primary"></span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {t("subtitle")} <br />
            {t("description")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href={routes.vote.list}>
                {t("browsePolls")}
                <ArrowRight className="ms-2 h-4 w-4" data-dir-flip />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href={routes.auth.signIn}>{t("signIn")}</Link>
            </Button>
          </div>
        </section>

        <Separator />

        {/* ── Features ───────────────────────────────────────────────── */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t("feature1Title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("feature1Desc")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t("feature2Title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("feature2Desc")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t("feature3Title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("feature3Desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
