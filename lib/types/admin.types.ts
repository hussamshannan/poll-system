export interface SiteStats {
  totalUsers: number;
  totalPolls: number;
  totalVotes: number;
  activePolls: number;
  pollsCreatedToday: number;
  votesToday: number;
}

export interface AdminPoll {
  _id: string;
  title: string;
  status: "draft" | "open" | "closed";
  totalVotes: number;
  createdBy: string;
  creatorEmail: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface AdminUser {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  pollsCreated: number;
  createdAt: string;
}

export interface AdminUserWithRole {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  isAdmin: boolean;
}

export interface VoterRecord {
  _id: string;
  voterName: string;
  voterPhone: string;
  optionTexts: string[];
  votedAt: string;
}
