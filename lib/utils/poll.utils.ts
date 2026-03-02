import { IPoll } from "@/lib/models/Poll.model";
import { Poll } from "@/lib/types/poll.types";

export function isPollExpired(poll: { expiresAt: string | Date | null }): boolean {
  if (!poll.expiresAt) return false;
  return new Date() > new Date(poll.expiresAt);
}

export function isPollOwner(poll: { createdBy: string }, userId: string): boolean {
  return poll.createdBy === userId;
}

export function isPollVotable(poll: { status: string; expiresAt: string | Date | null }): boolean {
  return poll.status === "open" && !isPollExpired(poll);
}

export function serializePoll(poll: IPoll): Poll {
  const obj = poll.toObject();
  return {
    _id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    options: obj.options.map((opt: { _id: { toString(): string }; text: string; order: number }) => ({
      _id: opt._id.toString(),
      text: opt.text,
      order: opt.order,
    })),
    status: obj.status,
    allowMultipleVotes: obj.allowMultipleVotes,
    isAnonymous: obj.isAnonymous,
    expiresAt: obj.expiresAt ? obj.expiresAt.toISOString() : null,
    createdBy: obj.createdBy,
    totalVotes: obj.totalVotes,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
    isExpired: poll.isExpired,
  };
}
