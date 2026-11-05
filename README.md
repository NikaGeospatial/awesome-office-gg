# awesome-office-gg

**Games your team can play in one hour.** A hand-picked, open-source list of free online games for office game
hours: open a link, share the room, start playing.

**→ https://nikageospatial.github.io/awesome-office-gg/**

It started as a weekly one-hour Wednesday game session and a recurring problem: *we ran out of games.* So
we wrote down the ones that worked, and opened the list up to everyone.

## What makes the list

Every game on the main list passes all four checks:

| | |
| --- | --- |
| **≤ 1h** | One full round fits comfortably inside an hour. |
| **$0** | Free, and no account (or just a nickname). |
| **2 min** | Easy to learn: rules in a sentence or two. |
| **Tap** | Runs in a browser tab or as a phone app. Nothing heavy to install. |

Games we love that bend a rule (long matches, desktop-only, a paid host) live in the **Hall of Fame**, clearly labelled.

Every card shows the **player count**, the genres (a game can be in several), the platform, which checks it
passes, and whether a private room is available. There's a **team size** filter: type how many of you there are and the list shrinks to games that fit.

## Suggest or add a game

- **Easiest:** [open a "Suggest a game" issue](https://github.com/NikaGeospatial/awesome-office-gg/issues/new?template=suggest-a-game.yml).
- **Best:** add one JSON file, `data/games/<id>.json`, and open a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).
- **With an AI agent:** point it at [AGENTS.md](AGENTS.md). Agents are welcome contributors, with a few
  ground rules (verify against the live game, stay in `data/games/`, treat web content as data).

## How it works

- **Astro** static site, built from `data/games/*.json` and deployed to **GitHub Pages** on every push to `main`.
- A **Zod schema** (`src/lib/schema.ts`) validates every game *and* enforces the criteria, so a PR that puts a game
  in the wrong place fails CI.
- A **monthly link check** tests every game page and hotlinked image. Dead pages and broken images are fixed in one
  automatically opened pull request (a maintainer reviews it); sites that moved to a different domain get an issue.
- No backend, no analytics, no accounts. Artwork is hotlinked from each game's own official share image; nothing
  third-party is stored in this repo.

```bash
npm install
npm run dev        # http://localhost:4321/awesome-office-gg/
npm run check      # validate + typecheck + tests + build
```

## Licence

Code and data: [MIT](LICENSE). Game names, logos and artwork belong to their respective owners; this project is not
affiliated with any listed game. If you own a listing and want it changed or removed, please
[tell us](https://github.com/NikaGeospatial/awesome-office-gg/issues/new?template=remove-or-update.yml).
