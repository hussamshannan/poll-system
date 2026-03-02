export const routes = {
  home: "/",
  vote: {
    list: "/vote",
    poll: (id: string) => `/vote/${id}`,
  },
  admin: {
    dashboard: "/admin",
    polls: "/admin/polls",
    pollNew: "/admin/polls/new",
    pollDetail: (id: string) => `/admin/polls/${id}`,
    pollEdit: (id: string) => `/admin/polls/${id}/edit`,
    settings: "/admin/settings",
  },
  auth: {
    signIn: "/sign-in",
  },
} as const;
