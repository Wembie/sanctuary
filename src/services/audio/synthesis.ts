/**
 * Small building blocks for procedural ambience. Everything here produces
 * sound from noise and oscillators: no samples, no licensing questions.
 */

export type NoiseColor = 'white' | 'pink' | 'brown';

const NOISE_SECONDS = 6;
const noiseCache = new WeakMap<BaseAudioContext, Map<NoiseColor, AudioBuffer>>();

function fillNoise(data: Float32Array, color: NoiseColor): void {
  if (color === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return;
  }
  if (color === 'brown') {
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    return;
  }
  // Pink: Paul Kellet's refined method.
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

/** Stereo noise with independent channels, cached per context. */
export function noiseBuffer(ctx: BaseAudioContext, color: NoiseColor): AudioBuffer {
  let byColor = noiseCache.get(ctx);
  if (!byColor) {
    byColor = new Map();
    noiseCache.set(ctx, byColor);
  }
  const cached = byColor.get(color);
  if (cached) return cached;

  const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) fillNoise(buffer.getChannelData(channel), color);
  byColor.set(color, buffer);
  return buffer;
}

export type Dispose = () => void;

/**
 * Tracks every node, source and timer a voice creates so it can be torn down
 * in one call. Prevents the classic Web Audio leak: orphaned, still-running graphs.
 */
export class VoiceGraph {
  private readonly nodes: AudioNode[] = [];
  private readonly sources: AudioScheduledSourceNode[] = [];
  private readonly timers = new Set<number>();
  disposed = false;

  constructor(readonly ctx: AudioContext) {}

  node<T extends AudioNode>(node: T): T {
    this.nodes.push(node);
    return node;
  }

  source<T extends AudioScheduledSourceNode>(source: T, when = 0): T {
    this.sources.push(source);
    source.start(when);
    return source;
  }

  noise(color: NoiseColor): AudioBufferSourceNode {
    const src = this.ctx.createBufferSource();
    src.buffer = noiseBuffer(this.ctx, color);
    src.loop = true;
    this.sources.push(src);
    // Random offset so layered noise sources never phase-align.
    src.start(0, Math.random() * NOISE_SECONDS);
    return src;
  }

  filter(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const f = this.node(this.ctx.createBiquadFilter());
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = q;
    return f;
  }

  gain(value: number): GainNode {
    const g = this.node(this.ctx.createGain());
    g.gain.value = value;
    return g;
  }

  pan(value: number): AudioNode {
    if (typeof this.ctx.createStereoPanner !== 'function') return this.gain(1);
    const p = this.node(this.ctx.createStereoPanner());
    p.pan.value = value;
    return p;
  }

  /** Slow sine modulation of an AudioParam around its current value. */
  lfo(param: AudioParam, frequency: number, depth: number, type: OscillatorType = 'sine'): void {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    const amount = this.gain(depth);
    osc.connect(amount).connect(param);
    this.source(osc);
  }

  /**
   * Schedules random one-shot events slightly ahead of time on the audio clock.
   * Timers throttle in background tabs; the lookahead keeps sound continuous.
   */
  schedule(meanIntervalSec: number, spawn: (when: number) => void, lookahead = 1.6): void {
    let cursor = this.ctx.currentTime + Math.random() * meanIntervalSec;
    const tick = () => {
      if (this.disposed) return;
      const horizon = this.ctx.currentTime + lookahead;
      // Don't try to catch up on a backlog after a long suspension.
      if (cursor < this.ctx.currentTime) cursor = this.ctx.currentTime + 0.05;
      while (cursor < horizon) {
        spawn(cursor);
        // Exponential gaps feel natural (Poisson process).
        cursor += -Math.log(1 - Math.random()) * meanIntervalSec;
      }
      this.timeout(tick, 500);
    };
    tick();
  }

  timeout(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
  }

  /** A self-cleaning one-shot: nodes disconnect when the source ends. */
  oneShot(source: AudioScheduledSourceNode, chain: AudioNode[]): void {
    source.onended = () => {
      source.disconnect();
      chain.forEach((n) => n.disconnect());
    };
  }

  dispose(): void {
    this.disposed = true;
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers.clear();
    for (const src of this.sources) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      src.disconnect();
    }
    this.nodes.forEach((n) => n.disconnect());
  }
}

/** A short filtered noise burst: raindrops, crackles, leaves. */
export function noiseBurst(
  graph: VoiceGraph,
  out: AudioNode,
  when: number,
  opts: {
    duration: number;
    frequency: number;
    q: number;
    peak: number;
    pan: number;
    attack?: number;
  },
): void {
  const { ctx } = graph;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white');
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = opts.frequency;
  bp.Q.value = opts.q;
  const env = ctx.createGain();
  const attack = opts.attack ?? 0.002;
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(opts.peak, when + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, when + attack + opts.duration);
  const chain: AudioNode[] = [bp, env];
  let tail: AudioNode = env;
  if (typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = opts.pan;
    chain.push(p);
    env.connect(p);
    tail = p;
  }
  src.connect(bp).connect(env);
  tail.connect(out);
  graph.oneShot(src, chain);
  src.start(when, Math.random() * 5, attack + opts.duration + 0.05);
}
