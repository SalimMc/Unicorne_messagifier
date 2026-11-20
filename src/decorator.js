/**
 * Decorates text line by line: an emoji after recognized words, then a kaomoji and
 * emotion emojis at the end of each sentence.
 * @module decorator
 */
import { normalize, isArabic, wordCandidates } from "./text.js";
import { STOPWORDS, NEGATORS, EMOJI_FIXES, topicOfWord, topicOfEmoji } from "./lexicon.js";
import { Sentence } from "./emotion.js";
import { splitProtected } from "./markdown.js";

/** A word (letters/digits, optional elision like l'examen) or sentence-ending punctuation. */
const TOKEN = /([\p{L}\p{M}\p{N}]+(?:['’]\p{L}+)?)|([.!?…]+)(?=\s|$|\*|_|\))/gu;

/**
 * @typedef {object} Level
 * @property {number} wordEmojiChance  probability to add an emoji after a recognized word
 * @property {number} maxWordEmojis    max word emojis per sentence
 * @property {number} kaomojiChance    probability to add a kaomoji at a sentence end
 * @property {[number, number]} emotionEmojis  min/max emotion emojis per sentence
 */

/** @typedef {{ e: Record<string, string[]>, m: Record<string, string> }} LangData */

export class Decorator {
  /**
   * @param {object} options
   * @param {LangData} options.data   emoji (e) and emotion (m) dictionaries of the language
   * @param {string} options.lang
   * @param {Level} options.level
   * @param {() => number} options.rand
   * @param {import("./kaomoji.js").KaomojiPicker} options.kaomoji
   */
  constructor({ data, lang, level, rand, kaomoji }) {
    Object.assign(this, { data, lang, level, rand, kaomoji });
    this.sentence = new Sentence();
    this.lineFirstEmoji = null;
  }

  /**
   * @param {import("./markdown.js").MarkdownLine} line
   * @returns {string}
   */
  line({ prefix, body, isHeading, isListItem }) {
    this.sentence = new Sentence();
    this.lineFirstEmoji = null;
    let out = splitProtected(body).map((s) => (s.protected ? s.text : this.text(s.text))).join("");

    const trailing = out.match(/\s*$/)[0];
    out = out.slice(0, out.length - trailing.length);
    // a line without final punctuation still ends its sentence
    out += this.sentenceEnd("", !isListItem || this.rand() < 0.5);

    let head = prefix;
    if (isHeading && this.level.kaomojiChance >= 0.8) {
      head += this.kaomoji.pick(this.sentence.category("", this.rand)) + " ";
    } else if (isListItem && this.lineFirstEmoji && this.rand() < 0.6) {
      head += this.lineFirstEmoji + " ";
    }
    return head + out + trailing;
  }

  /**
   * @param {string} text plain text (no protected markdown inside)
   * @returns {string}
   */
  text(text) {
    let out = "";
    let last = 0;
    for (const match of text.matchAll(TOKEN)) {
      out += text.slice(last, match.index);
      last = match.index + match[0].length;
      if (match[1]) {
        out += match[1].split(/(['’])/).map((part) => (/['’]/.test(part) ? part : this.word(part))).join("");
      } else {
        out += match[2] + this.sentenceEnd(match[2]);
        this.sentence = new Sentence();
      }
    }
    return out + text.slice(last);
  }

  /**
   * Records the word's emotion/topic and maybe appends its emoji.
   * @param {string} word
   * @returns {string}
   */
  word(word) {
    const s = this.sentence;
    const w = normalize(word);
    const afterNegator = s.negated;
    s.wordCount++;
    s.negated = NEGATORS.has(w);
    s.hasNegation ||= s.negated;
    s.setTopic(topicOfWord(w));
    if (STOPWORDS.has(w) || (w.length < 3 && !isArabic(w))) return word;

    const candidates = wordCandidates(w, this.lang);
    const codes = this.lookup(this.data.m, candidates);
    if (codes) s.addEmotions(codes, afterNegator);

    const emoji = this.emojiFor(candidates);
    if (!emoji) return word;
    s.usedEmojis.add(emoji);
    s.emojiCount++;
    s.setTopic(topicOfEmoji(emoji));
    this.lineFirstEmoji ??= emoji;
    return `${word} ${emoji}`;
  }

  /**
   * @param {string[]} candidates
   * @returns {string | null}
   */
  emojiFor(candidates) {
    const s = this.sentence;
    if (s.emojiCount >= this.level.maxWordEmojis || this.rand() > this.level.wordEmojiChance) return null;
    const fixed = candidates.find((c) => EMOJI_FIXES.has(c));
    const options = fixed !== undefined ? EMOJI_FIXES.get(fixed) : this.lookup(this.data.e, candidates);
    return options?.find((e) => !s.usedEmojis.has(e)) ?? null;
  }

  /**
   * @template T
   * @param {Record<string, T>} dict
   * @param {string[]} candidates
   * @returns {T | null}
   */
  lookup(dict, candidates) {
    for (const c of candidates) if (Object.hasOwn(dict, c)) return dict[c];
    return null;
  }

  /**
   * Kaomoji + emotion emojis for the current sentence ("" if it has no words).
   * @param {string} punct ending punctuation
   * @param {boolean} [withKaomoji]
   * @returns {string}
   */
  sentenceEnd(punct, withKaomoji = true) {
    const s = this.sentence;
    if (!s.wordCount) return "";
    const category = s.category(punct, this.rand);
    const parts = [];
    if (withKaomoji && this.rand() < this.level.kaomojiChance) parts.push(this.kaomoji.pick(category));
    const emojis = s.emotionEmojis(category, this.level.emotionEmojis, this.rand);
    if (emojis) parts.push(emojis);
    return parts.length ? " " + parts.join(" ") : "";
  }
}
