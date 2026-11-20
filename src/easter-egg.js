/**
 * Easter egg: on the Nth conversion of a visit, a full-screen dance party shows up
 * (dancing GIF + "I Like to Move It" from Madagascar).
 * @module easter-egg
 */

/** Conversion number that triggers the party. */
export const PARTY_AT_CONVERSION = 5;

const GIF_URL = "https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif";

// The song is downloaded as soon as the page loads, so it starts instantly with the GIF.
const song = new Audio("assets/audio/i-like-to-move-it.mp3");
song.preload = "auto";
song.loop = true;

/** Opens the dance party overlay. Closing it (button, backdrop click or Escape) stops the music. */
export function startDanceParty() {
  if (document.querySelector(".party")) return;

  const overlay = document.createElement("div");
  overlay.className = "party";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Dance party");
  overlay.innerHTML = `
    <button class="party-close" type="button" aria-label="Close">✕</button>
    <p class="party-title">🎉 5 messages! I like to move it, move it! 🎉</p>
    <img class="party-gif" src="${GIF_URL}" alt="Animals dancing">`;

  const close = () => {
    overlay.remove();
    song.pause();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest(".party-close")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  overlay.querySelector(".party-close").focus();

  song.currentTime = 0;
  song.play().catch((err) => console.warn("Song could not start:", err));
}
