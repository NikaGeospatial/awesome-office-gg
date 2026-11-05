import { z } from "zod";

/**
 * The shape of one game file in `data/games/<id>.json`.
 * The list's criteria (see CONTRIBUTING.md) are enforced here, so a PR that
 * puts a game in the wrong place fails CI instead of relying on a reviewer's eye.
 */

export const CATEGORIES = {
  "social-deduction": "Social deduction",
  "card-games": "Card games",
  "board-games": "Board games",
  party: "Party",
  drawing: "Drawing",
  "words-trivia": "Words & trivia",
  shooters: "Shooters",
  "arcade-physics": "Arcade & physics",
  strategy: "Strategy",
  "sports-racing": "Sports & racing",
  "co-op": "Co-op",
  "puzzle-typing": "Puzzle & typing",
} as const;
export type CategoryId = keyof typeof CATEGORIES;
const categoryIds = Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]];

export const PLATFORMS = { browser: "Browser", phone: "Phone", desktop: "Desktop" } as const;
export type PlatformId = keyof typeof PLATFORMS;

export const STATUSES = { live: "Live", beta: "Beta", download: "Download", closed: "Closed" } as const;
export type StatusId = keyof typeof STATUSES;

const Check = z.enum(["yes", "partly", "no"]);

const SHORTENERS = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly"];
const TRACKING = /^(utm_|ref$|referrer$|aff|affiliate|fbclid$|gclid$|mc_cid$|mc_eid$)/i;

function httpsUrl(label: string) {
  return z.string().superRefine((value, ctx) => {
    let u: URL;
    try {
      u = new URL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: `${label} must be a valid URL` });
      return;
    }
    if (u.protocol !== "https:") ctx.addIssue({ code: "custom", message: `${label} must use https://` });
    if (u.username || u.password) ctx.addIssue({ code: "custom", message: `${label} must not contain credentials` });
    if (SHORTENERS.includes(u.hostname.replace(/^www\./, ""))) {
      ctx.addIssue({ code: "custom", message: `${label} must be the real destination, not a link shortener` });
    }
    for (const key of u.searchParams.keys()) {
      if (TRACKING.test(key)) ctx.addIssue({ code: "custom", message: `${label} must not carry tracking/affiliate parameter "${key}"` });
    }
  });
}

export const GameSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case (a-z, 0-9, hyphens)").max(48),
    name: z.string().min(1).max(40),
    url: httpsUrl("url"),
    description: z.string().min(10).max(140, "description must be 140 characters or fewer"),
    status: z.enum(["live", "beta", "download", "closed"]),
    categories: z.array(z.enum(categoryIds)).min(1).max(3),
    platforms: z.array(z.enum(["browser", "phone", "desktop"])).min(1).max(3),
    players: z
      .object({
        min: z.number().int().min(1),
        max: z.number().int().max(100000),
        // site   = stated on the game's own site
        // rules  = the standard rules of a well-known game
        // approx = third-party sources or typical lobby size (shown with "≈")
        source: z.enum(["site", "rules", "approx"]),
      })
      .strict()
      .refine((p) => p.min <= p.max, "players.min must be <= players.max"),
    checks: z
      .object({
        round: Check, // a full round fits in one hour
        free: Check, // free, and no account (or just a nickname)
        easy: Check, // rules explained in ~2 minutes
      })
      .strict(),
    privateRoom: z.boolean(),
    openLobby: z.boolean().optional(),
    hallOfFame: z.boolean().optional(),
    image: httpsUrl("image").optional(),
    logo: httpsUrl("logo").optional(),
  })
  .strict()
  .superRefine((g, ctx) => {
    const reachable = g.platforms.includes("browser") || g.platforms.includes("phone");
    const failsRule = !reachable || Object.values(g.checks).includes("no");
    if (g.hallOfFame && !failsRule) {
      ctx.addIssue({
        code: "custom",
        path: ["hallOfFame"],
        message: "hallOfFame is for games that fail a criterion; this one passes all of them, so move it to the main list",
      });
    }
    if (!g.hallOfFame && failsRule) {
      ctx.addIssue({
        code: "custom",
        path: ["hallOfFame"],
        message: 'This game fails a criterion (a "no" check, or desktop-only). Set "hallOfFame": true, or fix the checks if they are wrong',
      });
    }
    if (new Set(g.categories).size !== g.categories.length) {
      ctx.addIssue({ code: "custom", path: ["categories"], message: "categories must be unique" });
    }
    if (new Set(g.platforms).size !== g.platforms.length) {
      ctx.addIssue({ code: "custom", path: ["platforms"], message: "platforms must be unique" });
    }
  });

export type Game = z.infer<typeof GameSchema>;
