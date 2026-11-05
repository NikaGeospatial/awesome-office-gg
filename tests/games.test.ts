import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GameDataError, loadGames } from "../src/lib/games";
import { playersLabel, suggestIssueUrl } from "../src/lib/format";
import { CATEGORIES, GameSchema } from "../src/lib/schema";

const valid = {
  id: "example-game",
  name: "Example Game",
  url: "https://example.com/play",
  description: "A perfectly reasonable example game for testing.",
  status: "live",
  categories: ["party"],
  platforms: ["browser"],
  players: { min: 2, max: 8, source: "site" },
  checks: { round: "yes", free: "yes", easy: "yes" },
  privateRoom: true,
};

describe("the real catalogue", () => {
  const games = loadGames();

  it("loads and validates every game file", () => {
    expect(games.length).toBeGreaterThan(0);
  });

  it("has unique ids and unique URLs", () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
    expect(new Set(games.map((g) => g.url)).size).toBe(games.length);
  });

  it("only uses known categories, and every category is used at least once", () => {
    const used = new Set(games.flatMap((g) => g.categories));
    for (const id of Object.keys(CATEGORIES)) expect(used.has(id as keyof typeof CATEGORIES), id).toBe(true);
  });

  it("keeps the Hall of Fame honest", () => {
    for (const g of games.filter((x) => x.hallOfFame)) {
      const fails = Object.values(g.checks).includes("no") || !g.platforms.some((p) => p !== "desktop");
      expect(fails, g.id).toBe(true);
    }
  });
});

describe("GameSchema rules", () => {
  it("accepts a valid game", () => {
    expect(GameSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects http, shorteners and tracking parameters", () => {
    expect(GameSchema.safeParse({ ...valid, url: "http://example.com" }).success).toBe(false);
    expect(GameSchema.safeParse({ ...valid, url: "https://bit.ly/abc" }).success).toBe(false);
    expect(GameSchema.safeParse({ ...valid, url: "https://example.com/?utm_source=x" }).success).toBe(false);
  });

  it("rejects a game that fails a check but is not in the Hall of Fame", () => {
    const r = GameSchema.safeParse({ ...valid, checks: { round: "no", free: "yes", easy: "yes" } });
    expect(r.success).toBe(false);
  });

  it("rejects a Hall of Fame game that actually passes everything", () => {
    expect(GameSchema.safeParse({ ...valid, hallOfFame: true }).success).toBe(false);
  });

  it("treats desktop-only as failing the platform rule", () => {
    expect(GameSchema.safeParse({ ...valid, platforms: ["desktop"] }).success).toBe(false);
    expect(GameSchema.safeParse({ ...valid, platforms: ["desktop"], hallOfFame: true }).success).toBe(true);
  });

  it("rejects min > max and unknown fields", () => {
    expect(GameSchema.safeParse({ ...valid, players: { min: 9, max: 2, source: "site" } }).success).toBe(false);
    expect(GameSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });
});

describe("loadGames", () => {
  it("reports every problem at once and checks id/filename agreement", () => {
    const dir = mkdtempSync(join(tmpdir(), "games-"));
    try {
      writeFileSync(join(dir, "wrong-name.json"), JSON.stringify(valid));
      writeFileSync(join(dir, "bad.json"), "{ nope");
      let err: unknown;
      try {
        loadGames(dir);
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(GameDataError);
      expect((err as GameDataError).problems).toHaveLength(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("formatting", () => {
  it("labels player counts", () => {
    expect(playersLabel({ players: { min: 2, max: 10, source: "site" } })).toBe("2–10 players");
    expect(playersLabel({ players: { min: 4, max: 4, source: "rules" } })).toBe("4 players");
    expect(playersLabel({ players: { min: 2, max: 8, source: "approx" } })).toBe("≈ 2–8 players");
    expect(playersLabel({ players: { min: 2, max: 1000, source: "site" } })).toBe("2–1,000 players");
    expect(playersLabel({ players: { min: 1, max: 100, source: "approx" }, openLobby: true })).toBe("Open lobby · ≈100+");
  });

  it("builds a prefilled issue link", () => {
    const u = new URL(suggestIssueUrl("o/r", { name: "X Y", url: "https://x.y" }));
    expect(u.searchParams.get("template")).toBe("suggest-a-game.yml");
    expect(u.searchParams.get("game-name")).toBe("X Y");
  });
});

describe("generated JSON Schema", () => {
  it("is up to date (run `npm run schema` and commit the result)", async () => {
    const { readFileSync } = await import("node:fs");
    const { buildJsonSchema } = await import("../src/lib/json-schema");
    const committed = JSON.parse(readFileSync("data/games.schema.json", "utf8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(buildJsonSchema())));
  });
});
