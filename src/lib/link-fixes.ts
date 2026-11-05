import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Finding = { id: string; field: "url" | "image" | "logo"; url: string; detail: string };

export type LinkReport = {
  checked: number;
  ok: number;
  blocked: number;
  dead: Finding[];
  moved: Finding[];
  brokenImages: Finding[];
};

export type AppliedFix = { id: string; change: "closed" | "removed-image" | "removed-logo"; detail: string; url: string };

/**
 * Turns a link report into edits of data/games/*.json:
 *  - dead page      -> "status": "closed"
 *  - broken image   -> the `image` / `logo` field is removed (the card falls back to a coloured tile / favicon)
 * "moved" findings are deliberately NOT auto-fixed: a redirect to a different site could be a rename, a sale or
 * a hijack, and a person has to look. Returns what it changed (empty when there is nothing to do).
 */
export function applyFixes(report: LinkReport, gamesDir: string): AppliedFix[] {
  const applied: AppliedFix[] = [];

  const edit = (id: string, fn: (game: Record<string, unknown>) => AppliedFix | null) => {
    const file = join(gamesDir, `${id}.json`);
    if (!existsSync(file)) return;
    const game = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    const change = fn(game);
    if (!change) return;
    writeFileSync(file, JSON.stringify(game, null, 2) + "\n");
    applied.push(change);
  };

  for (const f of report.dead) {
    if (f.field !== "url") continue;
    edit(f.id, (g) => {
      if (g.status === "closed") return null;
      g.status = "closed";
      return { id: f.id, change: "closed", detail: f.detail, url: f.url };
    });
  }

  for (const f of report.brokenImages) {
    if (f.field !== "image" && f.field !== "logo") continue;
    edit(f.id, (g) => {
      if (g[f.field] !== f.url) return null; // already changed since the report
      delete g[f.field];
      return { id: f.id, change: f.field === "image" ? "removed-image" : "removed-logo", detail: f.detail, url: f.url };
    });
  }
  return applied;
}

/** Markdown for the PR body. */
export function fixSummary(applied: AppliedFix[], moved: Finding[]): string {
  const lines = ["## What this changes", ""];
  const closed = applied.filter((a) => a.change === "closed");
  const images = applied.filter((a) => a.change !== "closed");
  if (closed.length) {
    lines.push("### Games marked closed (page is dead)", "", "| Game | Problem | URL |", "| --- | --- | --- |");
    for (const a of closed) lines.push(`| \`${a.id}\` | ${a.detail} | ${a.url} |`);
    lines.push("");
  }
  if (images.length) {
    lines.push("### Broken images removed (the card shows a coloured tile instead)", "", "| Game | Field | Problem | URL |", "| --- | --- | --- | --- |");
    for (const a of images) lines.push(`| \`${a.id}\` | ${a.change === "removed-logo" ? "logo" : "image"} | ${a.detail} | ${a.url} |`);
    lines.push("");
  }
  if (moved.length) {
    lines.push("### Not changed: moved to a different site (needs a person)", "");
    for (const m of moved) lines.push(`- \`${m.id}\`: ${m.detail}`);
    lines.push("");
  }
  lines.push(
    "## Before you approve",
    "",
    "This PR was opened automatically by the monthly link check. A failure can be temporary, so **open each URL yourself**.",
    "- Game is really gone, or hijacked / spam: approve.",
    "- It works (maybe it only blocks bots), or has a new address: close this PR, or edit the file(s) to point at the new URL / a replacement image.",
    "- A better image exists? Replace the removed `image` with the game's current official share image.",
    "",
    "Machine-made PR: it only edits `data/games/*.json`. See [CONTRIBUTING.md](https://github.com/NikaGeospatial/awesome-office-gg/blob/main/CONTRIBUTING.md#fixing-dead-games).",
  );
  return lines.join("\n") + "\n";
}
