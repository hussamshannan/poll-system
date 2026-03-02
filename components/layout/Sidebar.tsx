"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Palette, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/config/routes";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

// All sidebar variants are defined here — no icon components cross the server boundary
const SIDEBAR_CONFIGS: Record<string, NavItem[]> = {
  admin: [
    {
      href: routes.admin.dashboard,
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    { href: routes.admin.polls, label: "All Polls", icon: FileText },
    { href: routes.admin.settings, label: "Settings", icon: Palette },
  ],
};

interface SidebarProps {
  variant: string;
  sectionLabel?: string;
}

export function Sidebar({ variant, sectionLabel }: SidebarProps) {
  const pathname = usePathname();
  const items = SIDEBAR_CONFIGS[variant] ?? [];

  const isActiveItem = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-e bg-background md:block">
        <div className="p-4">
          {sectionLabel && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {sectionLabel}
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveItem(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex border-t bg-background">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveItem(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
