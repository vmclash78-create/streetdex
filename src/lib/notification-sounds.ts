// Synthesized notification sounds via WebAudio API.
// Generates high-quality, cross-browser audio without external file/CORS dependencies.
// All presets respect a master volume (0..1). Browsers honor OS-level mute automatically.

export type SoundPresetId =
  | "classico"
  | "sino-suave"
  | "sino-digital"
  | "alerta-elegante"
  | "dinheiro"
  | "pop-curto";

export interface SoundPreset {
  id: SoundPresetId;
  name: string;
  description: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: "classico",        name: "Clássico (Ding-Dong)",   description: "Sino bitonal clássico de notificação" },
  { id: "sino-suave",      name: "Sino Suave",             description: "Sino delicado com decaimento longo" },
  { id: "sino-digital",    name: "Sino Digital",           description: "Beep duplo cristalino" },
  { id: "alerta-elegante", name: "Alerta Elegante",        description: "Arpejo curto em três notas" },
  { id: "dinheiro",        name: "Caixa Registradora",     description: "Tilintar de moedas" },
  { id: "pop-curto",       name: "Pop Curto",              description: "Pop discreto e rápido" },
];

const AudioCtxCtor =
  typeof window !== "undefined"
    ? window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : undefined;

let sharedCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (!AudioCtxCtor) return null;
  try {
    if (!sharedCtx || sharedCtx.state === "closed") {
      sharedCtx = new AudioCtxCtor({ latencyHint: "interactive" });
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export async function unlockAudioContext(): Promise<boolean> {
  const ctx = getSharedAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    // Silent buffer to fully unlock on iOS / Safari
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    src.connect(ctx.destination);
    src.start(0);
    return ctx.state === "running";
  } catch {
    return false;
  }
}

// Voice helpers -------------------------------------------------------------

interface VoiceOptions {
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  peak?: number; // 0..1 (relative to master)
  harmonics?: { ratio: number; gain: number; type?: OscillatorType }[];
  pitchBend?: { to: number; time: number };
}

function playVoice(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  startAt: number,
  duration: number,
  opts: VoiceOptions = {},
) {
  const {
    type = "sine",
    attack = 0.008,
    decay = duration,
    peak = 0.9,
    harmonics = [],
    pitchBend,
  } = opts;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, startAt);
  env.gain.exponentialRampToValueAtTime(Math.max(peak, 0.001), startAt + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + decay);
  env.connect(master);

  const makeOsc = (oscType: OscillatorType, frequency: number, gainValue = 1) => {
    const osc = ctx.createOscillator();
    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency, startAt);
    if (pitchBend) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(pitchBend.to, 1),
        startAt + pitchBend.time,
      );
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainValue, startAt);
    osc.connect(g).connect(env);
    osc.start(startAt);
    osc.stop(startAt + attack + decay + 0.05);
  };

  makeOsc(type, freq, 1);
  for (const h of harmonics) {
    makeOsc(h.type ?? "sine", freq * h.ratio, h.gain);
  }
}

// Presets -------------------------------------------------------------------

type PlayFn = (ctx: AudioContext, master: GainNode, t0: number) => number;
// returns total duration in seconds

const PRESET_PLAYERS: Record<SoundPresetId, PlayFn> = {
  classico: (ctx, master, t0) => {
    // Two-tone bell: E6 then C6 with bright harmonic
    playVoice(ctx, master, 1318.51, t0,        0.45, { peak: 0.85, harmonics: [{ ratio: 2, gain: 0.18 }, { ratio: 3.01, gain: 0.06 }] });
    playVoice(ctx, master, 1046.50, t0 + 0.18, 0.85, { peak: 0.7,  harmonics: [{ ratio: 2, gain: 0.16 }, { ratio: 3.01, gain: 0.05 }] });
    return 1.1;
  },

  "sino-suave": (ctx, master, t0) => {
    // Soft single chime, slow decay
    playVoice(ctx, master, 880,  t0, 1.4, { peak: 0.6, attack: 0.015, harmonics: [{ ratio: 2, gain: 0.22 }, { ratio: 3, gain: 0.05 }] });
    playVoice(ctx, master, 1320, t0 + 0.05, 1.2, { peak: 0.4, harmonics: [{ ratio: 2, gain: 0.15 }] });
    return 1.6;
  },

  "sino-digital": (ctx, master, t0) => {
    // Crystalline double beep — triangle
    playVoice(ctx, master, 1760, t0,        0.18, { type: "triangle", peak: 0.85, attack: 0.004 });
    playVoice(ctx, master, 2349, t0 + 0.12, 0.22, { type: "triangle", peak: 0.85, attack: 0.004 });
    return 0.5;
  },

  "alerta-elegante": (ctx, master, t0) => {
    // C major triad arpeggio: C5 - E5 - G5
    playVoice(ctx, master, 523.25, t0,        0.35, { peak: 0.75, harmonics: [{ ratio: 2, gain: 0.18 }] });
    playVoice(ctx, master, 659.25, t0 + 0.12, 0.4,  { peak: 0.75, harmonics: [{ ratio: 2, gain: 0.18 }] });
    playVoice(ctx, master, 783.99, t0 + 0.24, 0.65, { peak: 0.8,  harmonics: [{ ratio: 2, gain: 0.2 }, { ratio: 3, gain: 0.05 }] });
    return 1.0;
  },

  dinheiro: (ctx, master, t0) => {
    // Coin-like high-frequency taps with quick decay
    const taps = [0, 0.07, 0.16, 0.27, 0.4];
    const freqs = [2100, 2640, 1980, 2480, 2200];
    taps.forEach((delay, i) => {
      playVoice(ctx, master, freqs[i], t0 + delay, 0.18, {
        type: "triangle",
        peak: 0.8,
        attack: 0.002,
        harmonics: [{ ratio: 1.5, gain: 0.25, type: "triangle" }],
      });
    });
    return 0.7;
  },

  "pop-curto": (ctx, master, t0) => {
    playVoice(ctx, master, 900, t0, 0.12, {
      type: "sine",
      peak: 0.9,
      attack: 0.002,
      pitchBend: { to: 350, time: 0.12 },
    });
    return 0.25;
  },
};

// Public API ----------------------------------------------------------------

export async function playNotificationSound(
  presetId: SoundPresetId | string | undefined,
  volume = 0.8,
): Promise<boolean> {
  const id = (presetId && presetId in PRESET_PLAYERS ? presetId : "classico") as SoundPresetId;
  const ctx = getSharedAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    if (ctx.state !== "running") return false;

    const master = ctx.createGain();
    const safeVol = Math.max(0, Math.min(1, volume));
    master.gain.setValueAtTime(safeVol, ctx.currentTime);
    master.connect(ctx.destination);

    const startAt = ctx.currentTime + 0.02;
    const duration = PRESET_PLAYERS[id](ctx, master, startAt);
    window.setTimeout(() => {
      try { master.disconnect(); } catch { /* noop */ }
    }, Math.ceil((duration + 0.3) * 1000));
    return true;
  } catch (e) {
    console.warn("playNotificationSound failed:", e);
    return false;
  }
}

export function isLegacyUrlValue(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function normalizePresetId(value: string | undefined | null): SoundPresetId {
  if (value && value in PRESET_PLAYERS) return value as SoundPresetId;
  return "classico";
}
