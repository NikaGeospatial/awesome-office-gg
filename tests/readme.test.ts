import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadGames } from "../src/lib/games";
import { ASSET_DIR, buildReadmeFragments, buildReadmeSvgs, spliceFragments } from "../src/lib/readme-assets";

const games = loadGames();

describe("README artwork", () => {
  const svgs = buildReadmeSvgs(games);

  it("committed SVGs match the generator (run `npm run readme` if this fails)", () => {
    for (const [file, svg] of Object.entries(svgs)) {
      expect(readFileSync(`${ASSET_DIR}/${file}`, "utf8"), file).toBe(svg);
    }
  });

  it("README fragments (logo wall, stats) are up to date (run `npm run readme`)", () => {
    const readme = readFileSync("README.md", "utf8");
    expect(spliceFragments(readme, buildReadmeFragments(games))).toBe(readme);
  });

  it("every SVG is self-contained: no scripts, no external loads", () => {
    for (const [file, svg] of Object.entries(svgs)) {
      expect(svg, file).not.toMatch(/<script|<image|href="http|xlink:href|url\(http|@import/i);
      expect(svg.startsWith("<svg "), file).toBe(true);
      expect(svg.trimEnd().endsWith("</svg>"), file).toBe(true);
    }
  });

  it("escapes game names (no raw ampersands in text)", () => {
    for (const [file, svg] of Object.entries(svgs)) {
      expect(svg, file).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
    }
  });

  it("every README image reference points at a generated file", () => {
    const readme = readFileSync("README.md", "utf8");
    const local = [...readme.matchAll(/src="(docs\/readme\/[^"]+)"/g)].map((m) => (m[1] ?? "").replace(`${ASSET_DIR}/`, ""));
    expect(local.length).toBeGreaterThan(0);
    for (const f of local) expect(Object.keys(svgs), f).toContain(f);
  });
});
