/**
 * Easter egg: on the Nth conversion of a visit, a funny "jump scare" dance party pops up
 * full screen (dancing GIF + "I Like to Move It" from Madagascar, boosted and saturated).
 * @module easter-egg
 */

/** Conversion number that triggers the party. */
export const PARTY_AT_CONVERSION = 5;

const GIF_URL = "https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif";
const SONG_URL = "assets/audio/i-like-to-move-it.mp3";
/** Volume multiplier applied before the distortion. */
const VOLUME_BOOST = 8;
/** Distortion amount: 0 = clean, higher = more saturated (400 is "blown speaker" territory). */
const DISTORTION = 400;
/** The song starts here, right in the beat. */
const START_AT_SECONDS = 1;
/** Max wait for the first note before showing the GIF anyway. */
const SYNC_TIMEOUT_MS = 400;

// The GIF and the song are downloaded as soon as the page loads, and the song is
// already parked at START_AT_SECONDS, so nothing has to load or seek during the party.
const gif = new Image();
gif.src = GIF_URL;
const song = new Audio(SONG_URL);
song.preload = "auto";
song.loop = true;
song.addEventListener("loadedmetadata", () => { song.currentTime = START_AT_SECONDS; }, { once: true });

/** @type {AudioContext | null} */
let audio = null;

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
 * Builds the sound chain (boost -> saturation -> brickwall limiter at full scale) ahead of time.
 * Call it from a click handler: browsers only allow audio after a user gesture.
 * Safe to call many times.
 */
export function armDanceParty() {
  if (audio) {
    audio.resume();
    return;
  }
  try {
    audio = new AudioContext({ latencyHint: "interactive" });
    const gain = audio.createGain();
    gain.gain.value = VOLUME_BOOST;
    const saturation = audio.createWaveShaper();
    saturation.curve = distortionCurve(DISTORTION);
    saturation.oversample = "4x";
    // limiter just under 0 dB: everything gets squashed to the loudest a browser can output
    const limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -1;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.05;
    audio.createMediaElementSource(song)
      .connect(gain).connect(saturation).connect(limiter).connect(audio.destination);
    audio.resume();
  } catch (err) {
    console.warn("Volume boost unavailable, playing at normal volume:", err);
  }
}

/** Resolves when the song is actually producing sound (or after a short timeout). */
function playAndWaitForSound() {
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(done, SYNC_TIMEOUT_MS);
    song.addEventListener("playing", done, { once: true });
    song.play().catch((err) => {
      console.warn("Song could not start:", err);
      done();
    });
  });
}

function buildOverlay() {
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
  return overlay;
}

/** Pops the dance party up at the exact moment the music starts. Closing it stops the music. */
export async function startDanceParty() {
  if (document.querySelector(".party")) return;
  armDanceParty();
  song.currentTime = START_AT_SECONDS;
  await playAndWaitForSound();

  const overlay = buildOverlay();
  const close = () => {
    overlay.remove();
    song.pause();
    song.currentTime = START_AT_SECONDS; // ready for next time
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
}
