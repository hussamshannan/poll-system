export interface OptionVoteCount {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export interface VoteOverTime {
  date: string;
  count: number;
}

export interface PollAnalytics {
  pollId: string;
  title: string;
  totalVotes: number;
  optionBreakdown: OptionVoteCount[];
  votesOverTime: VoteOverTime[];
}

export interface DashboardStats {
  totalPolls: number;
  totalVotes: number;
  activePolls: number;
  averageVotesPerPoll: number;
}
