# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (eslint-config-next, flat config)
npx tsc --noEmit # Type check (no test runner is configured)
```

Path alias: `@/*` resolves to the project root (see `tsconfig.json`).

## Required environment

`.env.local` must define:
- `MONGODB_URI` — Mongoose connects to the `poll-app` database (see `lib/db/mongoose.ts`).
- `CLERK_*` keys + `CLERK_WEBHOOK_SECRET` for the `/api/webhooks/clerk` route.
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in` (the legacy `/dashboard` and `/sign-up` routes do not exist).

To grant admin access, set `publicMetadata: { role: "admin" }` on the user in the Clerk dashboard. The `MASTER_ADMIN_EMAIL` constant in `actions/admin.actions.ts` is protected from role removal/deletion.

## Architecture

### Two distinct user flows
- **Voters (public)**: `/vote` and `/vote/[pollId]`. No auth — voters identify themselves via name + phone on each poll. Phone is unique per poll (`Vote` model index `{ pollId, voterPhone }`).
- **Admins (Clerk)**: `/admin/*`. Auth gate is two-layered:
  1. `proxy.ts` (Next.js 16 renamed middleware) calls `auth.protect()` for `/admin(.*)`.
  2. `app/(admin)/layout.tsx` then runs `isAdmin(userId)` (via `lib/utils/admin.utils.ts`), checking `publicMetadata.role === "admin"` from Clerk, and redirects non-admins home.

### Server Actions return `ActionResult<T>`
Every action in `actions/*.actions.ts` returns `ActionResult<T> = { success: true, data } | { success: false, error, fieldErrors? }` (see `lib/types/action-result.types.ts`). Construct via `ok(data)` / `err(message, fieldErrors?)`. Inputs are validated with Zod schemas under `lib/validations/`; on parse failure return `err("Validation failed", parsed.error.flatten().fieldErrors)`.

Admin-only actions begin with `const adminErr = await requireAdmin(); if (adminErr) return adminErr;` — `requireAdmin` returns the same shape so it can be returned directly.

### Mongoose + serialization
- `connectToDatabase()` caches the connection on `globalThis.mongooseCache`. It also performs a one-time `dropIndex("pollId_1_voterName_1")` to clean up an obsolete unique index — keep this in mind when changing `Vote` indexes.
- Models live in `lib/models/*.model.ts`. The `Vote` model deletes itself from `mongoose.models` in non-production so schema edits hot-reload (`lib/models/Vote.model.ts:31`).
- Never return Mongoose documents to clients. Use `serializePoll` (`lib/utils/poll.utils.ts`) — it stringifies `_id`s and ISO-formats dates. Mirror that pattern for any new model.

### Routes
`lib/config/routes.ts` is the single source of truth for URLs. Use `routes.admin.pollDetail(id)` etc. instead of hardcoding paths so renames stay in sync (and `proxy.ts` matcher stays meaningful).

### Theme system
- `SiteTheme = { themeName: ThemeName, mode: "light" | "dark" }` is stored as a singleton document (`_id: "singleton"`) in the `SiteSettings` collection.
- Five named themes (`vercel`, `violet-bloom`, `modern-minimal`, `nature`, `pastel-dreams`) are defined as `[data-theme="X"]` and `[data-theme="X"].dark` blocks in `app/globals.css`.
- `app/layout.tsx` reads the theme on every request and applies `data-theme={name}` + (optional) `className="dark"` to `<html>`. `ThemeEditor` previews live by mutating `document.documentElement.dataset.theme` and `classList`.
- `getSiteTheme` upserts the singleton and gracefully migrates old documents that lack `themeName`.

### i18n (next-intl, no route segments)
- Locale is stored in a `locale` cookie. `i18n/request.ts` reads it; `actions/locale.actions.ts` (`setLocale`) writes it and calls `revalidatePath('/', 'layout')`.
- `next.config.ts` wires the plugin via `createNextIntlPlugin("./i18n/request.ts")`.
- Messages live in `messages/{en,ar}.json` with namespaced keys. Server components: `await getTranslations("namespace")`; client components: `useTranslations("namespace")`.
- RTL: `app/layout.tsx` sets `dir="rtl"` for Arabic; layout uses logical CSS props (`ms-*`, `me-*`, `border-e`, `text-start/end`) and directional icons get `data-dir-flip` (CSS rule `[dir="rtl"] [data-dir-flip] { transform: scaleX(-1) }`).
- `Sidebar` uses a `labelKey` pattern (key into the `sidebar` namespace) rather than literal labels.

### Layout primitives
`AppShell` (`components/layout/AppShell.tsx`) wraps every authenticated page. Pass `sidebar="admin"` to render the admin nav (`Sidebar` with `SIDEBAR_CONFIGS.admin`); omit for full-width public layouts. The admin sidebar collapses to a fixed bottom bar on mobile (`md:hidden`); main content gets `pb-20 md:pb-8` to clear it.

### Clerk webhook → User sync
`app/api/webhooks/clerk/route.ts` verifies svix signatures with `CLERK_WEBHOOK_SECRET` and calls `syncUser` / `deleteUserByClerkId`. Mongo `User` documents are keyed by `clerkId`; admin role lives in Clerk's `publicMetadata`, not in Mongo.

### Invitation redirect URL
`inviteAdmin` reads `x-forwarded-host` / `host` request headers to build `redirectUrl` so invitations point to whatever domain the admin is currently on (works on prod, preview, and localhost). Do not switch this to `VERCEL_URL` — it points at the per-deployment domain, not the production alias.

## Conventions

- **Server vs client**: Pages are server components by default. Files needing hooks or browser APIs are extracted as `*Client.tsx` siblings (`PollDetailClient.tsx`, `AdminsClient.tsx`).
- **Dependency injection for actions in hooks**: `useVote` accepts `castVoteAction` as a prop rather than importing it directly, so the hook stays testable and decoupled (see `hooks/useVote.ts`).
- **shadcn/ui (new-york style)**: components live in `components/ui/`. Aliases configured in `components.json`. Tailwind v4 with CSS variables (no `tailwind.config`).
- **No README-bound dev workflow doc**: `README.md` is the unmodified create-next-app boilerplate and is not authoritative.
