/**
 * Writes data/games.schema.json from the Zod schema (the single source of truth).
 * Editors (see .vscode/settings.json) and AI agents can read it for autocompletion and field docs.
 * The test-suite fails if the committed file is stale: run `npm run schema` and commit it.
 */
import { writeFileSync } from "node:fs";
import { buildJsonSchema } from "../src/lib/json-schema";

writeFileSync("data/games.schema.json", JSON.stringify(buildJsonSchema(), null, 2) + "\n");
console.log("wrote data/games.schema.json");
