/**
 * Unicorne Messagifier: turns a plain text or markdown message into an emoji + kaomoji version.
 * Runs fully offline with Unicode CLDR emoji keywords and the NRC Emotion Lexicon (see data/).
 * @module messagify
 */
import { createRng, detectLang, hashString } from "./text.js";
import { KaomojiPicker } from "./kaomoji.js";
import { mapMarkdownLines } from "./markdown.js";
import { Decorator } from "./decorator.js";

export { detectLang } from "./text.js";
export { parseKaomoji } from "./kaomoji.js";

/** Supported languages; each has a data/<lang>.json file. */
export const LANGS = ["en", "fr", "cs", "ar"];

/** @type {Record<number, import("./decorator.js").Level>} 1 = subtle, 2 = normal, 3 = chaos */
export const LEVELS = {
  1: { wordEmojiChance: 0.35, maxWordEmojis: 1, kaomojiChance: 0.45, emotionEmojis: [0, 1] },
  2: { wordEmojiChance: 0.7, maxWordEmojis: 2, kaomojiChance: 0.8, emotionEmojis: [1, 2] },
  3: { wordEmojiChance: 1, maxWordEmojis: 4, kaomojiChance: 1, emotionEmojis: [1, 3] },
};

/**
 * @typedef {object} Context
 * @property {Record<string, import("./decorator.js").LangData>} langs  loaded language data, by code
 * @property {import("./kaomoji.js").KaomojiTable} kaomoji
 */

/**
 * Converts a message. Same text + options + seed always gives the same result.
 * @param {string} text
 * @param {Context} ctx
 * @param {object} [options]
 * @param {string} [options.lang="auto"]  "auto" or one of {@link LANGS}
 * @param {1 | 2 | 3} [options.intensity=2]
 * @param {number} [options.seed=0]  change it to get another variant
 * @returns {{ text: string, lang: string }}
 */
export function messagify(text, ctx, { lang = "auto", intensity = 2, seed = 0 } = {}) {
  const language = lang === "auto" ? detectLang(text) : lang;
  const rand = createRng(hashString(text) + seed);
  const decorator = new Decorator({
    data: ctx.langs[language] ?? { e: {}, m: {} },
    lang: language,
    level: LEVELS[intensity] ?? LEVELS[2],
    rand,
    kaomoji: new KaomojiPicker(ctx.kaomoji, rand),
  });
  return { text: mapMarkdownLines(text, (line) => decorator.line(line)), lang: language };
}
