/**
 * Easter egg: on the Nth conversion of a visit, a funny "jump scare" dance party pops up
 * full screen (dancing GIF + "I Like to Move It" from Madagascar, boosted volume).
 * @module easter-egg
 */

/** Conversion number that triggers the party. */
export const PARTY_AT_CONVERSION = 5;

const GIF_URL = "https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif";
const SONG_URL = "assets/audio/i-like-to-move-it.mp3";
/** Volume multiplier on top of the normal 100% (a compressor keeps it from crackling too much). */
const VOLUME_BOOST = 4;

// Both the GIF and the song are downloaded as soon as the page loads, so the party is instant.
const gif = new Image();
gif.src = GIF_URL;
const song = new Audio(SONG_URL);
song.preload = "auto";
song.loop = true;

let boosted = false;

/**
 * Routes the song through Web Audio: gain above 1 for extra loudness, then a limiter.
 * Must run after a user click (browsers only allow audio contexts after a gesture).
 */
function boostVolume() {
  if (boosted) return;
  boosted = true;
  try {
    const audio = new AudioContext();
    const gain = audio.createGain();
    gain.gain.value = VOLUME_BOOST;
    const limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    audio.createMediaElementSource(song).connect(gain).connect(limiter).connect(audio.destination);
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
  song.currentTime = 0;
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
