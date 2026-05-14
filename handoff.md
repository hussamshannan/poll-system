# Handoff

## Goal

Polish CBOSRA (Central Bank of Sudan Retirees Association voting portal). The current arc of work covers:

1. Brand the app explicitly as **CBOSRA** instead of generic "PollApp" — landing page, site metadata (OG/Twitter previews), top nav.
2. Replace the previous landing page with an **editorial split hero** matching a Claude Design handoff (`/Users/hussamshannan/Downloads/poll landing page/`).
3. **Redesign the top nav** to use a CB monogram badge, stacked org name, and pill-shaped lang/admin buttons.
4. **Smart voter deduplication** in the admin — replace the old auto-cleanup with a review-based workflow that catches near-duplicate Arabic names (one name is a prefix/subset of another, e.g. "حسام حمزة عبدالحفيظ" vs "حسام حمزة عبدالحفيظ شنان").
5. Small fixes: theme validation schema, autofocus on voter name, Arabic font fallback for English locale.

## Current State

**Working tree is clean. All work shipped on `main`.** No in-progress edits.

Recent commits (newest first, since the previous handoff at `8752139`):

- `f89b4e3` — Autofocus voter name input on poll open
- `1d5b490` — Refine Arabic headline (add "رابطة" to org name)
- `26d8506` — Use new hero image (`public/hero.jpg`) and full Arabic org name in headline
- `c7ec506` — Top nav redesign + LTR Arabic font fallback
- `df56a0a` — **Replace auto-cleanup with smart duplicate review** (single biggest landing of this arc)
- `4812749` — Hide CTA hint on landing
- `2215076` — Site metadata (OG/Twitter) keyed to `https://cbosra-poll.vercel.app`
- `0377dc7` — Landing photo caption → org name
- `2f2d020` — Fix landing photo collapsing on large screens (grid item `h-full` → `flex flex-1`)
- `e694aa9` — Staggered rise-in animation on landing
- `5b40485` — **Editorial split landing redesign**
- `48b4452` — Allow Amber and Coffee themes in `SiteThemeSchema` (bug — they were in the type but missing from the Zod enum, causing "Validation failed" toast in `/admin/settings`)
- `38f3606` — Remove footer from landing page (footer feature was experimented with for several rounds then deleted entirely — see "Rejected" below)
- `c041e55` — Sign-in page redesign with split layout, hero image, Google OAuth

Everything pushed to `origin/main`. `npx tsc --noEmit` clean. Pre-existing lint warnings unchanged.

## Files Actively Edited This Session

### Brand + landing
- `app/page.tsx` — full rewrite: editorial split with two-column hero (badge, headline with brand-accent second line, lede, primary CTA, trust grid · photo + caption overlay). Uses `/hero.jpg`.
- `app/layout.tsx` — `metadataBase: new URL("https://cbosra-poll.vercel.app")` + OpenGraph + Twitter blocks pointing at `/hero-img.jpg` (note: **still the old image — not aligned with landing's `/hero.jpg`**).
- `app/globals.css` — added `@keyframes cbosra-rise` + `.rise` / `.rise-d{1..5}` utility classes with `prefers-reduced-motion` opt-out. Added `html[dir="ltr"]` font stack so Arabic glyphs in English pages fall through to `--font-arabic`.
- `messages/{en,ar}.json` — new `landing.*` keys: `badge`, `headlineOne`, `headlineTwo`, `lede`, `browseCta`, `browseCtaHint`, `feature1-3`, `photoCaption`, `photoAlt`. The CTA hint is rendered but commented out in `app/page.tsx`.

### Top nav
- `components/layout/SiteHeader.tsx` — CB monogram badge (h-10/11, primary bg with inset highlight) + stacked org name + "CBOSRA · est. 2023" caption (hidden on `<sm`). Dropped the default "Polls" nav item and the vertical separator. `navItems` prop preserved.
- `components/layout/LangToggle.tsx` — bordered pill with `Globe` icon, h-10.

### Smart voter dedup (the centerpiece)
- `lib/utils/name-match.ts` — **new.** Arabic-aware normalization (unify alef variants, ى→ي, strip tashkeel U+064B–U+065F and tatweel U+0640), tokenize, pairwise `compareVotes` returning `{reason, confidence}` where reasons are `phone-match` (high) / `name-prefix` (high, ≥2 shared tokens, ordered prefix) / `name-subset` (medium, unordered subset). Union-Find clustering for transitive groups. `MIN_SHARED_TOKENS = 2` is the tunable threshold.
- `lib/validations/admin.schema.ts` — **new.** `ResolveDuplicateGroupSchema` validates ObjectId-shape ids and refuses `keepVoteId ∈ removeVoteIds`.
- `actions/admin.actions.ts` — **`normalizeVoterData` deleted.** Added `findDuplicateCandidates()` (per-poll scan, no mutations, returns affected polls sorted by confidence) and `resolveDuplicateGroup(input)` (validates Zod, confirms all vote ids belong to `pollId`, deletes the removed ids, decrements `Poll.totalVotes`, revalidates `/admin/polls` + the specific poll path + `/admin/settings`). Removed the unused `normalizePhone`/`normalizeName` imports.
- `components/admin/VoterDataMaintenanceCard.tsx` — **full rewrite.** Single card titled `maintenanceTitle`. Scan button → groups grouped by poll → each group renders radio choices (default-keep oldest), Resolve and Skip buttons. Confirm dialog before resolve. All state local; resolved groups fade out without router refresh.
- `messages/{en,ar}.json` — dropped `maintenanceBtn`, `maintenanceConfirmTitle`, `maintenanceConfirmDesc`, `maintenanceSuccess`, `maintenanceError`, `smartDedupTitle`, `smartDedupDesc`. Kept the rest under `admin.smartDedup*` plus refreshed `maintenanceDesc`.

### Other
- `lib/validations/theme.schema.ts` — added `"amber"` and `"coffee"` to the Zod enum (was failing validation in production).
- `components/voting/VoterInfoForm.tsx` — added `autoFocus` to the `voterName` input so the keyboard pops on mobile when a voter opens `/vote/[pollId]`.
- Public assets: `public/hero.jpg` is the current landing photo. `public/hero-img.jpg` is the older photo still referenced by OG metadata. `public/footer-bg.jpg` was deleted; `public/footer-.jpg` is a renamed orphan from the footer experiments (still untracked).

## Things Attempted That Were Rejected / Rolled Back

- **Footer feature** (commits leading up to `38f3606`). A "Grounded Footer" was built from a Claude Design handoff, iterated through multiple variants (classic, statement, full-bleed; with host page, then standalone; rounded card then full-bleed). User then asked to delete the footer entirely. All `SiteFooter`/`NewsletterForm` files and `footer.*` i18n keys were removed in `38f3606`. Don't re-add a footer unless the user explicitly asks.
- **First editorial-split landing attempt** — built quickly from a stripped HTML reference, user rolled it back with "roll back". A second attempt from the proper Claude Design handoff bundle (`/Users/hussamshannan/Downloads/poll landing page/`) was kept and shipped as `5b40485`.
- **Two separate cards on `/admin/settings`** ("Voter Data Maintenance" + "Smart duplicate review"). User: "i dont like that there are two options" — merged into one card under `maintenanceTitle`. The old `normalizeVoterData` action was deleted because smart dedup catches the same dupes via `phone-match`.
- **Auto-merge variants of the dedup workflow** — user chose review-first and same-poll-only scope via `AskUserQuestion`. Don't add cross-poll suggestions or auto-merge without re-confirming.

## Known Gaps / Out of Scope

- **OG image is stale.** `app/layout.tsx` references `/hero-img.jpg` (2400×3067) but the landing page renders `/hero.jpg`. Social previews show the old photo while the page shows the new one. Fix: update `app/layout.tsx` to `/hero.jpg`, verify dimensions, then `rm public/hero-img.jpg`. I flagged this when the user changed `app/page.tsx` to `/hero.jpg`; they said "commit and push" without resolving.
- **Untracked orphan asset.** `public/footer-.jpg` is the user's renamed copy of the (now-deleted) `footer-bg.jpg`. Not referenced by any code. Leave alone unless user asks.
- **Smart dedup state is session-local.** `dismissedGroups` and `resolvedGroups` in `VoterDataMaintenanceCard.tsx` are React state. Rescanning will resurface "Not a duplicate" choices the admin made earlier. If this becomes annoying, persist them on the `Vote` documents (`{ markedNotDuplicateOf: ObjectId[] }`) — but the user hasn't asked.
- **`headlineTwo` mismatch.** AR landing now shows the full org name "منصة رابطة معاشيي بنك السودان المركزي" but EN still shows the abbreviation "CBOSRA". Intentional? Unclear — the user adjusted only the Arabic key. If they want symmetry, change EN `landing.headlineTwo` to "Central Bank of Sudan Retirees Association" (or similar).
- **Pre-existing localStorage gaps** from the earlier handoff still stand: the per-poll guard doesn't invalidate on admin reset/voter delete; voter selection doesn't persist across pages.

## Next Step

Nothing's in flight. Likely next directions based on the user's tendency to keep tightening the landing/brand surface:

1. **Align OG image with landing.** Update `app/layout.tsx` to `/hero.jpg`, recheck dimensions (the new file may not be 2400×3067), delete `public/hero-img.jpg`. Mention to the user before deleting.
2. **Logo work.** The user asked for a nano-banana prompt to generate a CBOSRA logo. Once they pick one, swap the `<span>CB</span>` in `components/layout/SiteHeader.tsx` (~line 39) for an `<Image src="/logo.svg" ... />`. Also consider a real favicon (`app/icon.png` or `app/favicon.ico`).
3. **Hero photo replacement.** Same nano-banana flow — user asked for a hero-image prompt aimed at a portrait CBOSRA group photo. Once they have an image, drop it at `public/hero.jpg` (same path) — no code change needed.
4. **Cross-poll dedup (if asked).** The current `findDuplicateCandidates` is same-poll only. Extending to cross-poll would need a new return shape (cluster across pollIds) and a UI for the admin to inspect a member's votes across the platform. Don't build without re-confirming scope.
