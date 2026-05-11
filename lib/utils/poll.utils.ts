import { IPoll } from "@/lib/models/Poll.model";
import { Poll } from "@/lib/types/poll.types";

export function isPollExpired(poll: { expiresAt: string | Date | null }): boolean {
  if (!poll.expiresAt) return false;
  return new Date() > new Date(poll.expiresAt);
}

export function isPollReleased(poll: { releaseAt: string | Date | null }): boolean {
  if (!poll.releaseAt) return true;
  return new Date() >= new Date(poll.releaseAt);
}

export function isPollOwner(poll: { createdBy: string }, userId: string): boolean {
  return poll.createdBy === userId;
}

export function isPollVotable(poll: { status: string; expiresAt: string | Date | null; releaseAt: string | Date | null }): boolean {
  return poll.status === "open" && !isPollExpired(poll) && isPollReleased(poll);
}

export function serializePoll(poll: IPoll): Poll {
  const obj = poll.toObject();
  // Back-compat derivation: old documents (pre-feature) have no
  // choicesPerVoter. Derive from the legacy allowMultipleVotes flag so the
  // voter UI keeps working without a DB migration.
  const choicesPerVoter =
    typeof obj.choicesPerVoter === "number" && obj.choicesPerVoter > 0
      ? obj.choicesPerVoter
      : obj.allowMultipleVotes
        ? obj.options.length
        : 1;

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
    choicesPerVoter,
    isAnonymous: obj.isAnonymous,
    expiresAt: obj.expiresAt ? obj.expiresAt.toISOString() : null,
    releaseAt: obj.releaseAt ? obj.releaseAt.toISOString() : null,
    createdBy: obj.createdBy,
    totalVotes: obj.totalVotes,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
    isExpired: poll.isExpired,
  };
}
