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
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  expiresAt: string | null;
  createdBy: string;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  options: { text: string }[];
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string | null;
}

export interface UpdatePollInput {
  pollId: string;
  title?: string;
  description?: string;
  options?: { text: string }[];
  status?: "draft" | "open" | "closed";
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string | null;
}
