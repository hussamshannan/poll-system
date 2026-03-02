# Poll App — Implementation Progress

## Status: Complete (pending env config)
Last updated: 2026-03-01

---

### Step 1: Environment Setup
- [x] .env.local created (placeholder values — fill in real credentials)
- [x] All packages installed
- [x] shadcn init complete + 21 UI components added

### Step 2: Foundation (lib/)
- [x] lib/types/ — action-result, poll, analytics, theme, admin
- [x] lib/validations/ — poll.schema, vote.schema, theme.schema (Zod)
- [x] lib/db/mongoose.ts — connection singleton with global cache + post-connect migration
- [x] lib/models/ — Poll, Vote, User, SiteSettings
- [x] lib/utils/ — cn (shadcn), format, poll.utils, admin.utils
- [x] lib/config/routes.ts — single source of truth for all URLs

### Step 3: Server Actions
- [x] actions/poll.actions.ts — CRUD + status management
- [x] actions/vote.actions.ts — castVote (name+phone) + getUserVoteForPoll
- [x] actions/analytics.actions.ts — getPollAnalytics + getDashboardStats
- [x] actions/user.actions.ts — syncUser + getUserByClerkId + delete
- [x] actions/admin.actions.ts — adminDeletePoll, getSiteStats, listAllPolls, listAllUsers, getVotersForPoll
- [x] actions/theme.actions.ts — getSiteTheme + updateSiteTheme

### Step 4: Auth & Middleware
- [x] proxy.ts — Clerk protects /admin(.*) only (renamed from middleware.ts per Next.js 16 convention)
- [x] app/api/webhooks/clerk/route.ts — user.created/updated/deleted with svix verification

### Step 5: Root Layout & Theme
- [x] app/layout.tsx — ClerkProvider + data-theme attribute + dark class on <html>
- [x] app/globals.css — Tailwind v4 + 5 full oklch theme presets ([data-theme="X"] + .dark)

### Step 6: Layout Components
- [x] SiteHeader (server), Sidebar (client, SIDEBAR_CONFIGS registry), AppShell (server)

### Step 7: Shared Components
- [x] components/common/ — StatusBadge, DataTable
- [x] ConfirmDialog, EmptyState, CopyLinkButton, LoadingSpinner, PageHeader

### Step 8: Poll Components
- [x] PollCard (href prop), PollGrid, PollForm (callback), OptionEditor

### Step 9: Voting Components (public, no auth)
- [x] VoterInfoForm, OptionSelector, VoteSubmit, VoteConfirmation
- [x] hooks/useVote — DI castVoteAction

### Step 10: Analytics & Admin Components
- [x] VoteBarChart, VotePieChart, TrendChart — colours resolved to rgb() via useChartColors hook (fixes Recharts oklch error)
- [x] StatCard, AnalyticsPanel, VoteResult
- [x] SiteStatsPanel, PollTable, VoterTable, ThemeEditor

### Step 11: PDF Export
- [x] AnalyticsPDFDocument — @react-pdf/renderer Document component (Header, Summary, Breakdown, Trend table, Footer)
- [x] ExportPDFButton — dynamic import of react-pdf + AnalyticsPDFDocument, pdf().toBlob() download (no DOM capture)
- [x] pako override — package.json "overrides": { "pako": "1.0.11" } to fix @react-pdf/pdfkit build error

### Step 12: Hooks
- [x] useVote (DI castVoteAction), useCopyToClipboard
- [x] useChartColors — resolves --primary, --chart-1..5, --border, --muted-foreground, --card, --radius to rgb() via getComputedStyle; MutationObserver re-resolves on theme/dark-mode change

### Step 13: Auth Pages
- [x] /sign-in (Clerk, sign-up footer hidden)
- [x] Sign-up page intentionally deleted — admin-only registration

### Step 14: App Pages
- [x] / — landing page (SiteHeader)
- [x] /vote — public polls list
- [x] /vote/[pollId] — voting page (name + phone, no auth)
- [x] /admin — dashboard + stats
- [x] /admin/polls — polls management table
- [x] /admin/polls/new — create poll
- [x] /admin/polls/[pollId] — poll detail (analytics + voter table + PDF export)
- [x] /admin/polls/[pollId]/edit — edit poll
- [x] /admin/settings — theme editor (light/dark + 5 presets)

### Verification
- [x] TypeScript: zero errors (`npx tsc --noEmit` passes)
- [x] Build: `npx next build` passes with zero errors or warnings
- [x] Chart colours: resolved to rgb() via useChartColors (no more oklch Recharts error)
- [x] Mongoose migration: dropIndex runs after connect, not at module load
- [x] PDF export: @react-pdf/renderer generates and downloads PDF without DOM capture
- [x] pako v1 override: build does not fail with "Can't resolve pako/lib/zlib/*"
- [ ] Runtime: requires valid MONGODB_URI and Clerk keys in .env.local

### Notes
- Admin role: set `publicMetadata: { role: "admin" }` in Clerk dashboard
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
- NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in (no sign-up page)
- Build errors expected with placeholder .env values (MongoDB + Clerk fail at SSR prerender)
- Middleware file is proxy.ts (not middleware.ts) — Next.js 16 convention
