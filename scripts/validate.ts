import { GameDataError, loadGames } from "../src/lib/games";

try {
  const games = loadGames();
  const main = games.filter((g) => !g.hallOfFame).length;
  console.log(`OK: ${games.length} games (${main} on the main list, ${games.length - main} in the Hall of Fame)`);
} catch (e) {
  if (e instanceof GameDataError) {
    console.error(e.message);
    process.exit(1);
  }
  throw e;
}
