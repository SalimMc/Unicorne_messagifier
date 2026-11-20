# 🦄 Unicorne Messagifier ✨ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

Paste a message (plain text or markdown) ➜ get it back full of emojis and kaomojis that match the text.
Works in 🇬🇧 English, 🇫🇷 French, 🇨🇿 Czech and 🇸🇦 Arabic (Modern Standard). Free, no server, no AI: everything runs in the browser.

## How it works

1. **Word emojis**: each word is looked up in the official Unicode CLDR emoji keywords of its language
   (`pizza` ➜ 🍕, `kočka` ➜ 🐈), with naive stemming (`pizzas` ➜ `pizza`, `القطة` ➜ `قط`).
2. **Sentence emotion**: words are scored with the NRC Emotion Lexicon (joy, sadness, anger, fear, surprise…),
   combined with punctuation (`!!!`, `?`, `...`), negations ("not happy") and topics (greetings, food, sleep, animals…).
3. **Decoration**: a kaomoji from the matching category plus emotion emojis are added at the end of each sentence/heading.
4. **Markdown-safe**: headings, lists, checkboxes, links, `inline code` and code blocks are never broken.

## Project layout

```
index.html            page markup
css/style.css         page styles (light + dark)
src/
  app.js              UI wiring: lazy data loading, buttons, copy
  messagify.js        public API: messagify(), intensity LEVELS, LANGS
  decorator.js        per-line / per-sentence / per-word decoration
  emotion.js          Sentence state, emotion -> kaomoji category, emotion emojis
  kaomoji.js          kaomoji table parser and picker
  lexicon.js          hand-written lists: stopwords, negators, topics, emoji fixes
  markdown.js         markdown line parsing and protected inline parts
  text.js             normalization, language detection, stemming, seeded RNG
data/
  kaomoji.txt         kaomojis grouped by category (edit freely)
  {en,fr,cs,ar}.json  generated: word -> emojis ("e"), word -> NRC emotion codes ("m")
tools/
  build_data.py       regenerates data/*.json from the raw sources
  try.mjs             try the converter in a terminal
  load-context.mjs    loads data/ from disk for Node.js
test/                 unit tests (node:test, no dependencies)
```

## Usage

```
npm start          # serve on http://localhost:8790 (needs Python)
npm test           # run unit tests (Node 20+)
npm run try -- "I love pizza!" 3
```

```js
import { messagify } from "./src/messagify.js";
messagify("I love pizza!", ctx, { lang: "auto", intensity: 2, seed: 0 });
// -> { text: "I love pizza 🍕! (♡°▽°♡) 💕😍", lang: "en" }
```

Intensity: `1` subtle, `2` normal, `3` chaos. The output is deterministic for a given `seed`.

### Tweaking results

- Wrong emoji for a word: add it to `EMOJI_FIXES_RAW` in `src/lexicon.js` (`""` removes the emoji).
- More kaomojis: add lines under a `# category` in `data/kaomoji.txt`.
- New topic: add stems to `TOPIC_STEMS` in `src/lexicon.js` with a kaomoji category of the same name.

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` runs the tests on every push and pull request, then deploys
`index.html`, `css/`, `src/` and `data/` from `main`.
One-time setup on GitHub: **Settings ➜ Pages ➜ Source: GitHub Actions**.
The site is then served at `https://<user>.github.io/<repo>/`.

## Regenerating the data (optional)

Download into a `raw/` folder (git-ignored):
- `cldr_<lang>.json` from
  `https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/<lang>/annotations.json`
- `French-NRC-EmoLex.txt`, `Czech-NRC-EmoLex.txt`, `Arabic-NRC-EmoLex.txt` from the `OneFilePerLanguage/` folder of
  https://saifmohammad.com/WebDocs/Lexicons/NRC-Emotion-Lexicon.zip

then run `npm run build-data`.

## Data licenses

- Emoji keywords: [Unicode CLDR](https://cldr.unicode.org/) (Unicode license).
- Emotions: [NRC Emotion Lexicon](https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm) by Saif M. Mohammad,
  **free for non-commercial / research use only**.
