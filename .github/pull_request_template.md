<!-- Title: "Add <Game>", "Fix <Game>: <what>", "Mark <Game> as closed". Squash-merged, so the title becomes the commit. -->

## What changed

<!-- One logical change. Which data/games/*.json file(s)? -->

## Evidence

<!-- For every game added or changed. "I couldn't confirm X" is a good answer; a wrong "yes" is not. -->

- **Link:** loads? HTTP status / final URL:
- **Group play:** how did you start a shared game (private room / link / code / lobby)?
- **Free + no account:** what did you see (nickname only? signup prompt? host-only account?)
- **Round length / easy to learn:**
- **Player count source:** site / rules / approx, and where:
- **Could not verify:**

## Checklist

- [ ] Only `data/games/*.json` changed (or this PR is clearly a separate docs/tooling/schema change)
- [ ] `npm run validate && npm test` pass locally
- [ ] No tracking parameters, link shorteners, binaries or secrets
- [ ] Image is a hotlinked official share image (or omitted)
- [ ] Meets the [content standards](../CONTRIBUTING.md#content-standards)

## Agent involvement

- [ ] No agent was involved
- [ ] An AI agent helped (tool/model: ______ ), and **I reviewed the final diff myself**
- [ ] An AI agent authored this autonomously (tool/model: ______ ; operator: @______ )
