"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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
  DashboardOverview,
} from "@/lib/types/admin.types";
import { requireAdmin } from "@/lib/utils/admin.utils";
import { normalizePhone, normalizeName } from "@/lib/utils/phone";

const MASTER_ADMIN_EMAIL = "hussamshannan5@gmail.com";

export interface NormalizeVoterDataResult {
  scanned: number;
  phonesNormalized: number;
  namesNormalized: number;
  duplicatesRemoved: number;
  pollsAffected: number;
}

export async function normalizeVoterData(): Promise<
  ActionResult<NormalizeVoterDataResult>
> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const votes = await Vote.find({})
      .sort({ pollId: 1, votedAt: 1 })
      .select("_id pollId voterName voterPhone")
      .lean();

    const seenPerPoll = new Map<
      string,
      { phones: Set<string>; names: Set<string> }
    >();

    const updates: { id: import("mongoose").Types.ObjectId; voterName: string; voterPhone: string }[] = [];
    const dupIds: import("mongoose").Types.ObjectId[] = [];
    const pollsTouched = new Set<string>();

    let phonesNormalized = 0;
    let namesNormalized = 0;

    for (const v of votes) {
      const pollKey = v.pollId.toString();
      const seen =
        seenPerPoll.get(pollKey) ??
        { phones: new Set<string>(), names: new Set<string>() };
      seenPerPoll.set(pollKey, seen);

      const np = normalizePhone(v.voterPhone);
      const nn = normalizeName(v.voterName);

      // Invalid phone after normalization → drop the row
      if (!np || !nn) {
        dupIds.push(v._id);
        pollsTouched.add(pollKey);
        continue;
      }

      // Phone or name collides with an earlier vote in the same poll → drop
      if (seen.phones.has(np) || seen.names.has(nn)) {
        dupIds.push(v._id);
        pollsTouched.add(pollKey);
        continue;
      }

      seen.phones.add(np);
      seen.names.add(nn);

      const phoneChanged = np !== v.voterPhone;
      const nameChanged = nn !== v.voterName;
      if (phoneChanged) phonesNormalized++;
      if (nameChanged) namesNormalized++;
      if (phoneChanged || nameChanged) {
        updates.push({ id: v._id, voterName: nn, voterPhone: np });
      }
    }

    // Apply normalized values to kept votes (batched).
    if (updates.length > 0) {
      await Vote.bulkWrite(
        updates.map((u) => ({
          updateOne: {
            filter: { _id: u.id },
            update: { $set: { voterName: u.voterName, voterPhone: u.voterPhone } },
          },
        }))
      );
    }

    // Drop the duplicates / invalid rows.
    if (dupIds.length > 0) {
      await Vote.deleteMany({ _id: { $in: dupIds } });
    }

    // Recompute Poll.totalVotes only for polls that lost votes.
    for (const pollKey of pollsTouched) {
      const remaining = await Vote.countDocuments({ pollId: pollKey });
      await Poll.findByIdAndUpdate(pollKey, { $set: { totalVotes: remaining } });
    }

    // Now that the data is clean, ensure both unique indexes exist.
    // syncIndexes drops any indexes the schema no longer declares and
    // creates any missing ones (including the re-added voterName index).
    try {
      await Vote.syncIndexes();
    } catch (e) {
      console.error("normalizeVoterData: syncIndexes failed:", e);
      // Cleanup itself succeeded — surface the partial-success counts anyway.
    }

    return ok({
      scanned: votes.length,
      phonesNormalized,
      namesNormalized,
      duplicatesRemoved: dupIds.length,
      pollsAffected: pollsTouched.size,
    });
  } catch (error) {
    console.error("normalizeVoterData error:", error);
    return err("Failed to normalize voter data");
  }
}

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

export async function resetPollVotes(
  pollId: string
): Promise<ActionResult<{ reset: true; deletedCount: number }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const poll = await Poll.findById(pollId);
    if (!poll) return err("Poll not found");

    const result = await Vote.deleteMany({ pollId: poll._id });
    await Poll.findByIdAndUpdate(pollId, { $set: { totalVotes: 0 } });

    revalidatePath("/admin/polls");
    revalidatePath(`/admin/polls/${pollId}`);
    revalidatePath(`/vote/${pollId}`);

    return ok({ reset: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("resetPollVotes error:", error);
    return err("Failed to reset poll votes");
  }
}

export async function deleteVotes(
  pollId: string,
  voteIds: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  if (!Array.isArray(voteIds) || voteIds.length === 0) {
    return err("No votes selected");
  }

  try {
    await connectToDatabase();

    const poll = await Poll.findById(pollId);
    if (!poll) return err("Poll not found");

    const result = await Vote.deleteMany({
      _id: { $in: voteIds },
      pollId: poll._id,
    });

    if (result.deletedCount > 0) {
      await Poll.findByIdAndUpdate(pollId, {
        $inc: { totalVotes: -result.deletedCount },
      });
    }

    revalidatePath("/admin/polls");
    revalidatePath(`/admin/polls/${pollId}`);
    revalidatePath(`/vote/${pollId}`);

    return ok({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error("deleteVotes error:", error);
    return err("Failed to delete votes");
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

function buildSeries(
  raw: { _id: string; count: number }[],
  endDate: Date,
  days: number
): { date: string; count: number }[] {
  const map = new Map(raw.map((r) => [r._id, r.count]));
  const out: { date: string; count: number }[] = [];
  // Build `days` chronological buckets ending at `endDate` (inclusive).
  // i = days-1 → days-1 ago; i = 0 → today.
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setUTCDate(endDate.getUTCDate() - i);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export async function getDashboardOverview(): Promise<
  ActionResult<DashboardOverview>
> {
  const adminErr = await requireAdmin();
  if (adminErr) return adminErr;

  try {
    await connectToDatabase();

    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setUTCDate(todayStart.getUTCDate() - 1);

    // Window of 30 buckets ending at today (today - 29 days .. today).
    const windowStart = new Date(todayStart);
    windowStart.setUTCDate(todayStart.getUTCDate() - 29);

    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setUTCDate(todayStart.getUTCDate() - 14);

    const aggDailyVotes = (since: Date) =>
      Vote.aggregate<{ _id: string; count: number }>([
        { $match: { votedAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$votedAt" } },
            count: { $sum: 1 },
          },
        },
      ]);

    const aggDailyPolls = (since: Date) =>
      Poll.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]);

    // Daily count of distinct voters (one bucket per day, deduped on voterPhone)
    const aggDailyUniqueVoters = (since: Date) =>
      Vote.aggregate<{ _id: string; count: number }>([
        { $match: { votedAt: { $gte: since } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$votedAt" },
              },
              phone: "$voterPhone",
            },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            count: { $sum: 1 },
          },
        },
      ]);

    const [
      votesDaily30,
      pollsDaily30,
      uniqueVotersDaily30,
      votesTotal,
      votesBeforePrev,
      activePollsCurrent,
      activePollsPrev,
      votesTodayCount,
      votesYesterdayCount,
      heatmapRaw,
      statusBreakdownRaw,
      topPollsRaw,
      recentPolls,
      recentVotes,
    ] = await Promise.all([
      aggDailyVotes(windowStart),
      aggDailyPolls(windowStart),
      aggDailyUniqueVoters(windowStart),
      Vote.countDocuments(),
      Vote.countDocuments({ votedAt: { $lt: fourteenDaysAgo } }),
      Poll.countDocuments({ status: "open" }),
      Poll.countDocuments({
        status: "open",
        createdAt: { $lt: fourteenDaysAgo },
      }),
      Vote.countDocuments({ votedAt: { $gte: todayStart } }),
      Vote.countDocuments({
        votedAt: { $gte: yesterdayStart, $lt: todayStart },
      }),
      Vote.aggregate<{ _id: { day: number; hour: number }; count: number }>([
        { $match: { votedAt: { $gte: windowStart } } },
        {
          $group: {
            _id: {
              day: { $dayOfWeek: "$votedAt" },
              hour: { $hour: "$votedAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Poll.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Poll.find()
        .sort({ totalVotes: -1 })
        .limit(5)
        .select("_id title totalVotes status")
        .lean(),
      Poll.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id title createdAt")
        .lean(),
      Vote.find()
        .sort({ votedAt: -1 })
        .limit(5)
        .populate<{ pollId: { _id: import("mongoose").Types.ObjectId; title: string } | null }>(
          "pollId",
          "title"
        )
        .select("_id voterName votedAt pollId")
        .lean(),
    ]);

    const series30Votes = buildSeries(votesDaily30, todayStart, 30);
    const series30Polls = buildSeries(pollsDaily30, todayStart, 30);
    const series30UniqueVoters = buildSeries(
      uniqueVotersDaily30,
      todayStart,
      30
    );

    const last14 = (s: { date: string; count: number }[]) =>
      s.slice(-14).map((p) => p.count);

    return ok({
      kpis: {
        totalVotes: {
          current: votesTotal,
          previous: votesBeforePrev,
          sparkline: last14(series30Votes),
        },
        activePolls: {
          current: activePollsCurrent,
          previous: activePollsPrev,
          // Sparkline of new-poll-creations as a proxy for activity
          sparkline: last14(series30Polls),
        },
        votesToday: {
          current: votesTodayCount,
          previous: votesYesterdayCount,
          sparkline: last14(series30Votes),
        },
      },
      metricSeries: {
        votes: series30Votes,
        polls: series30Polls,
        uniqueVoters: series30UniqueVoters,
      },
      heatmap: heatmapRaw.map((h) => ({
        // MongoDB $dayOfWeek: 1 (Sun) – 7 (Sat). Convert to 0 (Mon) – 6 (Sun).
        day: ((h._id.day + 5) % 7),
        hour: h._id.hour,
        count: h.count,
      })),
      statusBreakdown: statusBreakdownRaw.map((s) => ({
        status: s._id as "draft" | "open" | "closed",
        count: s.count,
      })),
      topPolls: topPollsRaw.map((p) => ({
        _id: p._id.toString(),
        title: p.title,
        totalVotes: p.totalVotes ?? 0,
        status: p.status as "draft" | "open" | "closed",
      })),
      recentActivity: [
        ...recentPolls.map((p) => ({
          type: "poll_created" as const,
          title: p.title,
          timestamp: p.createdAt.toISOString(),
          pollId: p._id.toString(),
        })),
        ...recentVotes.map((v) => ({
          type: "vote_cast" as const,
          title: v.pollId?.title ?? "(deleted poll)",
          timestamp: v.votedAt.toISOString(),
          meta: v.voterName,
          pollId: v.pollId?._id?.toString(),
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10),
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return err("Failed to get dashboard overview");
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
  limit: number = 50,
  search: string = ""
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

    const filter: Record<string, unknown> = { pollId };
    const trimmed = search.trim();
    if (trimmed) {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [{ voterName: rx }, { voterPhone: rx }];
    }

    const skip = (page - 1) * limit;
    const [votes, total] = await Promise.all([
      Vote.find(filter)
        .sort({ votedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vote.countDocuments(filter),
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

  const trimmedEmail = email.trim().toLowerCase();

  // Build the absolute redirectUrl for the invitation email link.
  // Read the actual request host from headers — this is always the domain the
  // admin accessed, so it works correctly on any deployment (prod, preview, local).
  const headersList = await headers();
  const host  = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const baseUrl = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  const redirectUrl = `${baseUrl}/sign-up`;

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: trimmedEmail,
      publicMetadata: { role: "admin" },
      ignoreExisting: true,
      redirectUrl,
    });
    return ok({ invited: true });
  } catch (error: unknown) {
    let message = "Failed to send invitation";

    if (error && typeof error === "object" && "errors" in error) {
      const { errors, status } = error as {
        errors: { message?: string; longMessage?: string; code?: string; meta?: Record<string, unknown> }[];
        status?: number;
      };
      // Log each sub-error individually (Clerk error class breaks JSON.stringify)
      console.error("inviteAdmin status:", status, "redirectUrl:", redirectUrl);
      for (const e of errors ?? []) {
        console.error("inviteAdmin clerk sub-error:", e.code, e.message, e.longMessage, e.meta);
      }
      const first = errors?.[0];
      const parts = [first?.longMessage, first?.code, first?.meta?.paramName as string].filter(Boolean);
      message = parts.join(" — ") || first?.message || message;
    } else if (error instanceof Error) {
      console.error("inviteAdmin error:", error.message);
      message = error.message;
    }

    return err(message);
  }
}
