/**
 * Builds the README's artwork: original animated SVGs, plus the logo wall.
 * Everything is derived from `data/games/*.json`, so counts and game names never
 * go stale; the test-suite fails if the committed files differ from this output.
 * Regenerate with `npm run readme`.
 *
 * The SVGs are original shapes (no third-party artwork) and use CSS keyframes,
 * which GitHub renders when they are embedded with <img>. They only use system
 * fonts and no scripts. `prefers-reduced-motion` switches the motion off.
 */
import { CATEGORIES, type Game } from "./schema";
import { logoUrl } from "./format";

const INK = "#15121a";
const PAPER = "#fff4dc";
const RED = "#ff5a45";
const SUN = "#ffc938";
const MINT = "#3ddc97";
const SKY = "#4cc9f0";
const GRAPE = "#9b6bff";
const PINK = "#ff8fc7";
const PALETTE = [SUN, SKY, MINT, PINK, GRAPE, RED];
/** Cyclic array access that is safe under noUncheckedIndexedAccess. */
const at = <T>(a: readonly T[], i: number): T => a[i % a.length] as T;

const SANS = `'Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif`;
const BODY = `'Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Estimated rendered width of `text` at `size` px (heavy display font vs body font). */
const estWidth = (text: string, size: number, heavy: boolean) => Math.round(text.length * size * (heavy ? 0.66 : 0.56));

/** `textLength` attribute that squeezes text into `maxW` only when it would overflow, so it fits whatever font renders it. */
const fit = (text: string, size: number, maxW: number, heavy = false) =>
  estWidth(text, size, heavy) > maxW ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"` : "";

const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

/** Wraps the artwork in the shared neo-brutalist card (paper, dotted, hard shadow). */
function card(opts: { id: string; w: number; h: number; title: string; desc: string; css: string; body: string }): string {
  const { id, w, h, title, desc, css, body } = opts;
  const iw = w - 12;
  const ih = h - 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${id}-t ${id}-d">
<title id="${id}-t">${esc(title)}</title>
<desc id="${id}-d">${esc(desc)}</desc>
<defs>
<pattern id="${id}-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="${INK}" opacity=".14"/></pattern>
<clipPath id="${id}-clip"><rect x="4" y="4" width="${iw}" height="${ih}"/></clipPath>
</defs>
<style>
.${id} text{font-family:${BODY}}
.${id} .b{font-family:${SANS};font-weight:900}
.${id} .m{font-family:${MONO}}
${css}
${REDUCED}
</style>
<g class="${id}">
<rect x="14" y="14" width="${iw}" height="${ih}" fill="${INK}"/>
<rect x="4" y="4" width="${iw}" height="${ih}" fill="${PAPER}"/>
<rect x="4" y="4" width="${iw}" height="${ih}" fill="url(#${id}-dots)"/>
${body}
<rect x="4" y="4" width="${iw}" height="${ih}" fill="none" stroke="${INK}" stroke-width="6"/>
</g>
</svg>
`;
}

/** A hard-shadowed rounded block used for cards, chips and pills. */
function block(x: number, y: number, w: number, h: number, fill: string, extra = ""): string {
  return `<rect x="${x + 5}" y="${y + 5}" width="${w}" height="${h}" rx="14" fill="${INK}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${INK}" stroke-width="4" ${extra}/>`;
}

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------
function hero(main: Game[]): string {
  const names = main.map((g) => g.name);
  const strip = names.join("  •  ") + "  •  ";
  const charW = 13.2;
  const stripW = Math.round(strip.length * charW);
  const dur = Math.round(stripW / 80);
  const css = `
.hero .bob1{animation:hbob 3.2s ease-in-out infinite}
.hero .bob2{animation:hbob 4.1s ease-in-out -1.2s infinite}
.hero .bob3{animation:hbob 3.7s ease-in-out -2.2s infinite}
.hero .bob4{animation:hbob 4.6s ease-in-out -0.6s infinite}
.hero .spin{animation:hspin 14s linear infinite;transform-box:fill-box;transform-origin:center}
.hero .wob{animation:hwob 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.hero .pulse{animation:hpulse 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.hero .p1{animation:hpop 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.hero .p2{animation:hpop 3.6s ease-in-out .25s infinite;transform-box:fill-box;transform-origin:center}
.hero .p3{animation:hpop 3.6s ease-in-out .5s infinite;transform-box:fill-box;transform-origin:center}
.hero .p4{animation:hpop 3.6s ease-in-out .75s infinite;transform-box:fill-box;transform-origin:center}
.hero .mark{animation:hmark 5s ease-in-out infinite;transform-box:fill-box;transform-origin:left center}
.hero .ticker{animation:hscroll ${dur}s linear infinite}
@keyframes hbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes hspin{to{transform:rotate(360deg)}}
@keyframes hwob{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes hpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes hpop{0%,100%{transform:scale(1)}8%{transform:scale(1.14)}16%{transform:scale(1)}}
@keyframes hmark{0%{transform:scaleX(0)}35%,85%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes hscroll{to{transform:translateX(-${stripW}px)}}`;

  const pill = (x: number, y: number, w: number, label: string, fill: string, cls: string) =>
    `<g class="${cls}">${block(x, y, w, 46, fill)}<text x="${x + w / 2}" y="${y + 31}" text-anchor="middle" font-size="22" font-weight="800" fill="${INK}">${esc(label)}</text></g>`;

  const body = `
<g transform="translate(1010 96)"><g class="bob1"><circle r="48" fill="${SUN}" stroke="${INK}" stroke-width="5"/><circle r="48" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="4 12" transform="scale(1.35)" opacity=".5"/></g></g>
<g transform="translate(900 60)"><g class="bob2"><g class="spin"><rect x="-26" y="-26" width="52" height="52" rx="10" fill="${RED}" stroke="${INK}" stroke-width="5"/></g></g></g>
<g transform="translate(1110 250)"><g class="bob3"><g class="wob"><path d="M-30 24 L0 -30 L30 24 Z" fill="${MINT}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g></g></g>
<g transform="translate(890 292)"><g class="bob4"><g class="pulse"><circle r="22" fill="${PINK}" stroke="${INK}" stroke-width="5"/><circle r="7" fill="${INK}"/></g></g></g>
<g transform="translate(905 150)"><g class="bob2"><g class="wob">
<path d="M20 30 Q20 8 46 8 H112 Q138 8 138 30 L152 72 Q157 94 136 94 Q118 94 108 76 H50 Q40 94 22 94 Q1 94 6 72 Z" transform="translate(-76 -50)" fill="${GRAPE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M-38 -18 h10 v-10 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="30" cy="-16" r="8" fill="${SUN}" stroke="${INK}" stroke-width="3"/><circle cx="48" cy="-2" r="8" fill="${RED}" stroke="${INK}" stroke-width="3"/>
</g></g></g>
<g transform="translate(1135 70)"><g class="bob3"><g class="spin"><rect x="-22" y="-22" width="44" height="44" rx="9" fill="${PAPER}" stroke="${INK}" stroke-width="5"/><circle cx="-9" cy="-9" r="4" fill="${INK}"/><circle cx="9" cy="9" r="4" fill="${INK}"/><circle cx="0" cy="0" r="4" fill="${INK}"/></g></g></g>

<rect class="mark" x="60" y="176" width="708" height="26" fill="${SUN}"/>
<text class="b" x="64" y="190" font-size="84" fill="${RED}" textLength="700" lengthAdjust="spacingAndGlyphs">awesome-office-gg</text>
<text class="b" x="60" y="186" font-size="84" fill="${INK}" textLength="700" lengthAdjust="spacingAndGlyphs">awesome-office-gg</text>
<text x="62" y="244" font-size="34" font-weight="800" fill="${INK}">Games your team can play in one hour.</text>
<text class="m" x="62" y="288" font-size="20" fill="${INK}" opacity=".75">${main.length} free multiplayer games  /  ${Object.keys(CATEGORIES).length} genres  /  no sign-up, no install</text>
${pill(62, 40, 130, "FREE", MINT, "p1")}${pill(206, 40, 184, "≤ 1 HOUR", SKY, "p2")}${pill(404, 40, 214, "NO SIGN-UP", PINK, "p3")}${pill(632, 40, 150, "TAP & GO", SUN, "p4")}

<g clip-path="url(#hero-clip)">
<rect x="4" y="346" width="1188" height="66" fill="${INK}"/>
<g class="ticker"><text class="m" x="0" y="387" font-size="22" fill="${PAPER}" textLength="${stripW}" lengthAdjust="spacing" xml:space="preserve">${esc(strip)}</text><text class="m" x="${stripW}" y="387" font-size="22" fill="${PAPER}" textLength="${stripW}" lengthAdjust="spacing" xml:space="preserve">${esc(strip)}</text></g>
</g>`;

  return card({
    id: "hero",
    w: 1200,
    h: 420,
    title: "awesome-office-gg: games your team can play in one hour",
    desc: `Animated banner: floating game shapes above a scrolling ticker of ${main.length} free multiplayer games.`,
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// 2. The four checks
// ---------------------------------------------------------------------------
function criteria(): string {
  const css = `
.crit .c1{animation:cbob 3.4s ease-in-out infinite}
.crit .c2{animation:cbob 3.4s ease-in-out -.8s infinite}
.crit .c3{animation:cbob 3.4s ease-in-out -1.6s infinite}
.crit .c4{animation:cbob 3.4s ease-in-out -2.4s infinite}
.crit .hand{animation:cspin 6s linear infinite;transform-box:fill-box;transform-origin:bottom center}
.crit .coin{animation:cflip 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.crit .glow{animation:cglow 2.4s ease-in-out infinite}
.crit .rays{animation:cglow 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.crit .tap{animation:ctap 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes cbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes cspin{to{transform:rotate(360deg)}}
@keyframes cflip{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.15)}}
@keyframes cglow{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes ctap{0%,70%,100%{transform:scale(1)}80%{transform:scale(.8)}90%{transform:scale(1.1)}}`;

  const cardAt = (i: number, fill: string, big: string, l1: string, l2: string, icon: string) => {
    const x = 34 + i * 292;
    const y = 34;
    return `<g class="c${i + 1}">${block(x, y, 262, 236, fill)}
<g transform="translate(${x + 131} ${y + 74})">${icon}</g>
<text class="b" x="${x + 131}" y="${y + 150}" text-anchor="middle" font-size="40" fill="${INK}">${esc(big)}</text>
<text x="${x + 131}" y="${y + 184}" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${esc(l1)}</text>
<text x="${x + 131}" y="${y + 208}" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}">${esc(l2)}</text></g>`;
  };

  const clock = `<circle r="38" fill="${PAPER}" stroke="${INK}" stroke-width="5"/><path d="M0 -30 V-24 M30 0 H24 M0 30 V24 M-30 0 H-24" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><rect x="-3" y="-26" width="6" height="26" rx="3" fill="${INK}" class="hand"/><circle r="5" fill="${RED}" stroke="${INK}" stroke-width="3"/>`;
  const coin = `<g class="coin"><circle r="38" fill="${SUN}" stroke="${INK}" stroke-width="5"/><circle r="28" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="3 6"/><text class="b" y="13" text-anchor="middle" font-size="38" fill="${INK}">$</text></g>`;
  const bulb = `<g class="rays"><path d="M0 -58 V-48 M-44 -38 L-37 -31 M44 -38 L37 -31 M-52 2 H-42 M52 2 H42" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g><circle cy="-4" r="30" fill="${SUN}" stroke="${INK}" stroke-width="5"/><rect x="-14" y="24" width="28" height="16" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><path d="M-9 -4 L0 8 L9 -4" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const devices = `<rect x="-52" y="-34" width="70" height="52" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="5"/><path d="M-52 -20 H18" stroke="${INK}" stroke-width="4"/><circle cx="-43" cy="-27" r="2.5" fill="${INK}"/><g class="tap"><rect x="22" y="-24" width="32" height="58" rx="7" fill="${GRAPE}" stroke="${INK}" stroke-width="5"/><circle cx="38" cy="26" r="3" fill="${INK}"/></g>`;

  const body = `
${cardAt(0, SKY, "≤ 1 hour", "A full round fits", "inside the hour.", clock)}
${cardAt(1, MINT, "$0", "Free. No account,", "or just a nickname.", coin)}
${cardAt(2, SUN, "2 minutes", "Rules in a sentence", "or two.", bulb)}
${cardAt(3, PINK, "Tap & go", "Browser tab or", "phone app.", devices)}`;

  return card({
    id: "crit",
    w: 1200,
    h: 308,
    title: "Every game passes four checks",
    desc: "Round under one hour, free without an account, easy to learn, and plays in a browser or on a phone.",
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// 3. Genres
// ---------------------------------------------------------------------------
function genres(main: Game[]): string {
  const ids = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];
  const css = `
${ids.map((_, i) => `.gen .g${i}{animation:gbob 3.6s ease-in-out ${((i * 0.37) % 3.6).toFixed(2)}s infinite}`).join("\n")}
.gen .num{animation:gnum 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes gbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes gnum{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}`;
  const chips = ids
    .map((id, i) => {
      const n = main.filter((g) => g.categories.includes(id)).length;
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 30 + col * 292;
      const y = 30 + row * 104;
      const fill = at(PALETTE, col + row * 2);
      return `<g class="g${i}">${block(x, y, 262, 76, fill)}<text class="b" x="${x + 20}" y="${y + 46}" font-size="21" fill="${INK}"${fit(CATEGORIES[id], 21, 178, true)}>${esc(CATEGORIES[id])}</text><g class="num"><circle cx="${x + 224}" cy="${y + 38}" r="21" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><text class="b" x="${x + 224}" y="${y + 46}" text-anchor="middle" font-size="22" fill="${INK}">${n}</text></g></g>`;
    })
    .join("\n");
  return card({
    id: "gen",
    w: 1200,
    h: 356,
    title: `${ids.length} genres`,
    desc: `Games per genre on the main list: ${ids.map((id) => `${CATEGORIES[id]} ${main.filter((g) => g.categories.includes(id)).length}`).join(", ")}.`,
    css,
    body: chips,
  });
}

// ---------------------------------------------------------------------------
// 4. How a game hour works
// ---------------------------------------------------------------------------
function flow(): string {
  const css = `
.flow .dash{stroke-dasharray:14 12;animation:fdash 1.2s linear infinite}
.flow .s1{animation:fbob 3.2s ease-in-out infinite}
.flow .s2{animation:fbob 3.2s ease-in-out -1s infinite}
.flow .s3{animation:fbob 3.2s ease-in-out -2s infinite}
@keyframes fdash{to{stroke-dashoffset:-26}}
@keyframes fbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`;
  const step = (i: number, fill: string, n: string, l1: string, l2: string) => {
    const x = 40 + i * 392;
    return `<g class="s${i + 1}">${block(x, 50, 330, 150, fill)}<circle cx="${x + 46}" cy="${50 + 46}" r="26" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><text class="b" x="${x + 46}" y="${50 + 56}" text-anchor="middle" font-size="28" fill="${INK}">${n}</text><text class="b" x="${x + 90}" y="${50 + 56}" font-size="24" fill="${INK}"${fit(l1, 24, 216, true)}>${esc(l1)}</text><text x="${x + 28}" y="${50 + 114}" font-size="19" font-weight="700" fill="${INK}"${fit(l2, 19, 274)}>${esc(l2)}</text></g>`;
  };
  const body = `
<path class="dash" d="M372 126 H430" stroke="${INK}" stroke-width="6" fill="none"/>
<path class="dash" d="M764 126 H822" stroke="${INK}" stroke-width="6" fill="none"/>
<path d="M422 112 L440 126 L422 140 Z" fill="${INK}"/><path d="M814 112 L832 126 L814 140 Z" fill="${INK}"/>
${step(0, SUN, "1", "Pick a game", "Filter by genre or team size.")}
${step(1, SKY, "2", "Share the room", "Send the link to the team.")}
${step(2, MINT, "3", "Play for an hour", "Short rounds, quick rules.")}
<circle r="9" fill="${RED}" stroke="${INK}" stroke-width="3"><animateMotion dur="5s" repeatCount="indefinite" path="M60 232 H1136"/></circle>
<path d="M60 232 H1136" stroke="${INK}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" opacity=".5" fill="none"/>`;
  return card({
    id: "flow",
    w: 1200,
    h: 262,
    title: "How a game hour works",
    desc: "Pick a game, share the room link, play for an hour.",
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// 5. Hall of Fame
// ---------------------------------------------------------------------------
function hall(hof: Game[]): string {
  const css = `
.hof .tw1{animation:htw 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.hof .tw2{animation:htw 2.4s ease-in-out -.8s infinite;transform-box:fill-box;transform-origin:center}
.hof .tw3{animation:htw 2.4s ease-in-out -1.6s infinite;transform-box:fill-box;transform-origin:center}
.hof .cup{animation:hcup 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom center}
${hof.map((_, i) => `.hof .n${i}{animation:hpop 3.6s ease-in-out ${(i * 0.3).toFixed(1)}s infinite;transform-box:fill-box;transform-origin:center}`).join("\n")}
@keyframes htw{0%,100%{transform:scale(.4) rotate(0);opacity:.3}50%{transform:scale(1.1) rotate(45deg);opacity:1}}
@keyframes hcup{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes hpop{0%,100%{transform:scale(1)}10%{transform:scale(1.1)}20%{transform:scale(1)}}`;
  const star = (cls: string, x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y})"><path class="${cls}" d="M0 ${-s} Q${s * 0.18} ${-s * 0.18} ${s} 0 Q${s * 0.18} ${s * 0.18} 0 ${s} Q${-s * 0.18} ${s * 0.18} ${-s} 0 Q${-s * 0.18} ${-s * 0.18} 0 ${-s} Z" fill="${SUN}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
  // Size the chips so the whole row fits next to the trophy, however many games there are.
  const rowW = 880;
  const gap = 14;
  let fs = 19;
  const widths = (size: number) => hof.map((g) => Math.max(96, estWidth(g.name, size, false) + 36));
  while (fs > 13 && widths(fs).reduce((sum, w) => sum + w + gap, -gap) > rowW) fs -= 1;
  const ws = widths(fs);
  let x = 292;
  const chips = hof
    .map((g, i) => {
      const w = ws[i] ?? 96;
      const tw = estWidth(g.name, fs, false);
      const out = `<g class="n${i}">${block(x, 148, w, 46, at(PALETTE, i + 1))}<text x="${x + w / 2}" y="${148 + 30}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${INK}" textLength="${tw}" lengthAdjust="spacingAndGlyphs">${esc(g.name)}</text></g>`;
      x += w + gap;
      return out;
    })
    .join("\n");
  const body = `
<g transform="translate(130 120)"><g class="cup">
<path d="M-58 -64 H58 V-30 Q58 14 0 22 Q-58 14 -58 -30 Z" fill="${SUN}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
<path d="M-58 -50 H-84 Q-84 -8 -50 0 M58 -50 H84 Q84 -8 50 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<rect x="-12" y="22" width="24" height="28" fill="${SUN}" stroke="${INK}" stroke-width="6"/>
<rect x="-44" y="50" width="88" height="20" rx="4" fill="${RED}" stroke="${INK}" stroke-width="6"/>
<path d="M-30 -48 V-24" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>
</g></g>
${star("tw1", 232, 64, 20)}${star("tw2", 62, 76, 14)}${star("tw3", 212, 170, 12)}
<text class="b" x="290" y="86" font-size="52" fill="${INK}">Hall of Fame</text>
<text x="292" y="126" font-size="20" font-weight="700" fill="${INK}">Games we love that bend a rule: long matches, desktop-only, or a paid host.</text>
${chips}`;
  return card({
    id: "hof",
    w: 1200,
    h: 236,
    title: "Hall of Fame",
    desc: `Games that bend a rule: ${hof.map((g) => g.name).join(", ")}.`,
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// 6. Add a game: a typed JSON file, then the CI checks
// ---------------------------------------------------------------------------
function contribute(sample: Game): string {
  // One-line JSON with spaces inside braces and after commas/colons (never inside strings).
  const val = (v: unknown): string => {
    if (Array.isArray(v)) return `[${v.map(val).join(", ")}]`;
    if (v && typeof v === "object") return `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${val(x)}`).join(", ")} }`;
    return JSON.stringify(v);
  };
  const lines: string[] = [
    "{",
    `  "id": ${val(sample.id)},`,
    `  "name": ${val(sample.name)},`,
    `  "url": ${val(sample.url)},`,
    `  "description": ${val(sample.description.length > 46 ? sample.description.slice(0, 45).trimEnd() + "…" : sample.description)},`,
    `  "status": ${val(sample.status)},`,
    `  "categories": ${val(sample.categories)},`,
    `  "platforms": ${val(sample.platforms)},`,
    `  "players": ${val(sample.players)},`,
    `  "checks": ${val(sample.checks)},`,
    `  "privateRoom": ${val(sample.privateRoom)}`,
    "}",
  ];
  const cycle = 16;
  const per = 3.2; // % of the cycle between lines
  const start = 4;
  const lineCss = lines
    .map((_, i) => {
      const on = start + i * per;
      return `@keyframes tl${i}{0%,${on.toFixed(1)}%{opacity:0}${(on + 1.2).toFixed(1)}%,90%{opacity:1}96%,100%{opacity:0}}\n.add .l${i}{animation:tl${i} ${cycle}s linear infinite}`;
    })
    .join("\n");
  const checks = ["validate", "typecheck", "tests", "build"];
  const checkStart = start + lines.length * per + 4;
  const checkCss = checks
    .map((_, i) => {
      const on = checkStart + i * 3.2;
      return `@keyframes ck${i}{0%,${on.toFixed(1)}%{opacity:0;transform:translateX(-14px)}${(on + 1.6).toFixed(1)}%,90%{opacity:1;transform:translateX(0)}96%,100%{opacity:0}}\n.add .k${i}{animation:ck${i} ${cycle}s ease-out infinite}`;
    })
    .join("\n");
  const css = `
${lineCss}
${checkCss}
.add .cur{animation:acur 1s steps(1) infinite}
@keyframes acur{50%{opacity:0}}`;
  const textLines = lines
    .map((l, i) => {
      const keyMatch = l.match(/^(\s*)("[^"]+"):(.*)$/);
      const y = 118 + i * 24;
      if (!keyMatch) return `<text class="m l${i}" x="62" y="${y}" font-size="16" fill="${PAPER}">${esc(l)}</text>`;
      const ind = keyMatch[1] ?? "";
      const key = keyMatch[2] ?? "";
      const rest = keyMatch[3] ?? "";
      const dx = 62 + ind.length * 9.6;
      return `<text class="m l${i} " x="${dx}" y="${y}" font-size="16" xml:space="preserve"><tspan fill="${SKY}">${esc(key)}</tspan><tspan fill="${PAPER}">:</tspan><tspan fill="${SUN}">${esc(rest.replace(/^ ?/, " "))}</tspan></text>`;
    })
    .join("\n");
  const checkPills = checks
    .map((c, i) => `<g class="k${i}">${block(830, 70 + i * 62, 300, 46, at([MINT, SKY, SUN, PINK], i))}<text class="b" x="852" y="${70 + i * 62 + 31}" font-size="22" fill="${INK}">✓</text><text x="886" y="${70 + i * 62 + 31}" font-size="22" font-weight="800" fill="${INK}">${c}</text></g>`)
    .join("\n");
  const body = `
<rect x="46" y="46" width="740" height="${lines.length * 24 + 104}" rx="12" fill="${INK}" stroke="${INK}" stroke-width="4"/>
<rect x="46" y="46" width="740" height="40" rx="12" fill="#2b2635"/>
<circle cx="72" cy="66" r="7" fill="${RED}"/><circle cx="94" cy="66" r="7" fill="${SUN}"/><circle cx="116" cy="66" r="7" fill="${MINT}"/>
<text class="m" x="146" y="71" font-size="15" fill="${PAPER}" opacity=".7">data/games/${esc(sample.id)}.json</text>
${textLines}
<rect class="cur" x="${62 + 9.6}" y="${118 + lines.length * 24 - 15}" width="9" height="18" fill="${SUN}"/>
${checkPills}
<path d="M796 210 H818" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M812 198 L826 210 L812 222 Z" fill="${INK}"/>
<text class="b" x="830" y="${70 + 4 * 62 + 26}" font-size="22" fill="${INK}">One file. One PR.</text>`;
  return card({
    id: "add",
    w: 1200,
    h: lines.length * 24 + 154,
    title: "Add a game with one JSON file",
    desc: "A data/games JSON file is typed out line by line, then the CI checks validate, typecheck, tests and build tick green.",
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// Logo wall and stats (markdown fragments)
// ---------------------------------------------------------------------------
function logoWall(main: Game[]): string {
  // Games on a shared host (several live on the same site) would repeat one icon: keep the first.
  const seen = new Set<string>();
  const unique = main.filter((g) => {
    const key = logoUrl(g);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const imgs = unique
    .map(
      (g) =>
        `<a href="${esc(g.url)}"><img src="${esc(logoUrl(g))}" width="44" height="44" alt="${esc(g.name)}" title="${esc(g.name)}"></a>`,
    )
    .join("\n");
  return `<p align="center">\n${imgs}\n</p>`;
}

function stats(main: Game[], hof: Game[]): string {
  const genres = Object.keys(CATEGORIES).length;
  return `**${main.length} games** across **${genres} genres**, plus **${hof.length}** in the Hall of Fame.`;
}

// ---------------------------------------------------------------------------

export const ASSET_DIR = "docs/readme";

/** All generated SVGs, keyed by file name. */
export function buildReadmeSvgs(games: Game[]): Record<string, string> {
  const live = games.filter((g) => g.status !== "closed");
  const main = live.filter((g) => !g.hallOfFame);
  const hof = live.filter((g) => g.hallOfFame);
  const sample = games.find((g) => g.id === "agar-io") ?? main[0];
  if (!sample) throw new Error("buildReadmeSvgs needs at least one game");
  return {
    "hero.svg": hero(main),
    "checks.svg": criteria(),
    "genres.svg": genres(main),
    "how-it-works.svg": flow(),
    "hall-of-fame.svg": hall(hof),
    "add-a-game.svg": contribute(sample),
  };
}

/** Fragments spliced into README.md between `<!-- readme:NAME -->` markers. */
export function buildReadmeFragments(games: Game[]): Record<string, string> {
  const live = games.filter((g) => g.status !== "closed");
  const main = live.filter((g) => !g.hallOfFame);
  const hof = live.filter((g) => g.hallOfFame);
  return { logos: logoWall(main), stats: stats(main, hof) };
}

/** Replaces the content between each pair of markers; throws if a marker is missing. */
export function spliceFragments(readme: string, fragments: Record<string, string>): string {
  let out = readme;
  for (const [name, body] of Object.entries(fragments)) {
    const re = new RegExp(`(<!-- readme:${name} -->)[\\s\\S]*?(<!-- /readme:${name} -->)`);
    if (!re.test(out)) throw new Error(`README.md is missing the <!-- readme:${name} --> ... <!-- /readme:${name} --> markers`);
    out = out.replace(re, (_m, a: string, b: string) => `${a}\n${body}\n${b}`);
  }
  return out;
}
