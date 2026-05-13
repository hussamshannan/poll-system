import { normalizePhone, normalizeName } from "./phone";

export const MIN_SHARED_TOKENS = 2;

export type MatchReason = "phone-match" | "name-prefix" | "name-subset";
export type MatchConfidence = "high" | "medium";

export interface MatchResult {
  reason: MatchReason;
  confidence: MatchConfidence;
}

/**
 * Arabic-aware normalization on top of NFC + whitespace collapse.
 * - Unifies alef variants (أ إ آ → ا)
 * - Unifies alef-maksura (ى → ي)
 * - Strips tashkeel (Arabic diacritics, U+064B..U+065F)
 * - Strips tatweel (U+0640)
 */
export function normalizeArabicName(input: string): string {
  return normalizeName(input)
    .replace(/[ـ]/g, "")
    .replace(/[ً-ٟ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

export function tokenize(normalized: string): string[] {
  return normalized.split(/\s+/).filter(Boolean);
}

function isOrderedPrefix(shorter: string[], longer: string[]): boolean {
  if (shorter.length === 0 || shorter.length > longer.length) return false;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) return false;
  }
  return true;
}

function isUnorderedSubset(small: Set<string>, big: Set<string>): boolean {
  if (small.size === 0 || small.size > big.size) return false;
  for (const t of small) if (!big.has(t)) return false;
  return true;
}

export interface VoteLike {
  voterName: string;
  voterPhone: string;
}

/**
 * Pairwise comparison. Returns the strongest match found, or null.
 *
 * High confidence:
 *   - phone-match: same normalized phone
 *   - name-prefix: one's tokens are an ordered prefix of the other's, and the
 *                  shorter has ≥ MIN_SHARED_TOKENS tokens
 *
 * Medium confidence:
 *   - name-subset: one's tokens are an unordered subset of the other's, and
 *                  the intersection size is ≥ MIN_SHARED_TOKENS
 */
export function compareVotes(a: VoteLike, b: VoteLike): MatchResult | null {
  const phoneA = normalizePhone(a.voterPhone);
  const phoneB = normalizePhone(b.voterPhone);
  if (phoneA && phoneB && phoneA === phoneB) {
    return { reason: "phone-match", confidence: "high" };
  }

  const tokensA = tokenize(normalizeArabicName(a.voterName));
  const tokensB = tokenize(normalizeArabicName(b.voterName));

  const shorter = tokensA.length <= tokensB.length ? tokensA : tokensB;
  const longer = tokensA.length <= tokensB.length ? tokensB : tokensA;

  if (
    shorter.length >= MIN_SHARED_TOKENS &&
    isOrderedPrefix(shorter, longer)
  ) {
    return { reason: "name-prefix", confidence: "high" };
  }

  const setShorter = new Set(shorter);
  const setLonger = new Set(longer);
  if (
    setShorter.size >= MIN_SHARED_TOKENS &&
    isUnorderedSubset(setShorter, setLonger)
  ) {
    return { reason: "name-subset", confidence: "medium" };
  }

  return null;
}

/** Union-Find with path compression. */
class DSU {
  parent = new Map<string, string>();
  find(x: string): string {
    let p = this.parent.get(x) ?? x;
    if (p === x) {
      this.parent.set(x, x);
      return x;
    }
    p = this.find(p);
    this.parent.set(x, p);
    return p;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

const CONFIDENCE_RANK: Record<MatchConfidence, number> = { high: 2, medium: 1 };

export interface ClusteredVote {
  id: string;
  vote: VoteLike & Record<string, unknown>;
}

export interface VoteCluster<T extends VoteLike> {
  members: Array<T & { _id: string }>;
  reason: MatchReason;
  confidence: MatchConfidence;
}

/**
 * Run pairwise compareVotes, cluster transitively, and emit groups with the
 * strongest reason found inside each cluster.
 *
 * The input must have stable `_id` strings. Clusters of size 1 are dropped.
 */
export function clusterDuplicates<T extends VoteLike & { _id: string }>(
  votes: T[]
): VoteCluster<T>[] {
  const dsu = new DSU();
  // Strongest reason recorded per cluster root; lazily migrated on union.
  const bestPerRoot = new Map<string, MatchResult>();

  // Seed roots so DSU.find always succeeds.
  for (const v of votes) dsu.find(v._id);

  for (let i = 0; i < votes.length; i++) {
    for (let j = i + 1; j < votes.length; j++) {
      const result = compareVotes(votes[i], votes[j]);
      if (!result) continue;

      const a = votes[i]._id;
      const b = votes[j]._id;
      dsu.union(a, b);
      const root = dsu.find(a);

      const existing = bestPerRoot.get(root);
      if (
        !existing ||
        CONFIDENCE_RANK[result.confidence] > CONFIDENCE_RANK[existing.confidence]
      ) {
        bestPerRoot.set(root, result);
      }
    }
  }

  const byRoot = new Map<string, T[]>();
  for (const v of votes) {
    const root = dsu.find(v._id);
    const arr = byRoot.get(root) ?? [];
    arr.push(v);
    byRoot.set(root, arr);
  }

  // Re-key bestPerRoot to the *current* roots, since unions may have moved them.
  const finalBest = new Map<string, MatchResult>();
  for (const [rootAtTimeOfUnion, result] of bestPerRoot) {
    const currentRoot = dsu.find(rootAtTimeOfUnion);
    const existing = finalBest.get(currentRoot);
    if (
      !existing ||
      CONFIDENCE_RANK[result.confidence] > CONFIDENCE_RANK[existing.confidence]
    ) {
      finalBest.set(currentRoot, result);
    }
  }

  const clusters: VoteCluster<T>[] = [];
  for (const [root, members] of byRoot) {
    if (members.length < 2) continue;
    const best = finalBest.get(root);
    if (!best) continue; // safety: should always exist if cluster has ≥ 2
    clusters.push({
      members,
      reason: best.reason,
      confidence: best.confidence,
    });
  }
  return clusters;
}
