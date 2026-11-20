/**
 * Kaomoji table loading and picking.
 * @module kaomoji
 */
import { pickFrom } from "./text.js";

/** @typedef {Record<string, string[]>} KaomojiTable category -> kaomojis */

/**
 * Parses data/kaomoji.txt: a "# name" line starts a category, then one kaomoji per line.
 * Comment lines ("# some text") and blank lines are ignored.
 * @param {string} source
 * @returns {KaomojiTable}
 */
export function parseKaomoji(source) {
  /** @type {KaomojiTable} */
  const table = {};
  let category = null;
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    const header = line.match(/^# (\w+)$/);
    if (header) {
      category = header[1];
      table[category] = [];
    } else if (line && category && !line.startsWith("# ")) {
      table[category].push(line);
    }
  }
  return table;
}

/** Picks kaomojis by category, avoiding repeats within one message. */
export class KaomojiPicker {
  /**
   * @param {KaomojiTable} table
   * @param {() => number} rand
   */
  constructor(table, rand) {
    this.table = table;
    this.rand = rand;
    this.used = new Set();
  }

  /**
   * @param {string} category falls back to "joy" when unknown or empty
   * @returns {string}
   */
  pick(category) {
    const list = this.table[category]?.length ? this.table[category] : (this.table.joy ?? ["(^_^)"]);
    const fresh = list.filter((k) => !this.used.has(k));
    const kaomoji = pickFrom(this.rand, fresh.length ? fresh : list);
    this.used.add(kaomoji);
    return kaomoji;
  }
}
