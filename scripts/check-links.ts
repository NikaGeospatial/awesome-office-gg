/**
 * Monthly link check. Run: `npm run check:links`
 *
 * Checks every non-closed game's page URL, plus every hotlinked `image` / `logo`.
 *
 * Page URLs are classified as:
 *   ok       reachable (2xx, after redirects)
 *   moved    reachable, but redirects to a different site (not just a www/subdomain change):
 *            renamed, sold, or hijacked, so always worth a human look
 *   blocked  401/403/429: bot protection. Not counted as dead, because many
 *            Cloudflare-protected games would otherwise false-alarm every run
 *   dead     404/410, 5xx, DNS/TLS failure or timeout (after 3 attempts)
 *
 * Images must answer 2xx with an image/* content type (a 200 HTML page is a soft 404).
 * Same blocked/broken split. Broken images are removed by `npm run apply-fixes`; the card then
 * shows a coloured tile instead.
 *
 * Writes `link-report.md` (human) and `link-report.json` (machine, consumed by apply-fixes) and exits 1
 * if anything is dead, moved or has a broken image. This script never edits game files.
 */
import { writeFileSync } from "node:fs";
import { loadGames } from "../src/lib/games";
import type { LinkReport } from "../src/lib/link-fixes";
import { sameSite } from "../src/lib/url";

const UA = "awesome-office-gg-linkcheck (+https://github.com/NikaGeospatial/awesome-office-gg)";
const BLOCKED = [401, 403, 429];

type Probe = { status: number; finalUrl: string; contentType: string } | { error: string };

async function probe(url: string): Promise<Probe> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": UA, accept: "text/html,image/*,*/*" },
        signal: AbortSignal.timeout(20_000),
      });
      res.body?.cancel().catch(() => {});
      return { status: res.status, finalUrl: res.url, contentType: res.headers.get("content-type") ?? "" };
    } catch (e) {
      if (attempt === 3) return { error: (e as Error).cause ? String((e as { cause: unknown }).cause) : (e as Error).message };
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return { error: "unreachable" };
}

type Job = { id: string; field: "url" | "image" | "logo"; url: string };

async function runPool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: size }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) await fn(item);
    }),
  );
}

async function main() {
  const games = loadGames().filter((g) => g.status !== "closed");
  const jobs: Job[] = [];
  for (const g of games) {
    jobs.push({ id: g.id, field: "url", url: g.url });
    if (g.image) jobs.push({ id: g.id, field: "image", url: g.image });
    if (g.logo) jobs.push({ id: g.id, field: "logo", url: g.logo });
  }

  const report: LinkReport = { checked: jobs.length, ok: 0, blocked: 0, dead: [], moved: [], brokenImages: [] };

  await runPool(jobs, 6, async (job) => {
    const r = await probe(job.url);
    const isImage = job.field !== "url";

    if ("error" in r) {
      (isImage ? report.brokenImages : report.dead).push({ id: job.id, field: job.field, url: job.url, detail: r.error });
      return;
    }
    if (BLOCKED.includes(r.status)) {
      report.blocked++;
      return;
    }
    if (r.status >= 400) {
      (isImage ? report.brokenImages : report.dead).push({ id: job.id, field: job.field, url: job.url, detail: `HTTP ${r.status}` });
      return;
    }
    if (isImage) {
      if (!r.contentType.toLowerCase().startsWith("image/")) {
        report.brokenImages.push({ id: job.id, field: job.field, url: job.url, detail: `not an image (${r.contentType || "no content-type"})` });
        return;
      }
    } else if (!sameSite(new URL(job.url).hostname, new URL(r.finalUrl).hostname)) {
      report.moved.push({ id: job.id, field: "url", url: job.url, detail: `now redirects to ${r.finalUrl}` });
      return;
    }
    report.ok++;
  });

  const byId = (a: { id: string; field: string }, b: { id: string; field: string }) => a.id.localeCompare(b.id) || a.field.localeCompare(b.field);
  report.dead.sort(byId);
  report.moved.sort(byId);
  report.brokenImages.sort(byId);
  writeFileSync("link-report.json", JSON.stringify(report, null, 2) + "\n");

  const lines = [
    `Checked ${report.checked} URLs (pages and images): ${report.ok} ok, ${report.blocked} bot-protected (ignored), ` +
      `${report.dead.length} dead, ${report.moved.length} moved, ${report.brokenImages.length} broken images.`,
    "",
  ];
  const table = (title: string, rows: LinkReport["dead"]) => {
    if (!rows.length) return;
    lines.push(`### ${title}`, "", "| Game | Field | Problem | URL |", "| --- | --- | --- | --- |");
    for (const p of rows) lines.push(`| \`${p.id}\` | ${p.field} | ${p.detail} | ${p.url} |`);
    lines.push("");
  };
  table("Dead pages", report.dead);
  table("Moved to a different site", report.moved);
  table("Broken images", report.brokenImages);
  const problems = report.dead.length + report.moved.length + report.brokenImages.length;
  if (problems) lines.push("See CONTRIBUTING.md, \"Fixing dead games\".");
  const text = lines.join("\n") + "\n";
  writeFileSync("link-report.md", text);
  console.log(text);
  process.exit(problems ? 1 : 0);
}

main();
