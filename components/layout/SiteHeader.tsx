import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  navItems,
  showAuth = true,
}: SiteHeaderProps) {
  const t = await getTranslations("nav");

  const defaultNavItems: NavItem[] = [
    { href: routes.vote.list, label: t("polls") },
  ];

  const items = navItems ?? defaultNavItems;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center px-4 md:px-6 gap-4">
        <Link
          href={routes.home}
          className="flex items-center gap-2 font-semibold shrink-0"
        >
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>PollApp</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        {items.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="ms-auto flex items-center gap-1">
          <LangToggle />

          {showAuth && (
            <>
              <SignedIn>
                <Link href={routes.admin.dashboard} className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">
                    {t("admin")}
                  </Button>
                </Link>
                <UserButton afterSignOutUrl={routes.home} />
              </SignedIn>
              <SignedOut>
                <Link href={routes.auth.signIn}>
                  <Button variant="ghost" size="sm">
                    {t("signIn")}
                  </Button>
                </Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
