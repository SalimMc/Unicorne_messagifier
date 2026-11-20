<p align="center">
  <img src="https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif" width="480" alt="Animals dancing">
</p>

<h1 align="center">🦄 Unicorne Messagifier ✨</h1>

<p align="center">
  Turn boring messages into sparkly ones full of emojis and kaomojis (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
</p>

<p align="center">
  <a href="https://salimmc.github.io/Unicorne_messagifier/"><b>✨ Try it live ✨</b></a>
</p>

<p align="center">
  <a href="https://github.com/SalimMc/Unicorne_messagifier/stargazers">
    <img src="https://img.shields.io/github/stars/SalimMc/Unicorne_messagifier?style=for-the-badge" alt="GitHub stars">
  </a>
  <a href="https://github.com/SalimMc/Unicorne_messagifier/network/members">
    <img src="https://img.shields.io/github/forks/SalimMc/Unicorne_messagifier?style=for-the-badge" alt="GitHub forks">
  </a>
  <a href="https://github.com/SalimMc/Unicorne_messagifier/actions/workflows/deploy.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/SalimMc/Unicorne_messagifier/deploy.yml?branch=main&style=for-the-badge&label=tests" alt="Tests">
  </a>
  <a href="https://salimmc.github.io/Unicorne_messagifier/">
    <img src="https://img.shields.io/badge/demo-online-e0479e?style=for-the-badge" alt="Live demo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Node.js_tests-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=githubpages&logoColor=white" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat" alt="Zero dependencies">
  <img src="https://img.shields.io/github/last-commit/SalimMc/Unicorne_messagifier?style=flat" alt="Last commit">
  <img src="https://img.shields.io/github/repo-size/SalimMc/Unicorne_messagifier?style=flat" alt="Repo size">
</p>

<p align="center">
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Built with love">
  <img src="https://forthebadge.com/images/badges/made-with-javascript.svg" alt="Made with JavaScript">
  <img src="assets/badges/powered-by-tea.svg" alt="Powered by tea">
  <img src="https://forthebadge.com/images/badges/works-on-my-machine.svg" alt="Works on my machine">
</p>

---

## 🌸 What it does

Paste a message (plain text or markdown) ➜ get it back full of emojis and kaomojis **that match the text**.

```diff
- I finally fixed the bug! The cat ate my pizza again...
+ I finally fixed ✅️ the bug 🐛! *★,°*:.☆(￣▽￣)/$:*.°★* 。 🥳🥳 The cat 🐈 ate my pizza 🍕 again... (^._.^)ﾉ 🐱🐱
```

- 🌍 Works in **English, French, Czech and Arabic** (Modern Standard), with auto-detection
- 🆓 **Free, no server, no AI**: everything runs in your browser, nothing is sent anywhere
- 🧾 **Markdown-safe**: headings, lists, checkboxes, links and code are never broken
- 🎚️ Three intensities: **Subtle**, **Normal** and **Chaos** ┻━┻
- 🎲 Reroll for another version, 📋 copy in one click, 🌙 light and dark themes
- 🕺 There might be a surprise if you convert enough messages…

## ⚙️ How it works

1. **Word emojis**: each word is looked up in the official Unicode CLDR emoji keywords of its language
   (`pizza` ➜ 🍕, `kočka` ➜ 🐈), with naive stemming (`pizzas` ➜ `pizza`, `القطة` ➜ `قط`).
2. **Sentence emotion**: words are scored with the NRC Emotion Lexicon (joy, sadness, anger, fear, surprise…),
   combined with punctuation (`!!!`, `?`, `...`), negations ("not happy") and topics (greetings, food, sleep, animals…).
3. **Decoration**: a kaomoji from the matching category (~780 hand-sorted kaomojis) plus emotion emojis are added
   at the end of each sentence or heading.
4. **Markdown-safe**: the text is processed line by line and protected parts are left untouched.

## 🚀 Usage

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

### 🛠️ Tweaking results

- Wrong emoji for a word: add it to `EMOJI_FIXES_RAW` in `src/lexicon.js` (`""` removes the emoji).
- More kaomojis: add lines under a `# category` in `data/kaomoji.txt`.
- New topic: add stems to `TOPIC_STEMS` in `src/lexicon.js` with a kaomoji category of the same name.

## 📁 Project structure

```
.
├── index.html              page markup
├── css/style.css           page styles (light + dark)
├── src/
│   ├── app.js              UI wiring: lazy data loading, buttons, copy, theme
│   ├── easter-egg.js       surprise on the 5th conversion
│   ├── messagify.js        public API: messagify(), intensity LEVELS, LANGS
│   ├── decorator.js        per-line / per-sentence / per-word decoration
│   ├── emotion.js          sentence emotion -> kaomoji category, emotion emojis
│   ├── kaomoji.js          kaomoji table parser and picker
│   ├── lexicon.js          hand-written lists: stopwords, negators, topics, emoji fixes
│   ├── markdown.js         markdown line parsing and protected inline parts
│   └── text.js             normalization, language detection, stemming, seeded RNG
├── data/
│   ├── kaomoji.txt         kaomojis grouped by category (edit freely)
│   └── {en,fr,cs,ar}.json  generated: word -> emojis ("e"), word -> NRC emotion codes ("m")
├── assets/
│   ├── audio/              easter-egg song
│   └── badges/             custom README badges
├── tools/
│   ├── build_data.py       regenerates data/*.json from the raw sources
│   ├── try.mjs             try the converter in a terminal
│   └── load-context.mjs    loads data/ from disk for Node.js
├── test/                   unit tests (node:test, no dependencies)
└── .github/workflows/      tests + GitHub Pages deployment
```

## 🌐 Deploying (GitHub Pages)

`.github/workflows/deploy.yml` runs the tests on every push and pull request, then deploys
`index.html`, `css/`, `src/`, `data/` and `assets/` from `main`.
One-time setup on GitHub: **Settings ➜ Pages ➜ Source: GitHub Actions**.

## 🔄 Regenerating the data (optional)

Download into a `raw/` folder (git-ignored):
- `cldr_<lang>.json` from
  `https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/<lang>/annotations.json`
- `French-NRC-EmoLex.txt`, `Czech-NRC-EmoLex.txt`, `Arabic-NRC-EmoLex.txt` from the `OneFilePerLanguage/` folder of
  https://saifmohammad.com/WebDocs/Lexicons/NRC-Emotion-Lexicon.zip

then run `npm run build-data`.

---

## ༼ つ ◕_◕ ༽つ Contributors

<a href="https://github.com/SalimMc/Unicorne_messagifier/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SalimMc/Unicorne_messagifier" alt="Contributors">
</a>

---

## 📄 Data licenses

- Emoji keywords: [Unicode CLDR](https://cldr.unicode.org/) (Unicode license).
- Emotions: [NRC Emotion Lexicon](https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm) by Saif M. Mohammad,
  **free for non-commercial / research use only**.

---

<p align="center">

Made with ❤️ by SalimMc

⭐ If this repository helped you, you know what to do!

</p>
