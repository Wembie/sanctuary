import { noiseBuffer, type VoiceGraph } from '../synthesis';
import { midiToHz } from './theory';

/**
 * One-shot instruments for the generative composer. Each schedules itself
 * on the audio clock at `when` and cleans up its nodes when it ends.
 */

const IR_CACHE = new WeakMap<BaseAudioContext, AudioBuffer>();

/** A long, dark hall made from decaying noise. Generated once per context. */
export function reverbImpulse(ctx: BaseAudioContext, seconds = 5.5): AudioBuffer {
  const cached = IR_CACHE.get(ctx);
  if (cached) return cached;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lowpassed = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // One-pole lowpass: the tail darkens as it fades, like a real room.
      lowpassed += 0.35 * (Math.random() * 2 - 1 - lowpassed);
      data[i] = lowpassed * (1 - t) ** 3.2;
    }
  }
  IR_CACHE.set(ctx, buffer);
  return buffer;
}

function panner(ctx: BaseAudioContext, pan: number): AudioNode | null {
  if (typeof ctx.createStereoPanner !== 'function') return null;
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  return p;
}

/** Connects a chain, ending with an optional panner, into `out`. Returns nodes to clean up. */
function finish(ctx: BaseAudioContext, last: AudioNode, out: AudioNode, pan: number): AudioNode[] {
  const p = panner(ctx, pan);
  if (p) {
    last.connect(p).connect(out);
    return [p];
  }
  last.connect(out);
  return [];
}

export interface PadNoteOptions {
  midi: number;
  start: number;
  duration: number;
  attack: number;
  release: number;
  level: number;
  wave: OscillatorType;
  detune: number;
}

/** A soft pad voice: two detuned oscillators with a slow swell and a long release. */
export function padNote(g: VoiceGraph, out: AudioNode, o: PadNoteOptions): void {
  const { ctx } = g;
  const env = ctx.createGain();
  const end = o.start + o.duration + o.release;
  env.gain.setValueAtTime(0, o.start);
  env.gain.linearRampToValueAtTime(o.level, o.start + o.attack);
  env.gain.setValueAtTime(o.level, o.start + o.duration);
  env.gain.linearRampToValueAtTime(0, end);
  env.connect(out);
  const oscillators = [-o.detune, o.detune].map((cents) => {
    const osc = ctx.createOscillator();
    osc.type = o.wave;
    osc.frequency.value = midiToHz(o.midi);
    osc.detune.value = cents;
    osc.connect(env);
    osc.start(o.start);
    osc.stop(end + 0.05);
    return osc;
  });
  const [first] = oscillators;
  if (first) {
    first.onended = () => {
      oscillators.forEach((osc) => osc.disconnect());
      env.disconnect();
    };
  }
}

/** A glassy bell or celesta note: fundamental plus a soft octave, quick attack, long decay. */
export function bell(
  g: VoiceGraph,
  out: AudioNode,
  o: { midi: number; when: number; level: number; decay: number; pan: number },
): void {
  const { ctx } = g;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, o.when);
  env.gain.linearRampToValueAtTime(o.level, o.when + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, o.when + o.decay);
  const tail = finish(ctx, env, out, o.pan);
  const partials: [number, number][] = [
    [1, 1],
    [2, 0.28],
    [3.01, 0.07],
  ];
  const nodes: AudioNode[] = [env, ...tail];
  let lead: OscillatorNode | null = null;
  for (const [ratio, amount] of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = midiToHz(o.midi) * ratio;
    gain.gain.value = amount;
    osc.connect(gain).connect(env);
    osc.start(o.when);
    osc.stop(o.when + o.decay + 0.05);
    nodes.push(osc, gain);
    lead ??= osc;
  }
  if (lead) lead.onended = () => nodes.forEach((n) => n.disconnect());
}

/** A singing bowl: inharmonic partials, slow beating, a very long ring. */
export function bowl(
  g: VoiceGraph,
  out: AudioNode,
  o: { midi: number; when: number; level: number; pan: number },
): void {
  const { ctx } = g;
  const base = midiToHz(o.midi);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, o.when);
  env.gain.linearRampToValueAtTime(o.level, o.when + 0.04);
  env.gain.exponentialRampToValueAtTime(0.0001, o.when + 14);
  const nodes: AudioNode[] = [env, ...finish(ctx, env, out, o.pan)];
  let lead: OscillatorNode | null = null;
  // Measured-ish ratios of a Tibetan bowl; each partial beats against a twin.
  const partials: [number, number, number][] = [
    [1, 1, 12],
    [2.71, 0.45, 8],
    [5.12, 0.18, 5],
    [8.0, 0.06, 3],
  ];
  for (const [ratio, amount, decay] of partials) {
    for (const beat of [-1.2, 1.2]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = base * ratio + beat * ratio * 0.5;
      gain.gain.setValueAtTime(amount * 0.5, o.when);
      gain.gain.exponentialRampToValueAtTime(0.0001, o.when + decay);
      osc.connect(gain).connect(env);
      osc.start(o.when);
      osc.stop(o.when + 14.1);
      nodes.push(osc, gain);
      lead ??= osc;
    }
  }
  if (lead) lead.onended = () => nodes.forEach((n) => n.disconnect());
}

/** An electric-piano-ish tone for lo-fi chords: sine with a bell-like second partial. */
export function keys(
  g: VoiceGraph,
  out: AudioNode,
  o: { midi: number; when: number; level: number; decay: number; pan: number },
): void {
  const { ctx } = g;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, o.when);
  env.gain.linearRampToValueAtTime(o.level, o.when + 0.012);
  env.gain.exponentialRampToValueAtTime(o.level * 0.35, o.when + 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, o.when + o.decay);
  const nodes: AudioNode[] = [env, ...finish(ctx, env, out, o.pan)];
  const body = ctx.createOscillator();
  body.frequency.value = midiToHz(o.midi);
  const tine = ctx.createOscillator();
  tine.frequency.value = midiToHz(o.midi) * 4;
  const tineGain = ctx.createGain();
  tineGain.gain.setValueAtTime(0.12, o.when);
  tineGain.gain.exponentialRampToValueAtTime(0.0001, o.when + 0.4);
  body.connect(env);
  tine.connect(tineGain).connect(env);
  for (const osc of [body, tine]) {
    osc.start(o.when);
    osc.stop(o.when + o.decay + 0.05);
  }
  nodes.push(body, tine, tineGain);
  body.onended = () => nodes.forEach((n) => n.disconnect());
}

/** A soft, round kick. Felt more than heard. */
export function kick(g: VoiceGraph, out: AudioNode, when: number, level: number): void {
  const { ctx } = g;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.frequency.setValueAtTime(110, when);
  osc.frequency.exponentialRampToValueAtTime(42, when + 0.14);
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(level, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + 0.45);
  osc.connect(env).connect(out);
  osc.start(when);
  osc.stop(when + 0.5);
  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
  };
}

/** Filtered noise hit: brushed snare (low q, longer) or hat (high, short). */
export function brush(
  g: VoiceGraph,
  out: AudioNode,
  o: { when: number; level: number; frequency: number; decay: number; pan: number },
): void {
  const { ctx } = g;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 'white');
  const filter = ctx.createBiquadFilter();
  filter.type = o.frequency > 5000 ? 'highpass' : 'bandpass';
  filter.frequency.value = o.frequency;
  filter.Q.value = 0.8;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, o.when);
  env.gain.linearRampToValueAtTime(o.level, o.when + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, o.when + o.decay);
  src.connect(filter).connect(env);
  const nodes: AudioNode[] = [src, filter, env, ...finish(ctx, env, out, o.pan)];
  src.onended = () => nodes.forEach((n) => n.disconnect());
  src.start(o.when, Math.random() * 4, o.decay + 0.05);
}
