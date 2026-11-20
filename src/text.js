/**
 * Small text utilities: normalization, language detection, word stemming and a seeded RNG.
 * @module text
 */

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u0640]/g;
const LATIN_COMBINING_MARKS = /[\u0300-\u036F]/g;
const ARABIC_CHAR = /[\u0600-\u06FF]/;

/**
 * Normalizes a word for dictionary lookups: lowercase, no accents, unified Arabic letters.
 * Must stay in sync with `norm()` in tools/build_data.py.
 * @param {string} word
 * @returns {string}
 */
export function normalize(word) {
  return word.toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي")
    .normalize("NFD").replace(LATIN_COMBINING_MARKS, "").normalize("NFC");
}

/** @param {string} word */
export const isArabic = (word) => ARABIC_CHAR.test(word);

/**
 * FNV-1a string hash, used to seed the RNG so the same input gives the same output.
 * @param {string} text
 * @returns {number}
 */
export function hashString(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

/**
 * Creates a deterministic pseudo-random generator (mulberry32).
 * @param {number} seed
 * @returns {() => number} function returning a float in [0, 1)
 */
export function createRng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @template T
 * @param {() => number} rand
 * @param {T[]} items
 * @returns {T}
 */
export const pickFrom = (rand, items) => items[Math.floor(rand() * items.length)];

const STOPWORD_HINTS = {
  en: "the and is are to of you it in for with this that was i my not have be what",
  fr: "le la les des est et un une je tu pas que de du pour avec ce qui sur il elle mais très",
  cs: "je se na to ze jsem a v ale neni jak co ja ty by uz tak",
};

/**
 * Guesses the language of a text: Arabic script, Czech-only letters, then common-word counts.
 * @param {string} text
 * @returns {"en" | "fr" | "cs" | "ar"}
 */
export function detectLang(text) {
  if (ARABIC_CHAR.test(text)) return "ar";
  if (/[ěščřžůťďň]/i.test(text)) return "cs";
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  const scores = Object.fromEntries(Object.entries(STOPWORD_HINTS).map(([lang, hints]) => {
    const set = new Set(hints.split(" "));
    return [lang, words.filter((w) => set.has(w)).length];
  }));
  if (/[àâçéèêëîïôûùüÿœ]/i.test(text)) scores.fr += 2;
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

const AR_PREFIXES = ["وال", "بال", "فال", "كال", "لل", "ال", "و", "ب", "ل", "ف"];
const AR_SUFFIXES = ["ات", "ين", "ون", "ها", "ة", "ي"];

/**
 * Returns the word plus naive "stems" to try in the dictionaries, most specific first.
 * Latin languages: drop up to 3 trailing letters ("pizzas" -> "pizza").
 * Arabic: strip one common prefix (ال, و, ب…) and suffix (ة, ات…).
 * @param {string} word normalized word
 * @param {string} lang
 * @returns {string[]}
 */
export function wordCandidates(word, lang) {
  const out = [word];
  if (lang !== "ar") {
    for (let k = 1; k <= 3 && word.length - k >= 4; k++) out.push(word.slice(0, -k));
    return out;
  }
  const prefix = AR_PREFIXES.find((p) => word.startsWith(p) && word.length - p.length >= 2);
  if (prefix) out.push(word.slice(prefix.length));
  for (const base of [...out]) {
    for (const s of AR_SUFFIXES) {
      if (base.endsWith(s) && base.length - s.length >= 2) out.push(base.slice(0, -s.length));
    }
  }
  return out;
}
