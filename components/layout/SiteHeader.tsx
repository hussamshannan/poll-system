import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LangToggle } from "./LangToggle";
import { routes } from "@/lib/config/routes";

interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  navItems?: NavItem[];
  showAuth?: boolean;
}

export async function SiteHeader({
  navItems = [],
  showAuth = true,
}: SiteHeaderProps) {
  const [t, tLanding] = await Promise.all([
    getTranslations("nav"),
    getTranslations("landing"),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
        {/* Brand lockup */}
        <Link
          href={routes.home}
          className="flex shrink-0 items-center gap-3 text-foreground hover:opacity-90"
        >
          <span
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-[10px] bg-primary text-[14px] font-extrabold tracking-[0.04em] text-primary-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary),black_25%)] md:h-11 md:w-11 md:text-[15px]"
          >
            CB
          </span>
          <span className="hidden flex-col leading-[1.15] sm:flex">
            <span className="text-[14px] font-semibold md:text-[15px]">
              {tLanding("subtitle")}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:text-[12.5px]">
              CBOSRA · est. 2023
            </span>
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {navItems.length > 0 && (
            <nav className="me-1 hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <LangToggle />

          {showAuth && (
            <>
              <SignedIn>
                <Link
                  href={routes.admin.dashboard}
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("admin")}
                </Link>
                <UserButton afterSignOutUrl={routes.home} />
              </SignedIn>
              <SignedOut>
                <Link
                  href={routes.auth.signIn}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 sm:px-4"
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="hidden xs:inline sm:inline">{t("signIn")}</span>
                </Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
