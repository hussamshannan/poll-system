import { SiteHeader } from "./SiteHeader";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  /** Pass a sidebar variant name (e.g. "admin") to render a sidebar, or omit for full-width layout. */
  sidebar?: string | null;
  sidebarLabel?: string;
  headerNavItems?: { href: string; label: string }[];
}

export function AppShell({
  children,
  sidebar = null,
  sidebarLabel,
  headerNavItems,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader navItems={headerNavItems} />
      {sidebar ? (
        <div className="flex flex-1">
          <Sidebar variant={sidebar} sectionLabel={sidebarLabel} />
          <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">{children}</main>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
}
