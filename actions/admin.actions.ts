"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Poll from "@/lib/models/Poll.model";
import Vote from "@/lib/models/Vote.model";
import User from "@/lib/models/User.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";
import {
  SiteStats,
  AdminPoll,
  AdminUser,
  AdminUserWithRole,
  VoterRecord,
} from "@/lib/types/admin.types";
import { requireAdmin } from "@/lib/utils/admin.utils";

const MASTER_ADMIN_EMAIL = "hussamshannan5@gmail.com";

export async function adminDeletePoll(
  pollId: string
): Promise<ActionResult<{ deleted: true }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();
    const poll = await Poll.findByIdAndDelete(pollId);
    if (!poll) return err("Poll not found");

    await Vote.deleteMany({ pollId: poll._id });
    await User.findOneAndUpdate(
      { clerkId: poll.createdBy },
      { $inc: { pollsCreated: -1 } }
    );

    revalidatePath("/admin/polls");
    return ok({ deleted: true });
  } catch (error) {
    console.error("adminDeletePoll error:", error);
    return err("Failed to delete poll");
  }
}

export async function getSiteStats(): Promise<ActionResult<SiteStats>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPolls,
      totalVotes,
      activePolls,
      pollsCreatedToday,
      votesToday,
    ] = await Promise.all([
      User.countDocuments(),
      Poll.countDocuments(),
      Vote.countDocuments(),
      Poll.countDocuments({ status: "open" }),
      Poll.countDocuments({ createdAt: { $gte: today } }),
      Vote.countDocuments({ createdAt: { $gte: today } }),
    ]);

    return ok({
      totalUsers,
      totalPolls,
      totalVotes,
      activePolls,
      pollsCreatedToday,
      votesToday,
    });
  } catch (error) {
    console.error("getSiteStats error:", error);
    return err("Failed to get site stats");
  }
}

export async function listAllPolls(
  page: number = 1,
  limit: number = 20
): Promise<ActionResult<{ polls: AdminPoll[]; total: number }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;
    const [polls, total] = await Promise.all([
      Poll.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Poll.countDocuments(),
    ]);

    const creatorIds = [...new Set(polls.map((p) => p.createdBy))];
    const users = await User.find({ clerkId: { $in: creatorIds } }).lean();
    const userMap = new Map(users.map((u) => [u.clerkId, u.email]));

    const adminPolls: AdminPoll[] = polls.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      status: p.status,
      totalVotes: p.totalVotes,
      createdBy: p.createdBy,
      creatorEmail: userMap.get(p.createdBy) || "Unknown",
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    }));

    return ok({ polls: adminPolls, total });
  } catch (error) {
    console.error("listAllPolls error:", error);
    return err("Failed to list polls");
  }
}

export async function listAllUsers(
  page: number = 1,
  limit: number = 20
): Promise<ActionResult<{ users: AdminUser[]; total: number }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const adminUsers: AdminUser[] = users.map((u) => ({
      _id: u._id.toString(),
      clerkId: u.clerkId,
      email: u.email,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      pollsCreated: u.pollsCreated,
      createdAt: u.createdAt.toISOString(),
    }));

    return ok({ users: adminUsers, total });
  } catch (error) {
    console.error("listAllUsers error:", error);
    return err("Failed to list users");
  }
}

export async function getVotersForPoll(
  pollId: string,
  page: number = 1,
  limit: number = 50
): Promise<ActionResult<{ voters: VoterRecord[]; total: number }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const poll = await Poll.findById(pollId).lean();
    if (!poll) return err("Poll not found");

    const optionMap = new Map(
      poll.options.map((o) => [o._id.toString(), o.text])
    );

    const skip = (page - 1) * limit;
    const [votes, total] = await Promise.all([
      Vote.find({ pollId })
        .sort({ votedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vote.countDocuments({ pollId }),
    ]);

    const voters: VoterRecord[] = votes.map((v) => ({
      _id: v._id.toString(),
      voterName: v.voterName,
      voterPhone: v.voterPhone,
      optionTexts: v.optionIds.map(
        (id) => optionMap.get(id.toString()) || "Unknown"
      ),
      votedAt: v.votedAt.toISOString(),
    }));

    return ok({ voters, total });
  } catch (error) {
    console.error("getVotersForPoll error:", error);
    return err("Failed to get voters");
  }
}

export async function listUsersWithRoles(): Promise<
  ActionResult<AdminUserWithRole[]>
> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({ limit: 100 });

    const users: AdminUserWithRole[] = clerkUsers.map((u) => {
      const email = u.emailAddresses[0]?.emailAddress ?? "";
      return {
        clerkId: u.id,
        email,
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        imageUrl: u.imageUrl,
        isAdmin: u.publicMetadata?.role === "admin",
        isMaster: email === MASTER_ADMIN_EMAIL,
      };
    });

    return ok(users);
  } catch (error) {
    console.error("listUsersWithRoles error:", error);
    return err("Failed to list users");
  }
}

export async function setAdminRole(
  clerkId: string,
  makeAdmin: boolean
): Promise<ActionResult<{ updated: true }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  // Prevent removing your own admin role
  const { userId } = await auth();
  if (userId === clerkId && !makeAdmin) {
    return err("You cannot remove your own admin role");
  }

  try {
    const client = await clerkClient();
    const target = await client.users.getUser(clerkId);
    const targetEmail = target.emailAddresses[0]?.emailAddress ?? "";
    if (!makeAdmin && targetEmail === MASTER_ADMIN_EMAIL) {
      return err("Cannot remove master admin role");
    }
    await client.users.updateUser(clerkId, {
      publicMetadata: { role: makeAdmin ? "admin" : null },
    });
    revalidatePath("/admin/admins");
    return ok({ updated: true });
  } catch (error) {
    console.error("setAdminRole error:", error);
    return err("Failed to update role");
  }
}

export async function deleteAdminUser(
  clerkId: string
): Promise<ActionResult<{ deleted: true }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  // Prevent deleting yourself
  const { userId } = await auth();
  if (userId === clerkId) return err("You cannot delete your own account");

  try {
    const client = await clerkClient();
    const target = await client.users.getUser(clerkId);
    const targetEmail = target.emailAddresses[0]?.emailAddress ?? "";
    if (targetEmail === MASTER_ADMIN_EMAIL) {
      return err("Cannot delete the master admin account");
    }
    await client.users.deleteUser(clerkId);
    revalidatePath("/admin/admins");
    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteAdminUser error:", error);
    return err("Failed to delete user");
  }
}

export async function inviteAdmin(
  email: string
): Promise<ActionResult<{ invited: true }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "admin" },
      ignoreExisting: true,
    });
    return ok({ invited: true });
  } catch (error) {
    console.error("inviteAdmin error:", error);
    // Extract Clerk's detailed error message if available
    const clerkMessage =
      (error as { errors?: { message: string }[] })?.errors?.[0]?.message;
    const message = clerkMessage ?? (error instanceof Error ? error.message : "Failed to send invitation");
    return err(message);
  }
}
