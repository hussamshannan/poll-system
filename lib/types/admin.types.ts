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
  isMaster: boolean;
}

export interface VoterRecord {
  _id: string;
  voterName: string;
  voterPhone: string;
  optionTexts: string[];
  votedAt: string;
}

export interface KpiSeries {
  current: number;
  previous: number;
  sparkline: number[];
}

export interface ActivityEvent {
  type: "poll_created" | "vote_cast";
  title: string;
  timestamp: string;
  meta?: string;
  pollId?: string;
}

export interface DashboardOverview {
  kpis: {
    totalVotes: KpiSeries;
    activePolls: KpiSeries;
    uniqueVoters: KpiSeries;
  };
  metricSeries: {
    votes: { date: string; count: number }[];
    polls: { date: string; count: number }[];
    uniqueVoters: { date: string; count: number }[];
  };
  heatmap: { day: number; hour: number; count: number }[];
  statusBreakdown: { status: "draft" | "open" | "closed"; count: number }[];
  topPolls: {
    _id: string;
    title: string;
    totalVotes: number;
    status: "draft" | "open" | "closed";
  }[];
  recentActivity: ActivityEvent[];
}
