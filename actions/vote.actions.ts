"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import Poll from "@/lib/models/Poll.model";
import Vote from "@/lib/models/Vote.model";
import { ActionResult, ok, err } from "@/lib/types/action-result.types";
import { CastVoteSchema, CheckVoteSchema } from "@/lib/validations/vote.schema";
import { normalizePhone, normalizeName } from "@/lib/utils/phone";
import mongoose from "mongoose";

export async function castVote(
  input: unknown
): Promise<ActionResult<{ voteId: string }>> {
  try {
    const parsed = CastVoteSchema.safeParse(input);
    if (!parsed.success) {
      return err("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const poll = await Poll.findById(parsed.data.pollId);
    if (!poll) return err("Poll not found");
    if (poll.status !== "open") return err("Poll is not open for voting");
    if (poll.expiresAt && new Date() > poll.expiresAt)
      return err("Poll has expired");
    if (poll.releaseAt && new Date() < poll.releaseAt)
      return err("Poll is not yet open for voting");

    // Exact-N enforcement. Fall back to legacy boolean for old polls that
    // have no choicesPerVoter set.
    const required =
      typeof poll.choicesPerVoter === "number" && poll.choicesPerVoter > 0
        ? poll.choicesPerVoter
        : poll.allowMultipleVotes
          ? poll.options.length
          : 1;

    if (parsed.data.optionIds.length !== required) {
      return err(
        `This poll requires exactly ${required} ${
          required === 1 ? "choice" : "choices"
        }`
      );
    }

    const validOptionIds = poll.options.map((o) => o._id.toString());
    for (const optId of parsed.data.optionIds) {
      if (!validOptionIds.includes(optId)) {
        return err("Invalid option selected");
      }
    }

    const normalizedPhone = normalizePhone(parsed.data.voterPhone);
    if (!normalizedPhone) {
      return err("Phone number must contain 7–15 digits");
    }
    const normalizedName = normalizeName(parsed.data.voterName);
    if (!normalizedName) {
      return err("Name is required");
    }

    const vote = await Vote.create({
      pollId: poll._id,
      optionIds: parsed.data.optionIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      ),
      voterName: normalizedName,
      voterPhone: normalizedPhone,
    });

    await Poll.findByIdAndUpdate(poll._id, { $inc: { totalVotes: 1 } });

    revalidatePath(`/vote/${poll._id}`);
    revalidatePath(`/admin/polls/${poll._id}`);
    return ok({ voteId: vote._id.toString() });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Duplicate key error (unique index violation)
      if ("code" in error && (error as { code: number }).code === 11000) {
        const keyPattern = (error as { keyPattern?: Record<string, number> })
          .keyPattern;
        if (keyPattern?.voterPhone) {
          return err("This phone number has already voted on this poll");
        }
        if (keyPattern?.voterName) {
          return err("This name has already voted on this poll");
        }
        return err("You have already voted on this poll");
      }

      // Mongoose validation error (e.g. stale model cache with old required fields)
      if (error.name === "ValidationError") {
        console.error("castVote ValidationError:", error.message);
        return err("Invalid vote data. Please refresh the page and try again.");
      }

      // Mongoose CastError (invalid ObjectId)
      if (error.name === "CastError") {
        return err("Invalid poll or option ID.");
      }
    }

    console.error("castVote error:", error);
    return err("Failed to cast vote. Please try again.");
  }
}

export async function getVoteByPhone(
  pollId: string,
  phone: string
): Promise<ActionResult<{ optionIds: string[] } | null>> {
  try {
    const parsed = CheckVoteSchema.safeParse({ pollId, voterPhone: phone });
    if (!parsed.success) return ok(null);

    const normalizedPhone = normalizePhone(parsed.data.voterPhone);
    if (!normalizedPhone) return ok(null);

    await connectToDatabase();
    const vote = await Vote.findOne({
      pollId: parsed.data.pollId,
      voterPhone: normalizedPhone,
    }).lean();

    if (!vote) return ok(null);
    return ok({ optionIds: vote.optionIds.map((id) => id.toString()) });
  } catch (error) {
    console.error("getVoteByPhone error:", error);
    return err("Failed to check vote");
  }
}
