import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/lib/config/routes";

interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  navItems?: NavItem[];
  showAuth?: boolean;
}

const defaultNavItems: NavItem[] = [{ href: routes.vote.list, label: "Polls" }];

export function SiteHeader({
  navItems = defaultNavItems,
  showAuth = true,
}: SiteHeaderProps) {
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

        {navItems.length > 0 && (
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        {showAuth && (
          <div className="ms-auto flex items-center gap-2">
            <SignedIn>
              <Link href={routes.admin.dashboard}>
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
              <UserButton afterSignOutUrl={routes.home} />
            </SignedIn>
            <SignedOut>
              <Link href={routes.auth.signIn}>
                <Button variant="ghost" size="sm">
                  Admin Sign In
                </Button>
              </Link>
            </SignedOut>
          </div>
        )}
      </div>
    </header>
  );
}
