import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyFixes, fixSummary, type LinkReport } from "../src/lib/link-fixes";
import { loadGames } from "../src/lib/games";

const empty: LinkReport = { checked: 0, ok: 0, blocked: 0, dead: [], moved: [], brokenImages: [] };
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "fixes-"));
  // bonk-io has no image; foon-o-uno-style has an image
  for (const f of ["bonk-io.json", "foon-o-uno-style.json"]) copyFileSync(join("data", "games", f), join(dir, f));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const read = (id: string) => JSON.parse(readFileSync(join(dir, `${id}.json`), "utf8"));

describe("applyFixes", () => {
  it("marks a dead page as closed, and the result still validates", () => {
    const applied = applyFixes({ ...empty, dead: [{ id: "bonk-io", field: "url", url: "https://bonk.io", detail: "HTTP 404" }] }, dir);
    expect(applied).toHaveLength(1);
    expect(read("bonk-io").status).toBe("closed");
    expect(() => loadGames(dir)).not.toThrow();
  });

  it("removes a broken image but leaves the game live", () => {
    const g = read("foon-o-uno-style");
    const applied = applyFixes({ ...empty, brokenImages: [{ id: g.id, field: "image", url: g.image, detail: "HTTP 404" }] }, dir);
    expect(applied.map((a) => a.change)).toEqual(["removed-image"]);
    expect(read(g.id).image).toBeUndefined();
    expect(read(g.id).status).toBe("live");
    expect(() => loadGames(dir)).not.toThrow();
  });

  it("does not touch a file when the image URL has since changed", () => {
    const applied = applyFixes({ ...empty, brokenImages: [{ id: "foon-o-uno-style", field: "image", url: "https://old.example/x.png", detail: "HTTP 404" }] }, dir);
    expect(applied).toHaveLength(0);
    expect(read("foon-o-uno-style").image).toBeDefined();
  });

  it("never auto-fixes a moved site", () => {
    const applied = applyFixes({ ...empty, moved: [{ id: "bonk-io", field: "url", url: "https://bonk.io", detail: "now redirects to https://spam.example" }] }, dir);
    expect(applied).toHaveLength(0);
    expect(read("bonk-io").status).toBe("live");
  });

  it("ignores findings for games that no longer exist and already-closed games", () => {
    applyFixes({ ...empty, dead: [{ id: "bonk-io", field: "url", url: "https://bonk.io", detail: "HTTP 404" }] }, dir);
    const again = applyFixes({ ...empty, dead: [{ id: "bonk-io", field: "url", url: "https://bonk.io", detail: "HTTP 404" }, { id: "nope", field: "url", url: "https://x.y", detail: "HTTP 404" }] }, dir);
    expect(again).toHaveLength(0);
  });
});

describe("fixSummary", () => {
  it("lists changes and what needs a person", () => {
    const md = fixSummary(
      [{ id: "a", change: "closed", detail: "HTTP 404", url: "https://a.example" }, { id: "b", change: "removed-image", detail: "HTTP 410", url: "https://b.example/i.png" }],
      [{ id: "c", field: "url", url: "https://c.example", detail: "now redirects to https://d.example" }],
    );
    expect(md).toContain("Games marked closed");
    expect(md).toContain("Broken images removed");
    expect(md).toContain("needs a person");
    expect(md).toContain("open each URL yourself");
  });
});
