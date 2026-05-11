const PREFIX = "pollapp:voted:";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function hasVotedLocally(pollId: string): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(PREFIX + pollId) !== null;
  } catch {
    return false;
  }
}

export function markVotedLocally(pollId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + pollId, new Date().toISOString());
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
