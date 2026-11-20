/**
 * Page wiring: loads data lazily, runs the converter and handles the buttons.
 * @module app
 */
import { messagify, parseKaomoji, detectLang } from "./messagify.js";

const $ = (id) => document.getElementById(id);
const els = {
  input: $("in"), output: $("out"), info: $("info"), go: $("go"),
  lang: $("lang"), level: $("level"), reroll: $("reroll"), copy: $("copy"),
};

/** @type {import("./messagify.js").Context} */
const ctx = { langs: {}, kaomoji: {} };
let seed = 0;

const kaomojiReady = fetch("data/kaomoji.txt")
  .then((r) => r.text())
  .then((source) => { ctx.kaomoji = parseKaomoji(source); });

/** @param {string} lang */
async function loadLang(lang) {
  ctx.langs[lang] ??= await fetch(`data/${lang}.json`).then((r) => r.json());
}

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
    const result = messagify(text, ctx, { lang, intensity: Number(els.level.value), seed });
    els.output.value = result.text;
    els.info.textContent = `langue : ${result.lang}`;
  } catch (err) {
    els.info.textContent = "⚠️ erreur de chargement des données";
    console.error(err);
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(els.output.value);
  } catch {
    els.output.select();
    document.execCommand("copy");
  }
  els.copy.textContent = "✅ Copié !";
  setTimeout(() => { els.copy.textContent = "📋 Copier"; }, 1200);
}

els.go.addEventListener("click", () => { seed = 0; convert(); });
els.reroll.addEventListener("click", () => { seed++; convert(); });
els.level.addEventListener("change", convert);
els.lang.addEventListener("change", convert);
els.copy.addEventListener("click", copyOutput);
els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    els.go.click();
  }
});
