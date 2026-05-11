export interface PollOption {
  _id: string;
  text: string;
  order: number;
}

export interface Poll {
  _id: string;
  title: string;
  description: string;
  options: PollOption[];
  status: "draft" | "open" | "closed";
  /** @deprecated kept for back-compat; new code reads choicesPerVoter */
  allowMultipleVotes: boolean;
  /** Number of options each voter must pick (exact count). 1 = single-choice. */
  choicesPerVoter: number;
  isAnonymous: boolean;
  expiresAt: string | null;
  releaseAt: string | null;
  createdBy: string;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  options: { _id?: string; text: string }[];
  choicesPerVoter?: number;
  isAnonymous?: boolean;
  expiresAt?: string | null;
  releaseAt?: string | null;
}

export interface UpdatePollInput {
  pollId: string;
  title?: string;
  description?: string;
  options?: { _id?: string; text: string }[];
  status?: "draft" | "open" | "closed";
  choicesPerVoter?: number;
  isAnonymous?: boolean;
  expiresAt?: string | null;
  releaseAt?: string | null;
}
