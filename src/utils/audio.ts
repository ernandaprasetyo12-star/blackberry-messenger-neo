// Nostalgic BBM Sound Synthesizer using Web Audio API
// This allows offline-first and CORS-free high-fidelity sound generation

let isMuted = false;

export function setMuteState(muted: boolean) {
  isMuted = muted;
  localStorage.setItem("bbm_neo_muted", muted ? "true" : "false");
}

export function getMuteState(): boolean {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("bbm_neo_muted");
    if (saved !== null) {
      isMuted = saved === "true";
    }
  }
  return isMuted;
}

/**
 * Play the iconic high-pitched BBM PING! double-chirp sound.
 */
export function playPingSound() {
  if (getMuteState()) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    // First Chirp
    createChirp(ctx, now, 1800, 2200, 0.05);
    // Second Chirp (rapidly after)
    createChirp(ctx, now + 0.06, 1900, 2300, 0.05);

  } catch (err) {
    console.warn("Audio Context failed to initialize (interaction required):", err);
  }
}

/**
 * Play the classic BBM incoming message "chirp-chirp" sound.
 */
export function playMessageSound() {
  if (getMuteState()) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    // A nostalgic triple-chirp sweep pattern
    createChirp(ctx, now, 1000, 1500, 0.04);
    createChirp(ctx, now + 0.06, 1100, 1600, 0.04);
    createChirp(ctx, now + 0.12, 1200, 1700, 0.06);

  } catch (err) {
    console.warn("Audio Context failed to initialize (interaction required):", err);
  }
}

/**
 * Helper to generate a clean, sweeping frequency pulse (chirp)
 */
function createChirp(ctx: AudioContext, startTime: number, startFreq: number, endFreq: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Use triangle or square wave for that authentic 2000s mobile processor synthesizer timbre
  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

  gain.gain.setValueAtTime(0.15, startTime);
  gain.gain.linearRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}
