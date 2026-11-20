/**
 * Hand-written word lists shared by all languages (en, fr, cs, ar).
 * Every entry is normalized with {@link normalize}, so accents are optional.
 * @module lexicon
 */
import { normalize } from "./text.js";

const toSet = (words) => new Set(words.trim().split(/\s+/).map(normalize));

/** Little words that never get an emoji. */
export const STOPWORDS = toSet(`
  i me my mine you your he she it its we our they them their this that these those what which who whom why how when where
  is am are was were be been being do does did done have has had will would can could should must not yes so very just also too
  all some any of in on at to for with from by about as and or but if then than there here now ok okay really get got go going
  one two more most much many
  je tu il elle on nous vous ils elles me te se mon ma mes ton ta tes son sa ses notre votre leur leurs ce cet cette ces qui que
  quoi dont où est suis es sommes êtes sont été être avoir ai as avons avez ont avait mais ou et donc car pas plus très trop bien
  aussi tout tous toute toutes avec sans pour par dans sur sous chez vers de du des le la les un une au aux en ça cela ceci comme
  si alors encore déjà vraiment fait faire
  já ty on ona ono my vy oni jsem jsi je jsme jste jsou byl byla bylo být mám máš má máme máte mají moje můj tvoje tvůj jeho
  její náš váš ten ta to tento tato toto co kdo proč jak kde kdy ale nebo že protože tak taky také už ještě velmi moc hodně jen
  na ve ze do od po pro se při bez dnes
  انا أنا أنت انت هو هي نحن هم هذا هذه ذلك تلك التي الذي في من الى إلى على عن مع او أو ثم لكن جدا كان كانت يكون لأن لان ان
  أن إن قد لقد كل بعض ماذا لماذا كيف متى أين هل نعم اليوم`);

/** Words that flip the emotion of the next word ("not happy"). */
export const NEGATORS = toSet(
  "not no never dont don't isnt isn't wasnt nothing pas jamais rien plus ne nejsem neni nikdy لا ليس لم لن ما");

/**
 * Topic stems: a sentence containing one of these gets the matching kaomoji category.
 * Stems of 4+ letters also match longer words ("dormir" matches "dormirai").
 */
const TOPIC_STEMS = {
  love: "love lovely amour aime adore amoureu miluj laska zamilov حب احب عشق غرام",
  kiss: "kiss bisou embrass polib pusa قبلة بوسة",
  hug: "hug cuddle calin objim عناق حضن",
  hello: "hello hi hey hiya salut bonjour bonsoir coucou ahoj cau nazdar zdravim مرحبا سلام اهلا",
  bye: "bye goodbye ciao adieu revoir bientot nashle sbohem وداع",
  thanks: "thank thanks thx merci please sorry desole pardon dekuj diky dekuji omlouv promin prosim شكرا شكر اسف عفوا",
  sleepy: "sleep sleepy tired asleep nap dormir dors dodo fatigue creve sieste spat spim unaven ospal نوم نعسان متعب",
  eat: `eat eating food hungry lunch dinner breakfast yummy manger mange bouffe faim repas dejeuner diner miam
        jist jidlo hlad obed vecere اكل جوع طعام غداء عشاء`,
  money: "money cash rich paid salary argent fric thune pognon riche salaire penize prachy plat bohat مال فلوس نقود راتب",
  dance: "dance dancing music song party sing danse danser musique chanson fete chanter tanc hudba pisen zpiv رقص موسيقى اغنية حفلة",
  write: "write writing notes homework ecrire note devoir psat poznam ukol كتابة اكتب واجب",
  determined: "fight win goal motivated allez courage bats gagner vyhr bojuj فوز هدف",
};
const TOPICS = Object.entries(TOPIC_STEMS).map(([topic, stems]) => [topic, [...toSet(stems)]]);

/**
 * @param {string} word normalized word
 * @returns {string | null} topic name, or null
 */
export function topicOfWord(word) {
  for (const [topic, stems] of TOPICS) {
    if (stems.some((s) => word === s || (s.length >= 4 && word.startsWith(s)))) return topic;
  }
  return null;
}

/** An emoji placed in a sentence also sets its topic (🐈 -> cat kaomoji). */
const TOPIC_EMOJIS = {
  cat: "🐈🐱😺😸😻🐈‍⬛", dog: "🐕🐶🐩🦮", bear: "🐻🧸🐼🐻‍❄️", pig: "🐖🐷🐽", rabbit: "🐇🐰",
  fish: "🐟🐠🐡🎣🦈", bird: "🐦🐤🐧🐔🦜🕊️🦉", eat: "🍕🍔🍟🍜🍣🍰🍩🍪🥐🍝🌮🥗",
  money: "💰💸🤑💵💶", dance: "🎵🎶💃🕺🎤🎸", sleepy: "😴💤🛌",
};

/**
 * @param {string} emoji
 * @returns {string | null} topic name, or null
 */
export function topicOfEmoji(emoji) {
  return Object.keys(TOPIC_EMOJIS).find((t) => TOPIC_EMOJIS[t].includes(emoji)) ?? null;
}

/**
 * Manual fixes where the Unicode keywords pick an odd emoji. An empty string means "no emoji".
 * Add a line here to correct a word.
 */
const EMOJI_FIXES_RAW = {
  love: "❤️", hard: "", works: "", eat: "🍽️", mange: "🍽️", manger: "🍽️",
  sick: "🤒", malade: "🤒", nemocna: "🤒", nemocny: "🤒", سمك: "🐟",
  exam: "📝", examen: "📝", test: "📝", zkouska: "📝", امتحان: "📝",
  code: "💻", bug: "🐛", work: "💼", travail: "💼", prace: "💼",
  school: "🏫", ecole: "🏫", skola: "🏫",
  happy: "😄", heureux: "😄", content: "😄", stastny: "😄", سعيد: "😄",
  sad: "😢", triste: "😢", smutny: "😢", حزين: "😢",
  friends: "👯", amis: "👯", pratele: "👯",
};
export const EMOJI_FIXES = new Map(
  Object.entries(EMOJI_FIXES_RAW).map(([word, emoji]) => [normalize(word), emoji ? [emoji] : []]));
