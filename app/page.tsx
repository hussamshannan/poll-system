import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { routes } from "@/lib/config/routes";

export default async function HomePage() {
  const t = await getTranslations("landing");

  const features = [t("feature1"), t("feature2"), t("feature3")];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* Left: editorial text column */}
          <section className="flex flex-col justify-center gap-7 px-6 py-14 sm:px-10 md:py-20 lg:ps-16 lg:pe-14 lg:pt-22 lg:pb-18">
            <span className="rise inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-[14px] font-semibold tracking-[0.01em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
              {t("badge")}
            </span>

            <h1 className="rise rise-d1 text-balance text-[clamp(40px,6.5vw,60px)] font-bold leading-[1.05] tracking-[-0.02em]">
              {t("headlineOne")}
              <br />
              <span className="text-primary">{t("headlineTwo")}</span>
            </h1>

            <p className="rise rise-d2 max-w-[520px] text-pretty text-[17px] leading-[1.6] text-muted-foreground sm:text-[19px]">
              {t("lede")}
            </p>

            <div className="rise rise-d3 flex flex-col items-start gap-2.5">
              <Link
                href={routes.vote.list}
                className="group inline-flex h-14 items-center gap-3.5 rounded-[14px] bg-primary px-8 text-[18px] font-bold text-primary-foreground shadow-[0_10px_24px_-16px_color-mix(in_oklch,var(--primary),transparent_30%)] transition-transform hover:translate-y-[-1px] sm:h-[68px] sm:px-9 sm:text-[20px]"
              >
                <span>{t("browseCta")}</span>
                <ArrowRight
                  data-dir-flip
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <span className="text-sm text-muted-foreground">
                {t("browseCtaHint")}
              </span>
            </div>

            <ul className="rise rise-d4 mt-2 grid max-w-[560px] grid-cols-1 gap-5 border-t border-border/60 pt-5 sm:grid-cols-3">
              {features.map((feature) => (
                <li key={feature} className="flex flex-col gap-1.5">
                  <span className="inline-flex text-primary">
                    <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="text-[14px] leading-[1.4] text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right: editorial photo column */}
          <section className="rise rise-d2 p-6">
            <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-[20px] bg-muted ring-1 ring-border/50">
              <Image
                src="/hero-img.jpg"
                alt={t("photoAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 49vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-6 start-6 max-w-[320px] rounded-[10px] border border-border bg-background/95 px-3.5 py-2.5 text-[13px] leading-snug text-muted-foreground shadow-sm backdrop-blur">
                {t("photoCaption")}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
