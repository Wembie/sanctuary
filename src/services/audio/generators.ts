import type { SoundId } from './catalog';
import { noiseBurst, noiseBuffer, VoiceGraph } from './synthesis';

/** Builds a voice into `out` and returns the graph that owns it. */
export type SoundFactory = (ctx: AudioContext, out: AudioNode) => VoiceGraph;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const rain: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  // The hiss of rain everywhere.
  g.noise('pink')
    .connect(g.filter('highpass', 450, 0.5))
    .connect(g.filter('lowpass', 6500, 0.5))
    .connect(g.gain(0.5))
    .connect(out);
  // Body: water on surfaces nearby.
  g.noise('brown').connect(g.filter('lowpass', 900)).connect(g.gain(0.32)).connect(out);
  // Individual drops.
  g.schedule(0.07, (when) =>
    noiseBurst(g, out, when, {
      duration: rand(0.015, 0.045),
      frequency: rand(2200, 6500),
      q: 3,
      peak: rand(0.01, 0.05),
      pan: rand(-0.8, 0.8),
    }),
  );
  return g;
};

const storm: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  const hiss = g.gain(0.5);
  g.noise('pink')
    .connect(g.filter('highpass', 300, 0.5))
    .connect(g.filter('lowpass', 5200, 0.5))
    .connect(hiss)
    .connect(out);
  g.lfo(hiss.gain, 0.05, 0.12);
  g.noise('brown').connect(g.filter('lowpass', 650)).connect(g.gain(0.5)).connect(out);

  // Distant thunder: rare, slow, low. Never a crack.
  g.schedule(28, (when) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 'brown');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    const duration = rand(5, 8);
    lp.frequency.setValueAtTime(rand(260, 420), when);
    lp.frequency.exponentialRampToValueAtTime(70, when + duration);
    const env = ctx.createGain();
    const peak = rand(0.5, 0.9);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.exponentialRampToValueAtTime(peak, when + rand(0.5, 1.4));
    env.gain.exponentialRampToValueAtTime(peak * 0.45, when + 2.2);
    env.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    src.connect(lp).connect(env).connect(out);
    g.oneShot(src, [lp, env]);
    src.start(when, Math.random() * 4, duration + 0.1);
  });
  return g;
};

const ocean: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  // Two wave layers at unrelated periods, so the sea never quite repeats.
  const layer = (period: number, pan: number, color: 'brown' | 'pink', base: number) => {
    const lp = g.filter('lowpass', base, 0.6);
    const level = g.gain(0.26);
    g.noise(color).connect(lp).connect(level).connect(g.pan(pan)).connect(out);
    g.lfo(lp.frequency, 1 / period, base * 0.7);
    g.lfo(level.gain, 1 / period, 0.22);
  };
  layer(9.5, -0.35, 'brown', 520);
  layer(13.7, 0.35, 'pink', 700);
  // Underwater pressure.
  g.noise('brown').connect(g.filter('lowpass', 160)).connect(g.gain(0.2)).connect(out);
  return g;
};

const wind: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  const band = g.filter('bandpass', 420, 0.8);
  const level = g.gain(0.85);
  g.noise('pink').connect(band).connect(level).connect(out);
  g.lfo(band.frequency, 0.043, 220);
  g.lfo(band.frequency, 0.11, 60);
  g.lfo(level.gain, 0.061, 0.45);
  // A faint whistle high up.
  const whistle = g.filter('bandpass', 1300, 7);
  const whistleLevel = g.gain(0.035);
  g.noise('pink').connect(whistle).connect(whistleLevel).connect(g.pan(0.4)).connect(out);
  g.lfo(whistle.frequency, 0.027, 260);
  g.lfo(whistleLevel.gain, 0.08, 0.03);
  return g;
};

const fire: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  const bed = g.gain(0.5);
  g.noise('brown').connect(g.filter('lowpass', 340)).connect(bed).connect(out);
  g.lfo(bed.gain, 0.31, 0.12);
  g.noise('pink').connect(g.filter('highpass', 3200)).connect(g.gain(0.025)).connect(out);
  // Crackles, with the occasional softer pop.
  g.schedule(0.16, (when) => {
    const pop = Math.random() < 0.08;
    noiseBurst(g, out, when, {
      duration: pop ? rand(0.03, 0.06) : rand(0.004, 0.02),
      frequency: pop ? rand(700, 1400) : rand(1400, 4800),
      q: pop ? 1 : 1.6,
      peak: pop ? rand(0.2, 0.35) : rand(0.03, 0.16),
      pan: rand(-0.45, 0.45),
      attack: 0.001,
    });
  });
  return g;
};

const forest: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  const leaves = g.gain(0.13);
  g.noise('pink').connect(g.filter('highpass', 1800)).connect(leaves).connect(out);
  g.lfo(leaves.gain, 0.09, 0.08);
  g.noise('brown').connect(g.filter('lowpass', 300)).connect(g.gain(0.3)).connect(out);

  // Birds: sparse, far away, softened by a little echo.
  const distance = g.filter('lowpass', 5200);
  const echo = g.node(ctx.createDelay(1));
  echo.delayTime.value = 0.23;
  const feedback = g.gain(0.28);
  distance.connect(out);
  distance.connect(echo).connect(feedback).connect(echo);
  feedback.connect(out);

  g.schedule(16, (when) => {
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = rand(2300, 4000);
    const pan = rand(-0.7, 0.7);
    let t = when;
    for (let i = 0; i < notes; i++) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const p = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      const length = rand(0.07, 0.14);
      const f = base * rand(0.9, 1.1);
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * rand(1.15, 1.45), t + length);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(rand(0.015, 0.035), t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + length);
      osc.connect(env);
      if (p) {
        p.pan.value = pan;
        env.connect(p).connect(distance);
      } else {
        env.connect(distance);
      }
      g.oneShot(osc, p ? [env, p] : [env]);
      osc.start(t);
      osc.stop(t + length + 0.02);
      t += length + rand(0.05, 0.16);
    }
  });
  return g;
};

const space: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  const tone = g.filter('lowpass', 700, 0.7);
  const level = g.gain(0.075);
  tone.connect(level).connect(out);
  g.lfo(tone.frequency, 0.021, 260);
  // A1, E2, A2, E3, B3: open fifths, no tension.
  [55, 82.41, 110, 164.81, 246.94].forEach((frequency, index) => {
    const voice = g.gain(index > 2 ? 0.35 : 0.6);
    voice.connect(tone);
    g.lfo(voice.gain, 0.025 + index * 0.011, 0.25);
    for (const detune of [-4, 4]) {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'triangle' : 'sine';
      osc.frequency.value = frequency;
      osc.detune.value = detune;
      osc.connect(voice);
      g.source(osc);
    }
  });
  const shimmer = g.gain(0.012);
  g.noise('pink')
    .connect(g.filter('bandpass', 3200, 3))
    .connect(shimmer)
    .connect(out);
  g.lfo(shimmer.gain, 0.05, 0.01);
  return g;
};

const deep: SoundFactory = (ctx, out) => {
  const g = new VoiceGraph(ctx);
  g.noise('brown').connect(g.filter('lowpass', 420)).connect(g.gain(0.5)).connect(out);
  return g;
};

export const GENERATORS: Record<SoundId, SoundFactory> = {
  rain,
  storm,
  ocean,
  wind,
  fire,
  forest,
  space,
  deep,
};

/** A soft, bell-like tone for gentle endings. Never an alarm. */
export function chime(ctx: AudioContext, out: AudioNode, when = ctx.currentTime): void {
  const fundamental = 392;
  [1, 2.76, 5.4].forEach((ratio, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = fundamental * ratio;
    const peak = [0.12, 0.04, 0.015][i] ?? 0.01;
    const decay = [6, 3.5, 2][i] ?? 2;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    osc.connect(env).connect(out);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
    osc.start(when);
    osc.stop(when + decay + 0.1);
  });
}
