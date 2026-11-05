/**
 * Applies link-report.json (from `npm run check:links`) to data/games/*.json and writes fix-summary.md
 * for use as a PR body. Prints the number of files changed. Run `npm run validate` afterwards.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { GAMES_DIR } from "../src/lib/games";
import { applyFixes, fixSummary, type LinkReport } from "../src/lib/link-fixes";

if (!existsSync("link-report.json")) {
  console.error("link-report.json not found. Run `npm run check:links` first.");
  process.exit(1);
}
const report = JSON.parse(readFileSync("link-report.json", "utf8")) as LinkReport;
const applied = applyFixes(report, GAMES_DIR);

if (applied.length) writeFileSync("fix-summary.md", fixSummary(applied, report.moved));
console.log(`${applied.length} change(s) applied`);
for (const a of applied) console.log(`  - ${a.id}: ${a.change} (${a.detail})`);
