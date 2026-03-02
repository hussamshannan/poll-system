import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils/admin.utils";
import { AppShell } from "@/components/layout/AppShell";
import { routes } from "@/lib/config/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect(routes.auth.signIn);

  const adminStatus = await isAdmin(userId);
  if (!adminStatus) redirect(routes.home);

  return (
    <AppShell sidebar="admin" sidebarLabel="Admin">
      {children}
    </AppShell>
  );
}
