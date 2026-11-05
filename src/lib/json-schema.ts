import { z } from "zod";
import { GameSchema } from "./schema";

/** JSON Schema for one game file. Cross-field rules (Hall of Fame vs checks) live only in the Zod schema. */
export function buildJsonSchema(): Record<string, unknown> {
  const schema = z.toJSONSchema(GameSchema, { target: "draft-7", io: "input" }) as Record<string, unknown>;
  return {
    ...schema,
    title: "awesome-office-gg game",
    description:
      "One file per game in data/games/<id>.json. See CONTRIBUTING.md for what each field means and the criteria. " +
      'Extra rule enforced by `npm run validate`: a game that has any "no" check, or is desktop-only, must set "hallOfFame": true, and vice versa.',
  };
}
