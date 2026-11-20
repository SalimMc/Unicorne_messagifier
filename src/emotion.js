/**
 * Sentence-level emotion: accumulates NRC emotion codes and picks a kaomoji category.
 * @module emotion
 */
import { pickFrom } from "./text.js";

/** Emojis added next to the kaomoji, per category. */
export const CATEGORY_EMOJIS = {
  joy: "😄 😊 ✨ 🌸 😁 🌈", excited: "🎉 🔥 🚀 ✨ 🥳 💥", love: "❤️ 💕 😍 🥰 💖", kiss: "😘 💋 💕",
  hug: "🫂 🤗 💞", shy: "😳 🙈 👉👈", cool: "😎 ✌️ 🆒", wink: "😉 😜", smug: "😏 😈 🤭", magic: "✨ 🌟 💫",
  sad: "😢 😞 💔 🥀", cry: "😭 💧 😿", angry: "😡 💢 🤬", tableflip: "💢 😤 🔥", unflip: "🙏 😌",
  disapprove: "😒 🙄 😑", surprise: "😲 😮 🤯 ⁉️", confused: "🤔 ❓ 😵‍💫", shrug: "🤷 😐",
  nervous: "😅 😬 😰", determined: "💪 🔥 🎯", hello: "👋 😃", bye: "👋 🫡", thanks: "🙏 💐",
  dance: "🎶 💃 🕺 🎵", sleepy: "😴 💤 🛌", eat: "😋 🍽️ 🤤", money: "💰 🤑 💸", write: "📝 ✍️",
  cat: "🐱 🐾", rabbit: "🐰 🥕", bear: "🐻 🧸", dog: "🐶 🐾", pig: "🐷 🐽", fish: "🐟 🐠", bird: "🐦 🐤",
  ghost: "👻 👀",
};

/** Categories used when a sentence carries no clear emotion. */
const NEUTRAL = ["joy", "cool", "wink", "magic", "smug"];

/** NRC codes swapped when the previous word is a negator ("not happy" -> sad). */
const NEGATED = { j: "s", s: "j", "+": "-", "-": "+" };

/**
 * State of the sentence being decorated.
 * NRC codes: a=anger n=anticipation d=disgust f=fear j=joy s=sadness u=surprise t=trust +=positive -=negative
 */
export class Sentence {
  constructor() {
    this.wordCount = 0;
    /** @type {Record<string, number>} */
    this.codes = {};
    /** @type {string | null} */
    this.topic = null;
    this.negated = false;      // previous word was a negator
    this.hasNegation = false;  // any negator in the sentence
    this.emojiCount = 0;
    this.usedEmojis = new Set();
  }

  /** @param {string} topic sets the topic only if none yet */
  setTopic(topic) {
    if (topic && !this.topic) this.topic = topic;
  }

  /**
   * @param {string} codes NRC codes of the word, e.g. "j+t"
   * @param {boolean} negated true if the word follows a negator
   */
  addEmotions(codes, negated) {
    for (let c of codes) {
      if (negated) c = NEGATED[c] ?? c;
      this.codes[c] = (this.codes[c] ?? 0) + 1;
    }
  }

  /**
   * Chooses the kaomoji category from emotions, topic and ending punctuation.
   * @param {string} punct sentence ending, e.g. "!!!", "?", "..." or ""
   * @param {() => number} rand
   * @returns {string}
   */
  category(punct, rand) {
    const g = (code) => this.codes[code] ?? 0;
    const bangs = (punct.match(/!/g) ?? []).length;
    const scores = {
      joy: g("j") + 0.5 * g("+") + 0.3 * g("t"),
      sad: g("s"),
      angry: g("a") * (bangs ? 1.5 : 1), // "!!!" sounds angrier than sad
      disapprove: g("d"),
      nervous: g("f"),
      surprise: g("u"),
      determined: 0.6 * g("n"),
    };
    let [top, strength] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (top === "angry") strength = g("a");

    const strongNegative = strength >= 2 && (top === "sad" || top === "angry");
    if (this.topic && !strongNegative) return this.topic;
    if (punct.includes("?") && strength < 1) return pickFrom(rand, ["confused", "confused", "shrug"]);
    if (strength < 0.5) {
      if (/\.\.\.|…/.test(punct)) return pickFrom(rand, ["shrug", "nervous", "sleepy"]);
      if (g("-") > 0 || this.hasNegation) return pickFrom(rand, ["sad", "disapprove", "nervous", "shrug"]);
      return bangs ? "excited" : pickFrom(rand, NEUTRAL);
    }
    if (top === "angry") return bangs >= 2 || strength >= 2 ? "tableflip" : "angry";
    if (top === "sad") return bangs || strength >= 2 ? "cry" : "sad";
    if (top === "joy") return bangs ? "excited" : pickFrom(rand, ["joy", "joy", "cool", "wink", "magic"]);
    return top;
  }

  /**
   * Builds 0..n emotion emojis for a category, sometimes repeated ("💪💪💪").
   * @param {string} category
   * @param {[number, number]} range min and max count
   * @param {() => number} rand
   * @returns {string}
   */
  emotionEmojis(category, [min, max], rand) {
    const all = (CATEGORY_EMOJIS[category] ?? CATEGORY_EMOJIS.joy).split(" ");
    const fresh = all.filter((e) => !this.usedEmojis.has(e));
    const list = fresh.length ? fresh : all;
    const count = min + Math.floor(rand() * (max - min + 1));
    if (count === 0) return "";
    const first = pickFrom(rand, list);
    if (count >= 2 && rand() < 0.5) return first.repeat(count);
    const out = [first];
    while (out.length < count) out.push(pickFrom(rand, list));
    return out.join("");
  }
}
