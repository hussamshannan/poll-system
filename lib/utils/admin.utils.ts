import { auth, clerkClient } from "@clerk/nextjs/server";

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const adminStatus = await isAdmin(userId);
  if (!adminStatus) return { success: false, error: "Forbidden" };

  return null;
}
