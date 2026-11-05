import type { Game } from "./schema";

const fmt = (n: number) => (n >= 1000 ? "1,000" : String(n));

/** The label on every card's image, e.g. "2–10 players", "≈ 2–8 players", "Open lobby · ≈100+". */
export function playersLabel(g: Pick<Game, "players" | "openLobby">): string {
  const { min, max, source } = g.players;
  if (g.openLobby) return `Open lobby · ≈${fmt(max)}+`;
  const range = min === max ? `${min}` : `${min}–${fmt(max)}`;
  return `${source === "approx" ? "≈ " : ""}${range} players`;
}

export const CHECK_LABELS = ["≤1h", "Free", "Easy"] as const;
export const CHECK_MARK = { yes: "✓", partly: "~", no: "✗" } as const;

/** Favicon-service fallback used when a game has no explicit `logo`. */
export function logoUrl(g: Pick<Game, "url" | "logo">): string {
  if (g.logo) return g.logo;
  return `https://www.google.com/s2/favicons?domain=${new URL(g.url).hostname}&sz=128`;
}

/** Deterministic placeholder hue for games without artwork. */
export function placeholderHue(name: string): number {
  return [190, 330, 45, 150, 265, 10][name.length % 6] ?? 190;
}

/** Prefilled "suggest a game" issue link. */
export function suggestIssueUrl(repo: string, fields: { name?: string; url?: string; players?: string; notes?: string }): string {
  const p = new URLSearchParams({ template: "suggest-a-game.yml" });
  if (fields.name) p.set("title", `Suggest: ${fields.name}`);
  if (fields.name) p.set("game-name", fields.name);
  if (fields.url) p.set("game-url", fields.url);
  if (fields.players) p.set("players", fields.players);
  if (fields.notes) p.set("notes", fields.notes);
  return `https://github.com/${repo}/issues/new?${p.toString()}`;
}
