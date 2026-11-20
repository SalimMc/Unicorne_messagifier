import { test } from "node:test";
import assert from "node:assert/strict";
import { messagify, detectLang, parseKaomoji } from "../src/messagify.js";
import { normalize, wordCandidates } from "../src/text.js";
import { loadContext } from "../tools/load-context.mjs";

const ctx = loadContext();
const run = (text, opts) => messagify(text, ctx, { intensity: 3, ...opts }).text;

test("detects the four languages", () => {
  assert.equal(detectLang("I think this is the best day"), "en");
  assert.equal(detectLang("Je pense que c'est très bien"), "fr");
  assert.equal(detectLang("Dnes je krásný den, těším se"), "cs");
  assert.equal(detectLang("أنا سعيد جدا"), "ar");
});

test("normalize removes accents and unifies Arabic letters", () => {
  assert.equal(normalize("Kočka"), "kocka");
  assert.equal(normalize("أحب"), "احب");
});

test("wordCandidates strips plural endings and Arabic articles", () => {
  assert.ok(wordCandidates("pizzas", "en").includes("pizza"));
  assert.ok(wordCandidates("القطة", "ar").includes("قط"));
});

test("adds an emoji right after a recognized word", () => {
  assert.match(run("I want pizza."), /pizza 🍕/);
  assert.match(run("Moje kočka spí."), /kočka 🐈/);
});

test("keeps markdown structure intact", () => {
  const text = "# Title\n\n```js\nconst pizza = 1;\n```\n\n- [x] see [the pizza docs](https://ex.com/pizza) and `pizza()`";
  const out = run(text);
  assert.ok(out.startsWith("# "));
  assert.ok(out.includes("```js\nconst pizza = 1;\n```"));
  assert.ok(out.includes("[the pizza docs](https://ex.com/pizza)"));
  assert.ok(out.includes("`pizza()`"));
  assert.ok(out.includes("- [x] "));
});

test("is deterministic for a given seed and varies with another seed", () => {
  const text = "What a great day! I love my friends.";
  assert.equal(run(text), run(text));
  const variants = new Set([0, 1, 2, 3].map((seed) => run(text, { seed })));
  assert.ok(variants.size > 1);
});

test("angry sentences with !!! flip tables", () => {
  assert.match(run("I hate this stupid printer!!!"), /┻/);
});

test("parseKaomoji reads categories and ignores comments", () => {
  const table = parseKaomoji("# A comment line\n# joy\n(^_^)\n\n# sad\n(T_T)\n");
  assert.deepEqual(table, { joy: ["(^_^)"], sad: ["(T_T)"] });
});
