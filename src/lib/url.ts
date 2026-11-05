/**
 * Registrable-domain helpers for the link checker.
 * Heuristic (no public-suffix list): last two labels, or last three for names like example.co.uk.
 */
const SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "edu", "ac"]);

export function registrableDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  const last = parts[parts.length - 1] ?? "";
  const second = parts[parts.length - 2] ?? "";
  const keep = last.length === 2 && SECOND_LEVEL.has(second) ? 3 : 2;
  return parts.slice(-keep).join(".");
}

/** True when two hostnames belong to the same site (www.x.com ≈ en.x.com ≈ x.com). */
export function sameSite(a: string, b: string): boolean {
  return registrableDomain(a) === registrableDomain(b);
}
