// Tiny synthesizer for UI sounds, generated with the Web Audio API (no audio
// files). Browsers only allow audio after the visitor's first tap, click or
// key press, so `unlockSound()` is called on that first gesture.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = true;
let lastTick = 0;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** Create/resume the audio context. Must run inside a user gesture. */
export function unlockSound() {
  audio();
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    // One second of white noise, reused for every click and tick.
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function ready(): AudioContext | null {
  if (!enabled || !ctx || ctx.state !== "running") return null;
  return ctx;
}

/** Short filtered noise burst: the "body" of clicks and ticks. */
function burst(freq: number, q: number, duration: number, gain: number, delay = 0) {
  const ac = ready();
  if (!ac || !master || !noise) return;
  const start = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = ac.createGain();
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter).connect(env).connect(master);
  src.start(start, Math.random() * 0.5, duration + 0.02);
}

/** Pitched tone with a quick attack and exponential decay. */
function tone(freq: number, duration: number, gain: number, type: OscillatorType = "sine", delay = 0, to?: number) {
  const ac = ready();
  if (!ac || !master) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  /** Feather-light tick for hovering links and buttons. */
  tick() {
    const now = performance.now();
    if (now - lastTick < 50) return;
    lastTick = now;
    burst(6500, 4, 0.018, 0.25);
  },
  /** Crisp mechanical click for buttons and links. */
  click() {
    burst(3200, 2.5, 0.03, 0.6);
    tone(140, 0.05, 0.35, "sine", 0, 70);
  },
  /** Chunky keyboard switch: click on the way down, softer clack on release. */
  clack(pitch = 1) {
    burst(2600 * pitch, 2, 0.035, 0.9);
    tone(110 * pitch, 0.07, 0.5, "triangle", 0, 55 * pitch);
    burst(1800 * pitch, 3, 0.03, 0.35, 0.09);
  },
  /** Wall light switch: two quick clicks. */
  toggle() {
    burst(4200, 3, 0.02, 0.7);
    burst(2400, 3, 0.03, 0.5, 0.045);
    tone(90, 0.06, 0.25, "sine", 0.045);
  },
  /** Little start-up chime for the Ctrl + Alt + Del easter egg. */
  boot() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.35, 0.22, "triangle", i * 0.09));
    tone(2093, 0.6, 0.08, "sine", 0.36);
  },
  /** Two soft notes when sound is switched on. */
  on() {
    tone(660, 0.12, 0.25, "sine");
    tone(990, 0.16, 0.25, "sine", 0.08);
  },
};
