import { describe, expect, it } from "vitest";
import { registrableDomain, sameSite } from "../src/lib/url";

describe("sameSite", () => {
  it("treats subdomain and www redirects as the same site", () => {
    expect(sameSite("boardgamearena.com", "en.boardgamearena.com")).toBe(true);
    expect(sameSite("www.pokernow.club", "www.pokernow.com")).toBe(false);
    expect(sameSite("shellshock.io", "www.shellshock.io")).toBe(true);
  });

  it("flags a different domain (moved, sold or hijacked)", () => {
    expect(sameSite("paper-io.com", "voodoo.io")).toBe(false);
    expect(sameSite("example.com", "example.org")).toBe(false);
  });

  it("handles two-level public suffixes", () => {
    expect(registrableDomain("play.example.co.uk")).toBe("example.co.uk");
    expect(registrableDomain("a.b.example.com")).toBe("example.com");
    expect(registrableDomain("localhost")).toBe("localhost");
  });
});
