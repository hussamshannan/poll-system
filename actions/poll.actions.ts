"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import Poll from "@/lib/models/Poll.model";
import Vote from "@/lib/models/Vote.model";
import User from "@/lib/models/User.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";
import { Poll as PollType } from "@/lib/types/poll.types";
import {
  CreatePollSchema,
  UpdatePollSchema,
} from "@/lib/validations/poll.schema";
import { serializePoll } from "@/lib/utils/poll.utils";

export async function createPoll(
  input: unknown
): Promise<ActionResult<PollType>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    const parsed = CreatePollSchema.safeParse(input);
    if (!parsed.success) {
      return err("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const poll = await Poll.create({
      title: parsed.data.title,
      description: parsed.data.description,
      options: parsed.data.options.map((opt, i) => ({
        text: opt.text,
        order: i,
      })),
      status: "open",
      allowMultipleVotes: parsed.data.allowMultipleVotes,
      isAnonymous: parsed.data.isAnonymous,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      createdBy: userId,
    });

    await User.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { pollsCreated: 1 } }
    );

    revalidatePath("/admin/polls");
    return ok(serializePoll(poll));
  } catch (error) {
    console.error("createPoll error:", error);
    return err("Failed to create poll");
  }
}

export async function updatePoll(
  input: unknown
): Promise<ActionResult<PollType>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    const parsed = UpdatePollSchema.safeParse(input);
    if (!parsed.success) {
      return err("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const poll = await Poll.findOne({
      _id: parsed.data.pollId,
      createdBy: userId,
    });
    if (!poll) return err("Poll not found or access denied");

    if (parsed.data.title !== undefined) poll.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      poll.description = parsed.data.description;
    if (parsed.data.options !== undefined) {
      poll.options = parsed.data.options.map((opt, i) => ({
        text: opt.text,
        order: i,
      })) as typeof poll.options;
    }
    if (parsed.data.status !== undefined) poll.status = parsed.data.status;
    if (parsed.data.allowMultipleVotes !== undefined)
      poll.allowMultipleVotes = parsed.data.allowMultipleVotes;
    if (parsed.data.isAnonymous !== undefined)
      poll.isAnonymous = parsed.data.isAnonymous;
    if (parsed.data.expiresAt !== undefined) {
      poll.expiresAt = parsed.data.expiresAt
        ? new Date(parsed.data.expiresAt)
        : null;
    }

    await poll.save();

    revalidatePath("/admin/polls");
    revalidatePath(`/vote/${poll._id}`);
    return ok(serializePoll(poll));
  } catch (error) {
    console.error("updatePoll error:", error);
    return err("Failed to update poll");
  }
}

export async function deletePoll(
  pollId: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    await connectToDatabase();

    const poll = await Poll.findOneAndDelete({ _id: pollId, createdBy: userId });
    if (!poll) return err("Poll not found or access denied");

    await Vote.deleteMany({ pollId: poll._id });
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { pollsCreated: -1 } }
    );

    revalidatePath("/admin/polls");
    return ok({ deleted: true });
  } catch (error) {
    console.error("deletePoll error:", error);
    return err("Failed to delete poll");
  }
}

export async function getPollById(
  pollId: string
): Promise<ActionResult<PollType>> {
  try {
    await connectToDatabase();
    const poll = await Poll.findById(pollId);
    if (!poll) return err("Poll not found");
    return ok(serializePoll(poll));
  } catch (error) {
    console.error("getPollById error:", error);
    return err("Failed to get poll");
  }
}

export async function listPollsByUser(
  clerkUserId?: string
): Promise<ActionResult<PollType[]>> {
  try {
    const { userId } = await auth();
    const targetUserId = clerkUserId || userId;
    if (!targetUserId) return err("Unauthorized");

    await connectToDatabase();
    const polls = await Poll.find({ createdBy: targetUserId })
      .sort({ createdAt: -1 })
      .exec();

    return ok(polls.map(serializePoll));
  } catch (error) {
    console.error("listPollsByUser error:", error);
    return err("Failed to list polls");
  }
}

export async function listOpenPolls(): Promise<ActionResult<PollType[]>> {
  try {
    await connectToDatabase();
    const polls = await Poll.find({ status: "open" })
      .sort({ createdAt: -1 })
      .exec();
    return ok(polls.map(serializePoll));
  } catch (error) {
    console.error("listOpenPolls error:", error);
    return err("Failed to list open polls");
  }
}

export async function updatePollStatus(
  pollId: string,
  status: "draft" | "open" | "closed"
): Promise<ActionResult<PollType>> {
  try {
    const { userId } = await auth();
    if (!userId) return err("Unauthorized");

    await connectToDatabase();

    const poll = await Poll.findOneAndUpdate(
      { _id: pollId, createdBy: userId },
      { status },
      { returnDocument: "after" }
    );
    if (!poll) return err("Poll not found or access denied");

    revalidatePath("/admin/polls");
    revalidatePath(`/vote/${pollId}`);
    return ok(serializePoll(poll));
  } catch (error) {
    console.error("updatePollStatus error:", error);
    return err("Failed to update poll status");
  }
}
