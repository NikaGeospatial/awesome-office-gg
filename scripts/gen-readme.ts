/**
 * Regenerates the README artwork (docs/readme/*.svg) and the data-driven README
 * fragments (logo wall, stats) from data/games/*.json.
 * The test-suite fails if the committed files are stale: run `npm run readme` and commit.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadGames } from "../src/lib/games";
import { ASSET_DIR, buildReadmeFragments, buildReadmeSvgs, spliceFragments } from "../src/lib/readme-assets";

const games = loadGames();
mkdirSync(ASSET_DIR, { recursive: true });
for (const [file, svg] of Object.entries(buildReadmeSvgs(games))) {
  writeFileSync(`${ASSET_DIR}/${file}`, svg);
  console.log(`wrote ${ASSET_DIR}/${file}`);
}
const readme = readFileSync("README.md", "utf8");
writeFileSync("README.md", spliceFragments(readme, buildReadmeFragments(games)));
console.log("updated README.md fragments");
