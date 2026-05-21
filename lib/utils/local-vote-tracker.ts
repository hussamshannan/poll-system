const PREFIX = "pollapp:voted:";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function cycleKey(releaseAt: string | null | undefined): string {
  return releaseAt ?? "always-open";
}

export function hasVotedLocally(
  pollId: string,
  releaseAt: string | null | undefined
): boolean {
  if (!isBrowser()) return false;
  try {
    const raw = window.localStorage.getItem(PREFIX + pollId);
    if (!raw) return false;
    return raw === cycleKey(releaseAt);
  } catch {
    return false;
  }
}

export function markVotedLocally(
  pollId: string,
  releaseAt: string | null | undefined
): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + pollId, cycleKey(releaseAt));
  } catch {
    /* private mode / quota errors are non-fatal — server-side uniqueness still applies */
  }
}

export function clearVotedLocally(pollId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + pollId);
  } catch {
    /* non-fatal */
  }
}
