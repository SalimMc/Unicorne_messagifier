/**
 * Easter egg: on the Nth conversion of a visit, a full-screen dance party shows up
 * (dancing GIF + "I Like to Move It" from Madagascar, played through a YouTube embed).
 * @module easter-egg
 */

/** Conversion number that triggers the party. */
export const PARTY_AT_CONVERSION = 5;

const GIF_URL = "https://media.giphy.com/media/ptS6CV6Ty7Dt26k6wq/giphy.gif";
/** YouTube video id of the song; swap it if this video ever stops allowing embeds. */
const SONG_VIDEO_ID = "nuOpil0L-kg";

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
    <img class="party-gif" src="${GIF_URL}" alt="Animals dancing">
    <iframe class="party-song" title="I Like to Move It - Madagascar"
      src="https://www.youtube-nocookie.com/embed/${SONG_VIDEO_ID}?autoplay=1&loop=1&playlist=${SONG_VIDEO_ID}"
      allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

  const close = () => {
    overlay.remove(); // removing the iframe stops the song
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest(".party-close")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  overlay.querySelector(".party-close").focus();
}
