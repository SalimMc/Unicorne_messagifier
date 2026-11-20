/**
 * Page wiring: loads data lazily, runs the converter and handles theme, intensity and copy.
 * @module app
 */
import { messagify, parseKaomoji, detectLang } from "./messagify.js";
import { PARTY_AT_CONVERSION, armDanceParty, startDanceParty } from "./easter-egg.js?v=10";

const $ = (id) => document.getElementById(id);
const els = {
  input: $("in"), output: $("out"), info: $("info"), go: $("go"),
  lang: $("lang"), reroll: $("reroll"), copy: $("copy"), theme: $("theme"), count: $("count"),
};
const levelInputs = document.querySelectorAll('input[name="level"]');

/** @type {import("./messagify.js").Context} */
const ctx = { langs: {}, kaomoji: {} };
let seed = 0;

// ---------- data ----------
const kaomojiReady = fetch("data/kaomoji.txt")
  .then((r) => r.text())
  .then((source) => { ctx.kaomoji = parseKaomoji(source); });

/** @param {string} lang */
async function loadLang(lang) {
  ctx.langs[lang] ??= await fetch(`data/${lang}.json`).then((r) => r.json());
}

// ---------- conversion ----------
const currentLevel = () => Number(document.querySelector('input[name="level"]:checked')?.value ?? 2);

/** @returns {Promise<boolean>} true when a message was converted */
async function convert() {
  const text = els.input.value;
  if (!text.trim()) {
    els.output.value = "";
    els.info.textContent = "";
    return false;
  }
  const lang = els.lang.value === "auto" ? detectLang(text) : els.lang.value;
  els.info.textContent = "⏳";
  try {
    await Promise.all([kaomojiReady, loadLang(lang)]);
    const result = messagify(text, ctx, { lang, intensity: currentLevel(), seed });
    els.output.value = result.text;
    els.output.scrollTop = 0;
    els.info.textContent = `· ${result.lang}`;
    return true;
  } catch (err) {
    els.info.textContent = "⚠️ could not load data";
    console.error(err);
    return false;
  }
}

/** Convert button: counts conversions and starts the dance party on the 5th one. */
let conversions = 0;
async function onConvertClick() {
  seed = 0;
  armDanceParty(); // prepares the sound chain during a real click so the party starts instantly
  if (await convert() && ++conversions === PARTY_AT_CONVERSION) startDanceParty();
}

// ---------- copy ----------
async function copyOutput() {
  if (!els.output.value) return;
  try {
    await navigator.clipboard.writeText(els.output.value);
  } catch {
    // fallback for browsers without the async clipboard API
    els.output.select();
    document.execCommand("copy");
    els.output.setSelectionRange(0, 0);
    els.output.blur();
  }
  els.copy.classList.add("copied"); // CSS swaps the copy icon for a check mark
  setTimeout(() => els.copy.classList.remove("copied"), 1400);
}

// ---------- theme (initial value is set by the inline script in index.html) ----------
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch { /* storage unavailable: theme lasts this visit only */ }
}

// ---------- character counter ----------
function updateCount() {
  const n = els.input.value.length;
  els.count.textContent = `${n} char${n === 1 ? "" : "s"}`;
}

// ---------- events ----------
els.go.addEventListener("click", onConvertClick);
els.reroll.addEventListener("click", () => { seed++; convert(); });
els.lang.addEventListener("change", convert);
levelInputs.forEach((input) => input.addEventListener("change", convert));
els.copy.addEventListener("click", copyOutput);
els.theme.addEventListener("click", toggleTheme);
els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    els.go.click();
  }
});
els.input.addEventListener("input", updateCount);
updateCount();
