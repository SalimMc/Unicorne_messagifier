/**
 * Markdown-aware line handling, so decorations never break the structure.
 * @module markdown
 */

/**
 * @typedef {object} MarkdownLine
 * @property {string} prefix  leading markup kept as-is ("# ", "- [x] ", "> ", "1. ")
 * @property {string} body    the text after the prefix
 * @property {boolean} isHeading
 * @property {boolean} isListItem
 */

const FENCE = /^\s*(```|~~~)/;
const LINE_PREFIX = /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+)?(?:\[[ xX]\]\s+)?)/;

/** Inline parts left untouched: `code`, [links](url), ![images](url), <html>, raw URLs, [x]. */
export const PROTECTED_INLINE = /(`[^`]*`|!?\[[^\]]*\]\([^)]*\)|<[^>]+>|https?:\/\/\S+|\[[ xX]\])/;

/**
 * Lines that must not be decorated: blank, horizontal rules, table separators, indented code.
 * @param {string} line
 */
function isUntouchable(line) {
  return !line.trim()
    || /^\s*([-*_]\s*){3,}$/.test(line)
    || /^\s*\|?\s*:?-{3,}/.test(line)
    || /^( {4}|\t)/.test(line);
}

/**
 * @param {string} line
 * @returns {MarkdownLine}
 */
export function parseLine(line) {
  const prefix = line.match(LINE_PREFIX)[1];
  return {
    prefix,
    body: line.slice(prefix.length),
    isHeading: prefix.includes("#"),
    isListItem: /[-*+]\s|\d[.)]\s/.test(prefix),
  };
}

/**
 * Applies `decorate` to every decoratable line, skipping fenced code blocks.
 * @param {string} text
 * @param {(line: MarkdownLine) => string} decorate
 * @returns {string}
 */
export function mapMarkdownLines(text, decorate) {
  let inFence = false;
  return text.split(/\r?\n/).map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return line;
    }
    return inFence || isUntouchable(line) ? line : decorate(parseLine(line));
  }).join("\n");
}

/**
 * Splits a line body into alternating [text, protected, text, …] segments.
 * @param {string} body
 * @returns {{ text: string, protected: boolean }[]}
 */
export function splitProtected(body) {
  return body.split(PROTECTED_INLINE).map((text, i) => ({ text, protected: i % 2 === 1 }));
}
