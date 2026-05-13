import Image from "next/image";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { routes } from "@/lib/config/routes";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const [t, locale] = await Promise.all([
    getTranslations("signInPage"),
    getLocale(),
  ]);
  const isRTL = locale === "ar";
  const year = new Date().getFullYear();
  const brandName = "PollApp";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Brand top corner — over the form column */}
      <Link
        href={routes.home}
        className="absolute top-7 z-30 flex items-center gap-2.5 text-sm font-medium tracking-tight start-8 md:start-[calc(50%+32px)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
          <BarChart3 className="h-3.5 w-3.5" />
        </span>
        <span>{brandName}</span>
      </Link>

      {/* Page grid */}
      <main className="relative z-10 grid min-h-screen md:grid-cols-2">
        {/* Hero column — order flips in RTL so the photo stays on the same visual side */}
        <aside
          className={
            "relative hidden overflow-hidden bg-foreground/[0.05] md:block " +
            (isRTL ? "md:order-2" : "md:order-1")
          }
        >
          <Image
            src="/sign-in-hero.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />

          {/* Dark scrim for legibility */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/55"
          />

          {/* Top meta */}
          <div className="absolute inset-x-9 top-8 z-10 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.10em] text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              style={{
                boxShadow:
                  "0 0 0 4px color-mix(in oklch, var(--primary) 22%, transparent)",
              }}
            />
            <span className="font-mono lowercase">
              {brandName.toLowerCase()} · since 2019
            </span>
          </div>

          {/* Hero copy bottom */}
          <div className="absolute inset-x-11 bottom-11 z-10 text-white/95 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
            <h2 className="max-w-[14ch] text-balance text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroHeadline")}
            </h2>
            <p className="mt-[18px] max-w-[38ch] text-[15px] leading-relaxed text-white/80">
              {t("heroBody")}
            </p>
          </div>
        </aside>

        {/* Form column */}
        <section
          className={
            "relative flex items-center justify-center px-6 py-24 md:px-12 " +
            (isRTL ? "md:order-1" : "md:order-2")
          }
        >
          <div className="w-full max-w-[380px]">
            <span className="mb-[18px] inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-primary" />
              <span className="font-mono">{t("eyebrow")}</span>
            </span>

            <h1 className="text-[28px] font-medium leading-[1.15] tracking-tight">
              {t("title")}
            </h1>
            <p className="mb-7 mt-2 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>

            <SignInForm />
          </div>
        </section>
      </main>

      {/* Footer — pinned within form column */}
      <footer
        className={
          "absolute bottom-5 z-20 flex items-center justify-between gap-4 text-xs text-muted-foreground inset-x-6 md:inset-x-12 " +
          (isRTL
            ? "md:start-12 md:end-[calc(50%+32px)]"
            : "md:start-[calc(50%+32px)] md:end-12")
        }
      >
        <span className="font-mono">{t("footerCopy", { year })}</span>
        <span className="flex gap-5">
          <Link href="#" className="hover:text-foreground">
            {t("footerPrivacy")}
          </Link>
          <Link href="#" className="hover:text-foreground">
            {t("footerTerms")}
          </Link>
          <Link href="#" className="hover:text-foreground">
            {t("footerSupport")}
          </Link>
        </span>
      </footer>
    </div>
  );
}
