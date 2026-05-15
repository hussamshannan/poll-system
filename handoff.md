# Handoff

## Goal

Polish CBOSRA (Central Bank of Sudan Retirees Association voting portal). The current arc of work covers:

1. **Voting window control**: replace the two `datetime-local` inputs in the poll form with a single range date+time picker (calendar popover + start/end time, RTL-aware, past dates blocked).
2. **PollCard redesign** to a Claude Design "editorial minimal" handoff (`/Users/hussamshannan/Downloads/card re-design/`) — warm card, mono stats, pulsing live dot, primary-tinted urgent-state, dark pill CTA. Same layout across all viewports (the V6 compact-row variant was tried then dropped).
3. **Arabic content auto-direction**: `dir="auto"` on every input + display surface that holds user-typed content, so Arabic poll titles / options / voter names render RTL even when the UI locale is English.
4. **RTL polish**: Switch thumb that previously slid off the wrong edge in RTL, plus the calendar/range picker laid out RTL via `dir` + `date-fns/locale/ar`.
5. **Locale-aware date strings**: `formatRelative` / `formatDate` / `formatDateTime` now accept a `locale` and pull `date-fns/locale/{ar, enUS}`; callers thread `useLocale()` so dates render in Arabic when the app is in Arabic.

Previous arc (CBOSRA branding, editorial split landing, top nav, smart voter dedup) is shipped and documented further down.

## Current State

**Working tree is clean. All work shipped on `main`.** No in-progress edits. The feature branch (`feat/datetime-picker-poll-form`) was merged via fast-forward and deleted locally + on `origin`.

Recent commits (newest first):

- `01262d5` — **Redesign poll card + add range datetime picker and RTL polish** (single landing for this arc; merged from `feat/datetime-picker-poll-form`)
- `747de8b` — Update handoff notes for CBOSRA branding + smart dedup arc
- `f89b4e3` — Autofocus voter name input on poll open
- `1d5b490` — Refine Arabic headline (add "رابطة" to org name)
- `26d8506` — Use new hero image (`public/hero.jpg`) and full Arabic org name in headline
- `c7ec506` — Top nav redesign + LTR Arabic font fallback
- `df56a0a` — Replace auto-cleanup with smart duplicate review
- (earlier landing/dedup work omitted — see previous handoff section)

Everything pushed to `origin/main`. `npx tsc --noEmit` clean. Pre-existing lint warnings unchanged (`form.watch("isAnonymous")` in PollForm; unused eslint-disable in `lib/db/mongoose.ts`).

## Files Actively Edited This Session

### Range datetime picker (the centerpiece)
- `components/ui/calendar.tsx` — **new**, brought in via `npx shadcn add calendar`. Patched: removed the `table:` slot from `classNames` because `react-day-picker@10` dropped that entry from `ClassNames` (TS error otherwise).
- `components/ui/date-time-range-picker.tsx` — **new**. Popover trigger with `CalendarIcon` + `from → to` label (uses a Lucide `ArrowRight` with `data-dir-flip` so the arrow mirrors in RTL) and a clear-`X`. Popover contents: `Calendar mode="range" numberOfMonths={2} captionLayout="dropdown" dir={locale==='ar'?'rtl':'ltr'} locale={arLocale} disabled={{ before: today }} autoFocus`, plus a two-column grid of `<Input type="time">` for start/end. Value shape `{ from: string | null, to: string | null }` in `yyyy-MM-ddTHH:mm`. Time inputs disable until the corresponding date is picked. Default times when first picking: 09:00 for start, 18:00 for end. `today` is memoized at midnight local.
- `components/polls/PollForm.tsx` — schedule card collapsed from two labels ("Release Date" / "Expiration") to one **"Voting window (optional)"** field that drives both `releaseAt` and `expiresAt` from a single `DateTimeRangePicker`. Also added `dir="auto"` on the title input and description textarea.
- `messages/{en,ar}.json` — dropped `pollForm.releaseLabel/releaseHelp/expiry`, added `pollForm.windowLabel/windowHelp`. Replaced the single-picker `dateTime.placeholder/timeLabel` keys with `dateTime.rangePlaceholder/startTime/endTime/any/clear`.

### PollCard redesign (Editorial Minimal — V1 from the handoff)
- `components/polls/PollCard.tsx` — **full rewrite**. `rounded-[20px]` (kept as arbitrary because `rounded-4xl` resolves to a theme-dependent radius, not 20px), `bg-card`, `border`. Hover: `-translate-y-0.5`, primary-tinted border, custom drop shadow `0 24px 48px -32px rgba(20,20,20,0.18)`.
  - Status row: `STATUS_DOT` map (green for open, blue for scheduled, muted for closed/draft, destructive for expired), 7px dot (`h-1.75 w-1.75`), uppercase label with `tracking-[0.04em]`. Open dot pulses via the new `.pulse-dot` utility.
  - Vote count: `font-mono text-[26px] sm:text-[28px] font-medium tracking-tight tabular-nums`; "votes" caption mono uppercase 11px.
  - Title: `text-[17px] sm:text-[19px] font-semibold leading-[1.55]`, with `dir="auto"` so Arabic titles read RTL.
  - Meta row icons: `CheckCircle2 / ListChecks / Clock`, 14px at 55% opacity. When `<24h` until `expiresAt` and status `open`, the clock + deadline render full-opacity in `text-primary` (`isUrgent` check).
  - Full-bleed divider via `-mx-6 sm:-mx-8 border-t`.
  - Footer: relative timestamp (`font-mono`) on the leading side, dark pill CTA (`bg-foreground text-background` → hover `bg-primary`) on the trailing side with `data-dir-flip` arrow.
  - `actions` prop still rendered at the bottom if provided.
  - The previous mobile-only V6 "compact row" was built and shipped briefly, then removed when the user said to use V1 across all sizes — see "Rejected" below.
- `app/globals.css` — added `@keyframes cbosra-pulse-dot` (animates `box-shadow` using `color-mix(in oklab, currentColor X%, transparent)` so the halo inherits the dot color regardless of theme) + `.pulse-dot` utility, with `prefers-reduced-motion` opt-out.
- `app/vote/page.tsx` — user widened the grid section from `max-w-5xl` to `max-w-7xl` so the new card can breathe at three columns.

### Arabic content auto-direction (`dir="auto"`)
Inputs:
- `components/polls/PollForm.tsx` — title `Input`, description `Textarea`
- `components/polls/OptionEditor.tsx` — option text `Input`
- `components/voting/VoterInfoForm.tsx` — voter name `Input` (phone still `dir="ltr"`)

Display surfaces:
- `components/polls/PollCard.tsx` — title `<h3>`, description `<p>`
- `components/voting/OptionSelector.tsx` — option text `<span>` (wrapped in `min-w-0 flex-1 truncate` so the layout still tolerates wide RTL strings)
- `components/voting/VoteSubmit.tsx` — `CardTitle` + description
- `components/voting/VoteConfirmation.tsx` — voted-for list items (the `<h2>` and `<p>` use interpolated translation strings, which `dir="auto"` can't disambiguate — left those alone)
- `components/analytics/VoteResult.tsx` — option label `<span>`
- `components/admin/PollTable.tsx` — title col
- `components/admin/VoterTable.tsx` — voter name + selected-option chips
- `components/admin/TopPollsPanel.tsx` — poll title
- `components/admin/VoterDataMaintenanceCard.tsx` — poll-title link + voter name
- `app/(admin)/admin/polls/[pollId]/PollDetailClient.tsx` — page `<h1>`
- `app/vote/[pollId]/VotePageClient.tsx` — `CardTitle`s (gates) + already-voted reminder

### RTL Switch fix
- `components/ui/switch.tsx` — Radix's Switch thumb was using `data-[state=checked]:translate-x-[calc(100%-2px)]` which always moves `+x` physically. In RTL the track is mirrored, so the thumb slid off the wrong edge and the toggle looked "off" when it was actually "on". Added `rtl:data-[state=checked]:-translate-x-[calc(100%-2px)]`. Fix is global, not just the anonymous-vote toggle.

### Locale-aware date strings
- `lib/utils/format.ts` — added a `LOCALES` map (`ar`, `en`) + `resolveLocale` helper. `formatRelative(date, locale?)`, `formatDate(date, locale?)`, `formatDateTime(date, locale?)` now thread the locale into `date-fns`. Format strings switched from hardcoded English patterns (`"MMM d, yyyy"`, `"MMM d, yyyy 'at' h:mm a"`) to locale tokens (`"PP"`, `"PP p"`) so `formatDate(d, "ar")` outputs `١٤ مايو ٢٠٢٦`.
- Callers updated to read `useLocale()` and pass it: `components/polls/PollCard.tsx`, `components/admin/RecentActivity.tsx`, `components/admin/PollTable.tsx`, `components/admin/VoterTable.tsx`.

### Other touched files
- `components/ui/button.tsx` — cosmetic class-order reformatting that the shadcn CLI applied when adding the calendar. Semantically identical; kept.
- `package.json` + `package-lock.json` — added `react-day-picker@10` (pulled in by `calendar`).

## Things Attempted That Were Rejected / Rolled Back

- **Single DateTimePicker (just one end)**. First implementation built a per-end date+time picker, swapped two of them into the poll form. User said "use this instead: Range Calendar with time picker" — replaced with one `DateTimeRangePicker`, deleted `components/ui/date-time-picker.tsx`.
- **Mobile-only V6 "Compact Row" PollCard**. Implementation initially rendered V1 on `sm+` and V6 (horizontal row with 64px stat tile and circular CTA) below `sm`. User said "use v1 for mobile screen sizes" — dropped V6 entirely, kept V1 with light responsive scaling (padding, font sizes, gaps tighten under `sm`). The `STATUS_PILL` map and the dual-layout markup were removed.
- **`rounded-4xl` lint suggestion**. The diagnostic suggested converting `rounded-[20px]` to `rounded-4xl`, but `--radius-4xl` is `calc(var(--radius) + 16px)` which lands at 24px (default theme) or ~38px (`modern-minimal` theme). Kept `rounded-[20px]`. The other four canonical-class suggestions in the same diagnostic (`h-[7px]` → `h-1.75`, `gap-x-[18px]` → `gap-x-4.5`, etc.) were applied since the project doesn't override the default spacing scale.

## Known Gaps / Out of Scope

- **OG image is still stale.** From the previous handoff: `app/layout.tsx` references `/hero-img.jpg` while the landing renders `/hero.jpg`. This arc didn't touch it.
- **Untracked orphan asset.** `public/footer-.jpg` is still present and untracked. Left alone again.
- **Plex Mono not loaded.** The Editorial Minimal design specifies IBM Plex Mono for the vote count, "votes" caption, and timestamp. The card uses `font-mono` which resolves to `--font-mono` → Geist Mono (already wired). It reads "mono" and feels close, but to land the exact handoff identity you'd want to load Plex Mono the same way Plex Arabic is wired in `app/globals.css` and `app/layout.tsx`.
- **Bidi isolation for interpolated names.** `VoteConfirmation` renders `t("title", { name: voterName })` and `t("subtitle", { poll: pollTitle })`. A single `dir="auto"` on the wrapper can't pick correctly for a name embedded inside a translated sentence (mixed-script cases). The right fix is `<bdi>` around the interpolation, which requires either ICU rich-text in next-intl or splitting the translation. Skipped for now.
- **`isUrgent` threshold is hardcoded** to 24h in `components/polls/PollCard.tsx`. If you want a different cutoff or to surface it from the data, do it here.
- **`pulse-dot` halo size is fixed at 4px / 7px** in the keyframe. If the dot size in PollCard is tuned, the halo math doesn't auto-scale.

## Next Step

Nothing's in flight. Likely directions if the user pushes further:

1. **Wire IBM Plex Mono.** Mirror the existing IBM Plex Sans Arabic setup: add the `@import` (or `next/font`) declaration, expose it as `--font-mono`, override the current Geist Mono mapping. One-line change in `app/globals.css` and the import location.
2. **Bidi-isolate interpolated user content** in `VoteConfirmation`. Either switch to next-intl rich text and wrap `{name}` / `{poll}` in a `<bdi>` component, or split the translation into pre/post fragments.
3. **Cross-poll dedup** (carried over from the previous handoff). `findDuplicateCandidates` is same-poll only. User has not re-confirmed wanting this.
4. **Persist smart-dedup decisions** (carried over). "Not a duplicate" choices are lost on rescan since `dismissedGroups` is local React state.
5. **Logo + favicon** (carried over). The CB monogram `<span>` in `components/layout/SiteHeader.tsx` is still a placeholder; the user asked for a nano-banana prompt for both the logo and the hero photo.
