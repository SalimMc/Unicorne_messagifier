/**
 * Page wiring: loads data lazily, runs the converter and handles theme, intensity and copy.
 * @module app
 */
import { messagify, parseKaomoji, detectLang } from "./messagify.js";

const $ = (id) => document.getElementById(id);
const els = {
  input: $("in"), output: $("out"), info: $("info"), go: $("go"),
  lang: $("lang"), reroll: $("reroll"), copy: $("copy"), theme: $("theme"),
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

async function convert() {
  const text = els.input.value;
  if (!text.trim()) {
    els.output.value = "";
    els.info.textContent = "";
    return;
  }
  const lang = els.lang.value === "auto" ? detectLang(text) : els.lang.value;
  els.info.textContent = "⏳";
  try {
    await Promise.all([kaomojiReady, loadLang(lang)]);
    const result = messagify(text, ctx, { lang, intensity: currentLevel(), seed });
    els.output.value = result.text;
    els.output.scrollTop = 0;
    els.info.textContent = `· ${result.lang}`;
  } catch (err) {
    els.info.textContent = "⚠️ could not load data";
    console.error(err);
  }
}

// ---------- copy ----------
async function copyOutput() {
  if (!els.output.value) return;
  try {
    await navigator.clipboard.writeText(els.output.value);
  } catch {
    els.output.select();
    document.execCommand("copy");
  }
  els.copy.textContent = "✅";
  els.copy.classList.add("done");
  setTimeout(() => {
    els.copy.textContent = "📋";
    els.copy.classList.remove("done");
  }, 1200);
}

// ---------- theme ----------
const isDark = () => {
  const forced = document.documentElement.dataset.theme;
  return forced ? forced === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};
const syncThemeIcon = () => { els.theme.textContent = isDark() ? "☀️" : "🌙"; };

function toggleTheme() {
  const next = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch { /* storage unavailable: theme lasts this visit only */ }
  syncThemeIcon();
}

// ---------- events ----------
els.go.addEventListener("click", () => { seed = 0; convert(); });
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
syncThemeIcon();
