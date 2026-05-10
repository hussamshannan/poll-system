/**
 * Normalize a user-typed phone number to a canonical "+digits" form.
 *
 *   "+913 677 177"  → "+913677177"
 *   "00913677177"   → "+913677177"
 *   "0913677177"    → "+913677177"
 *   "913677177"     → "+913677177"
 *   "abc"           → null
 *
 * Returns null when the result has fewer than 7 or more than 15 digits
 * (E.164 caps the subscriber number at 15 total).
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== "string") return null;

  // Drop spaces, hyphens, parens, dots — keep digits and a possible leading "+"
  const stripped = input.trim().replace(/[\s\-().]/g, "");
  if (!stripped) return null;

  let result: string;
  if (stripped.startsWith("+")) {
    result = "+" + stripped.slice(1).replace(/\D/g, "");
  } else if (stripped.startsWith("00")) {
    result = "+" + stripped.slice(2).replace(/\D/g, "");
  } else if (stripped.startsWith("0")) {
    result = "+" + stripped.slice(1).replace(/\D/g, "");
  } else {
    result = "+" + stripped.replace(/\D/g, "");
  }

  if (!/^\+\d{7,15}$/.test(result)) return null;
  return result;
}

/**
 * Normalize a voter name for comparison: NFC-normalize Unicode (so different
 * IME compositions of the same Arabic glyph match), trim, and collapse
 * internal whitespace.
 */
export function normalizeName(input: string): string {
  if (typeof input !== "string") return "";
  return input.normalize("NFC").trim().replace(/\s+/g, " ");
}
