import { suggestIssueUrl } from "../lib/format";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

const cards = $$(".card");
const state = { cat: "all", plat: "all", status: "all", q: "", n: 0 };

function matches(el: HTMLElement): boolean {
  const cats = (el.dataset.cats ?? "").split(" ");
  const plats = (el.dataset.plats ?? "").split(" ");
  const min = Number(el.dataset.min);
  const max = Number(el.dataset.max);
  return (
    (state.cat === "all" || cats.includes(state.cat)) &&
    (state.plat === "all" || plats.includes(state.plat)) &&
    (state.status === "all" || el.dataset.status === state.status) &&
    (el.dataset.text ?? "").includes(state.q) &&
    (!state.n || (min <= state.n && state.n <= max))
  );
}

function apply() {
  let main = 0;
  let hof = 0;
  for (const el of cards) {
    const show = matches(el);
    el.hidden = !show;
    if (show) (el.closest("#hof") ? hof++ : main++);
  }
  const hofSection = $("#hof");
  if (hofSection) hofSection.hidden = hof === 0;
  const count = $("#count");
  if (count) {
    count.textContent =
      `${main} game${main === 1 ? "" : "s"}` +
      (state.n ? ` for ${state.n} players` : "") +
      (hof ? ` + ${hof} in the Hall of Fame` : "");
  }
  const empty = $("#empty");
  if (empty) empty.hidden = main + hof > 0;
}

for (const btn of $$<HTMLButtonElement>("button[data-group]")) {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group as "cat" | "plat" | "status";
    state[group] = btn.dataset.value ?? "all";
    for (const b of $$<HTMLButtonElement>(`button[data-group="${group}"]`)) {
      b.setAttribute("aria-pressed", String(b === btn));
    }
    apply();
  });
}
$<HTMLInputElement>("#q")?.addEventListener("input", (e) => {
  state.q = (e.target as HTMLInputElement).value.trim().toLowerCase();
  apply();
});
$<HTMLInputElement>("#n")?.addEventListener("input", (e) => {
  state.n = parseInt((e.target as HTMLInputElement).value, 10) || 0;
  apply();
});
apply();

// "Suggest a game" form: builds a prefilled GitHub issue link (no data is sent anywhere else).
const link = $<HTMLAnchorElement>("#sg-link");
if (link) {
  const repo = link.dataset.repo ?? "";
  const labels = ["round under an hour", "free, no account", "rules in two minutes", "browser or phone"];
  const update = () => {
    const ticked = $$<HTMLInputElement>(".sg-check").map((c, i) => `- [${c.checked ? "x" : " "}] ${labels[i]}`);
    link.href = suggestIssueUrl(repo, {
      name: $<HTMLInputElement>("#sg-name")?.value.trim(),
      url: $<HTMLInputElement>("#sg-url")?.value.trim(),
      players: $<HTMLInputElement>("#sg-players")?.value.trim(),
      notes: `Self-check:\n${ticked.join("\n")}`,
    });
  };
  for (const el of $$("#sg-name, #sg-url, #sg-players, .sg-check")) el.addEventListener("input", update);
  update();
}
