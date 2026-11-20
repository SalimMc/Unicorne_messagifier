// Quick manual check from the terminal.
// Usage: node tools/try.mjs ["your message"] [intensity 1-3]
import { messagify } from "../src/messagify.js";
import { loadContext } from "./load-context.mjs";

const SAMPLES = [
  "# My weekly update\n\nI finally fixed the bug in the payment code! The tests pass now.\n\n- added `docs/setup.md`\n- the cat ate my pizza again...\n- [x] deploy to production\n\nWhy is this so hard?",
  "Salut ! J'ai raté mon examen de maths, je suis vraiment triste. Mais ce soir on mange une pizza avec les amis et ça va être génial !!!",
  "Ahoj! Dnes jsem dostal peníze za práci, mám velkou radost. Ale moje kočka je nemocná a to je špatné.",
  "مرحبا! أنا سعيد جدا اليوم لأنني نجحت في الامتحان. القطة تأكل السمك.",
  "I hate this stupid printer!!! It never works.",
];

const [message, intensity = "2"] = process.argv.slice(2);
const ctx = loadContext();
for (const text of message ? [message] : SAMPLES) {
  const result = messagify(text, ctx, { intensity: Number(intensity) });
  console.log(`--- [${result.lang}]\n${result.text}\n`);
}
