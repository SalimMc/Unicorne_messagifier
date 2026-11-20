"""Build data/<lang>.json from Unicode CLDR emoji annotations + NRC Emotion Lexicon.

Run once (needs the raw files downloaded, see README):
    python tools/build_data.py <raw_dir>

raw_dir must contain cldr_<lang>.json and <Language>-NRC-EmoLex.txt files.
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

# language code -> NRC per-language file; English words come from the first column of any of them
NRC_FILES = {"en": "French", "fr": "French", "cs": "Czech", "ar": "Arabic"}
OUT = Path(__file__).resolve().parent.parent / "data"
MAX_EMOJIS_PER_KEYWORD = 6   # a keyword shared by more emojis is too vague ("face", "hand")
EMOTION_CODES = {"anger": "a", "anticipation": "n", "disgust": "d", "fear": "f", "joy": "j",
                 "negative": "-", "positive": "+", "sadness": "s", "surprise": "u", "trust": "t"}
AR_DIACRITICS = re.compile(r"[\u064B-\u065F\u0670\u0640]")


def norm(word: str) -> str:
    """Must match norm() in messagify.js."""
    w = word.lower()
    w = AR_DIACRITICS.sub("", w)
    w = re.sub("[أإآ]", "ا", w).replace("ى", "ي")
    w = unicodedata.normalize("NFD", w)
    w = "".join(c for c in w if unicodedata.category(c) != "Mn" or "\u0600" <= c <= "\u06FF")
    return unicodedata.normalize("NFC", w)


def is_emoji(s: str) -> bool:
    """Keeps real emojis, drops skin-tone variants and plain symbols (arrows, math...)."""
    if any(0x1F3FB <= ord(c) <= 0x1F3FF for c in s):   # skin tones: skip variants
        return False
    return any(ord(c) >= 0x1F000 or 0x2600 <= ord(c) <= 0x27BF for c in s)


def single_words(phrase: str) -> list[str]:
    """Splits a CLDR keyword phrase into words of 3+ letters."""
    return [w for w in re.split(r"[\s|,]+", phrase) if len(w) >= 3]


def build_emojis(path: Path) -> dict[str, list[str]]:
    """word -> up to 3 emojis, best first: exact emoji name, then keywords, then names containing the word."""
    ann = json.loads(path.read_text(encoding="utf8"))["annotations"]["annotations"]
    strong = defaultdict(list)  # word is the whole emoji name (tts)
    named = defaultdict(list)   # word appears in the emoji name: (name length, emoji)
    weak = defaultdict(list)    # word is one of the keywords
    for emo, v in ann.items():
        if not is_emoji(emo):
            continue
        if len(emo) == 1 and 0x2600 <= ord(emo) <= 0x27BF:
            emo += "\uFE0F"  # force emoji rendering
        tts = v.get("tts", [""])[0].strip()
        if " " not in tts:
            strong[norm(tts)].append(emo)
        else:
            for w in single_words(tts):
                named[norm(w)].append((len(tts), emo))
        for kw in v.get("default", []):
            for w in single_words(kw):
                weak[norm(w)].append(emo)
    out = {}
    for w in set(strong) | set(weak) | set(named):
        if not w or len(w) < 3:
            continue
        s = strong.get(w, [])
        k = [e for e in dict.fromkeys(weak.get(w, [])) if e not in s]
        if len(k) > MAX_EMOJIS_PER_KEYWORD:
            # too vague: keep only emojis whose name contains the word, shortest name first
            k = [e for _, e in sorted(named.get(w, [])) if e not in s][:3]
        lst = (s + k)[:3]
        if lst:
            out[w] = lst
    return out


def build_emotions(path: Path, lang: str) -> dict[str, str]:
    """word -> NRC emotion codes, e.g. "happy" -> "j+t" (see EMOTION_CODES)."""
    lines = path.read_text(encoding="utf8").splitlines()
    head = lines[0].split("\t")
    col = 0 if lang == "en" else len(head) - 1
    out = {}
    for line in lines[1:]:
        parts = line.split("\t")
        codes = "".join(EMOTION_CODES[h] for h, val in zip(head[1:-1], parts[1:-1]) if val == "1")
        word = norm(parts[col].strip())
        if codes and word and " " not in word and word not in out:
            out[word] = codes
    return out


def main(raw: Path) -> None:
    OUT.mkdir(exist_ok=True)
    for lang, nrc_name in NRC_FILES.items():
        data = {"e": build_emojis(raw / f"cldr_{lang}.json"),
                "m": build_emotions(raw / f"{nrc_name}-NRC-EmoLex.txt", lang)}
        (OUT / f"{lang}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")),
                                          encoding="utf8")
        print(lang, len(data["e"]), "emoji words,", len(data["m"]), "emotion words")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
