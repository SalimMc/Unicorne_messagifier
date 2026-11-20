// Loads the converter data from disk (Node.js counterpart of the fetches in src/app.js).
import { readFileSync } from "node:fs";
import { LANGS, parseKaomoji } from "../src/messagify.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

/** @returns {import("../src/messagify.js").Context} */
export function loadContext() {
  return {
    kaomoji: parseKaomoji(read("data/kaomoji.txt")),
    langs: Object.fromEntries(LANGS.map((lang) => [lang, JSON.parse(read(`data/${lang}.json`))])),
  };
}
