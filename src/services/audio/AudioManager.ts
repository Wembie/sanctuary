import type { SoundId, SoundMix } from './catalog';
import { chime, GENERATORS } from './generators';
import { perceptualGain, planMix } from './mix';
import type { VoiceGraph } from './synthesis';

export type AudioStatus = 'unsupported' | 'locked' | 'running' | 'suspended';

interface Voice {
  gain: GainNode;
  graph: VoiceGraph;
  volume: number;
  disposeTimer?: number;
}

type AudioContextCtor = typeof AudioContext;

const DEFAULT_FADE = 2.5;
/** Suspend the context after this long in silence: saves battery on phones. */
const IDLE_SUSPEND_MS = 20_000;

function resolveContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? w.webkitAudioContext;
}

function createContext(Ctor: AudioContextCtor): AudioContext {
  try {
    // 'playback' favors stability and battery over latency: right for ambience.
    return new Ctor({ latencyHint: 'playback' });
  } catch {
    // Older Safari rejects the options object.
    return new Ctor();
  }
}

/**
 * One AudioContext for the whole app. Voices fade in and out; nothing ever
 * starts or stops abruptly. Every failure degrades to silence, never to an error.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private samples: Uint8Array<ArrayBuffer> | null = null;
  private readonly voices = new Map<SoundId, Voice>();
  private readonly listeners = new Set<() => void>();
  private masterVolume = 0.7;
  private masterScale = 1;
  private enabled = false;
  private idleTimer: number | undefined;
  private status: AudioStatus;

  constructor() {
    this.status = resolveContextCtor() ? 'locked' : 'unsupported';
  }

  get supported(): boolean {
    return this.status !== 'unsupported';
  }

  getStatus(): AudioStatus {
    return this.status;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Must run inside a user gesture: that's the only moment browsers allow audio. */
  unlock(): boolean {
    const Ctor = resolveContextCtor();
    if (!Ctor) return false;
    try {
      if (!this.ctx) this.build(createContext(Ctor));
      void this.ctx?.resume().catch(() => undefined);
      return true;
    } catch {
      this.setStatus('unsupported');
      return false;
    }
  }

  private build(ctx: AudioContext): void {
    this.ctx = ctx;
    this.bus = ctx.createGain();
    // A gentle limiter so stacked layers never clip.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 12;
    limiter.ratio.value = 4;
    limiter.attack.value = 0.02;
    limiter.release.value = 0.4;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.9;
    this.samples = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
    this.bus.connect(limiter).connect(this.master).connect(this.analyser).connect(ctx.destination);

    ctx.addEventListener('statechange', () => this.syncStatus());
    // iOS and some Androids suspend on interruption; try again on the next touch.
    document.addEventListener('pointerdown', () => this.wakeIfNeeded(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.wakeIfNeeded();
    });
    this.syncStatus();
    this.applyMaster(0.01);
  }

  private wakeIfNeeded(): void {
    if (this.ctx && this.ctx.state !== 'running' && this.enabled && this.voices.size > 0) {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  private syncStatus(): void {
    if (!this.ctx) return;
    this.setStatus(this.ctx.state === 'running' ? 'running' : 'suspended');
  }

  private setStatus(status: AudioStatus): void {
    if (status === this.status) return;
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }

  /** Reconciles playing voices with the desired mix, crossfading every change. */
  sync(desired: SoundMix, fade = DEFAULT_FADE): void {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus) return;
    // Voices already fading out count as stopped; start() revives them if wanted again.
    const current = new Map(
      [...this.voices]
        .filter(([, v]) => v.disposeTimer === undefined)
        .map(([id, v]) => [id, v.volume] as const),
    );
    const plan = planMix(current, desired);

    plan.stop.forEach((id) => this.stop(id, fade));
    plan.update.forEach(([id, volume]) => this.setVolume(id, volume, fade / 2));
    plan.start.forEach(([id, volume]) => this.start(id, volume, fade));
    this.scheduleIdleCheck();
  }

  private start(id: SoundId, volume: number, fade: number): void {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus) return;
    const existing = this.voices.get(id);
    if (existing) {
      // It was fading out; bring it back instead of doubling it.
      window.clearTimeout(existing.disposeTimer);
      existing.disposeTimer = undefined;
      this.setVolume(id, volume, fade);
      return;
    }
    try {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(bus);
      const graph = GENERATORS[id](ctx, gain);
      this.voices.set(id, { gain, graph, volume });
      this.ramp(gain.gain, perceptualGain(volume), fade);
      if (ctx.state !== 'running' && this.enabled) void ctx.resume().catch(() => undefined);
    } catch {
      /* this voice stays silent; the rest of the experience continues */
    }
  }

  private stop(id: SoundId, fade: number): void {
    const voice = this.voices.get(id);
    if (!voice || voice.disposeTimer !== undefined) return;
    voice.volume = 0;
    this.ramp(voice.gain.gain, 0, fade);
    voice.disposeTimer = window.setTimeout(
      () => {
        voice.graph.dispose();
        voice.gain.disconnect();
        this.voices.delete(id);
        this.scheduleIdleCheck();
      },
      fade * 1000 + 150,
    );
  }

  setVolume(id: SoundId, volume: number, fade = 0.4): void {
    const voice = this.voices.get(id);
    if (!voice) return;
    voice.volume = volume;
    this.ramp(voice.gain.gain, perceptualGain(volume), fade);
  }

  /** Master volume and the global sound switch. */
  setMaster(volume: number, enabled: boolean, fade = 1.2): void {
    this.masterVolume = volume;
    this.enabled = enabled;
    this.applyMaster(fade);
    if (enabled) this.wakeIfNeeded();
    this.scheduleIdleCheck();
  }

  /** A multiplier on top of master: sleep mode uses it to fade the world out slowly. */
  setMasterScale(scale: number, fade = 2): void {
    this.masterScale = Math.min(1, Math.max(0, scale));
    this.applyMaster(fade);
  }

  private applyMaster(fade: number): void {
    if (!this.master) return;
    const target = this.enabled ? perceptualGain(this.masterVolume) * this.masterScale : 0;
    this.ramp(this.master.gain, target, fade);
  }

  private ramp(param: AudioParam, target: number, seconds: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    // setTargetAtTime is exponential-ish and never clicks; a third of the fade reaches ~95%.
    param.setTargetAtTime(target, now, Math.max(0.01, seconds / 3));
  }

  /** 0 – 1 loudness of what is actually coming out of the speakers. */
  getLevel(): number {
    if (!this.analyser || !this.samples || this.ctx?.state !== 'running') return 0;
    this.analyser.getByteTimeDomainData(this.samples);
    let sum = 0;
    for (let i = 0; i < this.samples.length; i++) {
      const v = ((this.samples[i] ?? 128) - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.samples.length) * 3);
  }

  playChime(): void {
    if (!this.ctx || !this.bus || !this.enabled) return;
    try {
      chime(this.ctx, this.bus);
    } catch {
      /* silence is an acceptable ending */
    }
  }

  private scheduleIdleCheck(): void {
    window.clearTimeout(this.idleTimer);
    this.idleTimer = window.setTimeout(() => {
      const silent = !this.enabled || this.voices.size === 0;
      if (silent && this.ctx?.state === 'running') void this.ctx.suspend().catch(() => undefined);
    }, IDLE_SUSPEND_MS);
  }

  destroy(): void {
    window.clearTimeout(this.idleTimer);
    this.voices.forEach((voice) => {
      window.clearTimeout(voice.disposeTimer);
      voice.graph.dispose();
      voice.gain.disconnect();
    });
    this.voices.clear();
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.listeners.clear();
  }
}

export const audio = new AudioManager();
