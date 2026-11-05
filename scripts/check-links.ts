/**
 * Weekly link check. Run: `npm run check:links`
 *
 * Classifies every non-closed game's URL as:
 *   ok       reachable (2xx, after redirects)
 *   moved    reachable, but the final host is a different site than the one we list
 *            (renamed, sold, or hijacked: always worth a human look)
 *   blocked  401/403/429: bot protection. Not counted as dead, because many
 *            Cloudflare-protected games would otherwise false-alarm every week
 *   dead     404/410, 5xx, DNS/TLS failure or timeout (after retries)
 *
 * Writes `link-report.md` (used by the workflow to open an issue) and exits 1 if anything is dead or moved.
 * Never edits game files: a person or agent decides what to do, via a normal PR.
 */
import { writeFileSync } from "node:fs";
import { loadGames } from "../src/lib/games";

type Result = { id: string; url: string; kind: "ok" | "moved" | "blocked" | "dead"; detail: string };

const UA = "awesome-office-gg-linkcheck (+https://github.com/NikaGeospatial/awesome-office-gg)";
const bare = (h: string) => h.replace(/^www\./, "").toLowerCase();

async function probe(url: string): Promise<{ status: number; finalUrl: string } | { error: string }> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": UA, accept: "text/html,*/*" },
        signal: AbortSignal.timeout(20_000),
      });
      res.body?.cancel().catch(() => {});
      return { status: res.status, finalUrl: res.url };
    } catch (e) {
      if (attempt === 3) return { error: (e as Error).cause ? String((e as { cause: unknown }).cause) : (e as Error).message };
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return { error: "unreachable" };
}

async function check(id: string, url: string): Promise<Result> {
  const r = await probe(url);
  if ("error" in r) return { id, url, kind: "dead", detail: r.error };
  if ([401, 403, 429].includes(r.status)) return { id, url, kind: "blocked", detail: `HTTP ${r.status} (bot protection)` };
  if (r.status >= 400) return { id, url, kind: "dead", detail: `HTTP ${r.status}` };
  const from = new URL(url).hostname;
  const to = new URL(r.finalUrl).hostname;
  if (bare(from) !== bare(to)) return { id, url, kind: "moved", detail: `now redirects to ${r.finalUrl}` };
  return { id, url, kind: "ok", detail: `HTTP ${r.status}` };
}

async function main() {
  const games = loadGames().filter((g) => g.status !== "closed");
  const results: Result[] = [];
  const queue = [...games];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let g = queue.shift(); g; g = queue.shift()) results.push(await check(g.id, g.url));
    }),
  );
  results.sort((a, b) => a.id.localeCompare(b.id));

  const count = (k: Result["kind"]) => results.filter((r) => r.kind === k).length;
  const problems = results.filter((r) => r.kind === "dead" || r.kind === "moved");

  const lines = [
    `Checked ${results.length} links: ${count("ok")} ok, ${count("blocked")} bot-protected (ignored), ${count("moved")} moved, ${count("dead")} dead.`,
    "",
  ];
  if (problems.length) {
    lines.push("| Game | Problem | URL |", "| --- | --- | --- |");
    for (const p of problems) lines.push(`| \`${p.id}\` | ${p.kind}: ${p.detail} | ${p.url} |`);
    lines.push(
      "",
      "What to do: open each URL yourself. If the game is really gone, open a PR setting `\"status\": \"closed\"` in its `data/games/<id>.json`. If it moved, update `url`. If it was hijacked or turned into spam, mark it closed and say so in the PR. See CONTRIBUTING.md.",
    );
  }
  const report = lines.join("\n") + "\n";
  writeFileSync("link-report.md", report);
  console.log(report);
  process.exit(problems.length ? 1 : 0);
}

main();
