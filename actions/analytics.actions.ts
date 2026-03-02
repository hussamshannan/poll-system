"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Poll from "@/lib/models/Poll.model";
import Vote from "@/lib/models/Vote.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";
import { PollAnalytics, DashboardStats } from "@/lib/types/analytics.types";
import mongoose from "mongoose";

export async function getPollAnalytics(
  pollId: string
): Promise<ActionResult<PollAnalytics>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    await connectToDatabase();

    const poll = await Poll.findById(pollId);
    if (!poll) return err("Poll not found");

    // Option breakdown
    const optionBreakdown = await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $unwind: "$optionIds" },
      { $group: { _id: "$optionIds", count: { $sum: 1 } } },
    ]);

    const totalVoteCount = poll.totalVotes || 0;

    const breakdown = poll.options.map((opt) => {
      const found = optionBreakdown.find(
        (b) => b._id.toString() === opt._id.toString()
      );
      const count = found?.count || 0;
      return {
        optionId: opt._id.toString(),
        text: opt.text,
        count,
        percentage: totalVoteCount > 0 ? (count / totalVoteCount) * 100 : 0,
      };
    });

    // Votes over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const votesOverTime = await Vote.aggregate([
      {
        $match: {
          pollId: new mongoose.Types.ObjectId(pollId),
          votedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$votedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return ok({
      pollId: poll._id.toString(),
      title: poll.title,
      totalVotes: totalVoteCount,
      optionBreakdown: breakdown,
      votesOverTime: votesOverTime.map((v) => ({
        date: v._id,
        count: v.count,
      })),
    });
  } catch (error) {
    console.error("getPollAnalytics error:", error);
    return err("Failed to get analytics");
  }
}

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    await connectToDatabase();

    const [totalPolls, activePolls, votesResult] = await Promise.all([
      Poll.countDocuments({ createdBy: userId }),
      Poll.countDocuments({ createdBy: userId, status: "open" }),
      Poll.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, total: { $sum: "$totalVotes" } } },
      ]),
    ]);

    const totalVotes = votesResult[0]?.total || 0;

    return ok({
      totalPolls,
      totalVotes,
      activePolls,
      averageVotesPerPoll: totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return err("Failed to get dashboard stats");
  }
}
