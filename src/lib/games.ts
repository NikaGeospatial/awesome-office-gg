import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GameSchema, type Game } from "./schema";

// Always run from the repository root (npm scripts, Astro and Vitest all do).
// Not derived from import.meta.url: Astro bundles this module into dist/.prerender/.
export const GAMES_DIR = join(process.cwd(), "data", "games");

export class GameDataError extends Error {
  constructor(public readonly problems: string[]) {
    super(`${problems.length} problem(s) in data/games:\n` + problems.map((p) => `  - ${p}`).join("\n"));
    this.name = "GameDataError";
  }
}

/** Normalised key used to catch the same game being added twice under different ids. */
function urlKey(url: string): string {
  const u = new URL(url);
  return (u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/+$/, "")).toLowerCase();
}

/**
 * Reads and validates every `data/games/*.json`.
 * Throws GameDataError listing every problem at once, so an agent can fix them in one pass.
 */
export function loadGames(dir: string = GAMES_DIR): Game[] {
  const problems: string[] = [];
  const games: Game[] = [];
  const files = readdirSync(dir).filter((f) => !f.startsWith("."));

  for (const file of files) {
    if (!file.endsWith(".json")) {
      problems.push(`${file}: only .json files belong in data/games/`);
      continue;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (e) {
      problems.push(`${file}: not valid JSON (${(e as Error).message})`);
      continue;
    }
    const parsed = GameSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push(`${file}: ${issue.path.length ? issue.path.join(".") + ": " : ""}${issue.message}`);
      }
      continue;
    }
    if (parsed.data.id + ".json" !== file) {
      problems.push(`${file}: "id" is "${parsed.data.id}" so the file must be named ${parsed.data.id}.json`);
      continue;
    }
    games.push(parsed.data);
  }

  const seenUrl = new Map<string, string>();
  for (const g of games) {
    const key = urlKey(g.url);
    const prior = seenUrl.get(key);
    if (prior) problems.push(`${g.id}.json: url duplicates ${prior}.json (${key})`);
    else seenUrl.set(key, g.id);
  }

  if (problems.length) throw new GameDataError(problems);
  return games.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}
