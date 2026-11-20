/**
 * Easter egg: on the Nth conversion of a visit, a funny "jump scare" dance party pops up
 * full screen (dancing GIF + "I Like to Move It" from Madagascar, boosted volume).
 * @module easter-egg
 */

/** Conversion number that triggers the party. */
export const PARTY_AT_CONVERSION = 5;

const GIF_URL = "https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif";
const SONG_URL = "assets/audio/i-like-to-move-it.mp3";
/** Volume multiplier applied before the distortion. */
const VOLUME_BOOST = 4;
/** Distortion amount: 0 = clean, higher = more saturated (400 is "blown speaker" territory). */
const DISTORTION = 400;
/** The song starts here, right in the beat. */
const START_AT_SECONDS = 1;

// Both the GIF and the song are downloaded as soon as the page loads, so the party is instant.
const gif = new Image();
gif.src = GIF_URL;
const song = new Audio(SONG_URL);
song.preload = "auto";
song.loop = true;

let boosted = false;

/**
 * Wave-shaping curve for a hard, fuzzy saturation.
 * @param {number} amount
 * @returns {Float32Array}
 */
function distortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/**
 * Routes the song through Web Audio: boost -> saturation -> limiter.
 * Must run after a user click (browsers only allow audio contexts after a gesture).
 */
function boostVolume() {
  if (boosted) return;
  boosted = true;
  try {
    const audio = new AudioContext();
    const gain = audio.createGain();
    gain.gain.value = VOLUME_BOOST;
    const saturation = audio.createWaveShaper();
    saturation.curve = distortionCurve(DISTORTION);
    saturation.oversample = "4x";
    const limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    audio.createMediaElementSource(song)
      .connect(gain).connect(saturation).connect(limiter).connect(audio.destination);
    audio.resume();
  } catch (err) {
    console.warn("Volume boost unavailable, playing at normal volume:", err);
  }
}

/** Pops the dance party up. Closing it (button, click or Escape) stops the music. */
export function startDanceParty() {
  if (document.querySelector(".party")) return;

  boostVolume();
  song.volume = 1;
  song.currentTime = START_AT_SECONDS;
  song.play().catch((err) => console.warn("Song could not start:", err));

  const overlay = document.createElement("div");
  overlay.className = "party";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Dance party");
  const img = gif.cloneNode();
  img.className = "party-gif";
  img.alt = "Animals dancing";
  const closeBtn = document.createElement("button");
  closeBtn.className = "party-close";
  closeBtn.type = "button";
  closeBtn.ariaLabel = "Close";
  closeBtn.textContent = "✕";
  overlay.append(img, closeBtn);

  const close = () => {
    overlay.remove();
    song.pause();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };

  overlay.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
}
