import { noiseBurst, VoiceGraph } from '../synthesis';
import { bell, bowl, brush, keys, kick, padNote, reverbImpulse } from './instruments';
import { midiToHz, scaleNotes, type ScaleName } from './theory';

/**
 * A recipe describes a piece; the composer plays it forever, never quite the
 * same way twice. Everything is slow, consonant and quiet by design.
 */
export interface Recipe {
  /** MIDI note of the tonal center. */
  root: number;
  /** Chords as semitone offsets from the root, in voicing order. */
  chords: readonly (readonly number[])[];
  chordSeconds: number;
  /** 0 – 1 reverb send. */
  reverb: number;
  pad?: { wave: OscillatorType; cutoff: number; level: number; detune: number };
  drone?: { level: number };
  bells?: { every: number; level: number; decay: number; scale: ScaleName; octave: number };
  arp?: { step: number; level: number; octave: number };
  bowl?: { every: number; level: number; octave: number };
  /** Soft drums, tape wobble and vinyl dust; chords are played on keys once per bar. */
  lofi?: { bpm: number; level: number };
}

const LOOKAHEAD = 3;
const TICK_MS = 400;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pickFrom = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)] as T;

/**
 * Runs `step(when)` at the times it returns, scheduled ahead on the audio clock.
 * Returning the next time keeps each voice's rhythm independent.
 */
function loop(g: VoiceGraph, first: number, step: (when: number) => number): void {
  let next = first;
  const tick = () => {
    if (g.disposed) return;
    if (next < g.ctx.currentTime) next = g.ctx.currentTime + 0.05;
    while (next < g.ctx.currentTime + LOOKAHEAD) next = step(next);
    g.timeout(tick, TICK_MS);
  };
  tick();
}

export function createPiece(ctx: AudioContext, out: AudioNode, recipe: Recipe): VoiceGraph {
  const g = new VoiceGraph(ctx);
  const start = ctx.currentTime + 0.1;

  // Space: a dry path and a reverb path, fed by one send.
  const send = g.gain(1);
  const dry = g.gain(1 - recipe.reverb * 0.45);
  const convolver = g.node(ctx.createConvolver());
  convolver.buffer = reverbImpulse(ctx);
  const wet = g.gain(recipe.reverb);
  send.connect(dry).connect(out);
  send.connect(convolver).connect(wet).connect(out);

  // Which chord sounds when, so melodic voices stay in harmony.
  const timeline: { at: number; notes: number[] }[] = [];
  const chordAt = (time: number): number[] => {
    for (let i = timeline.length - 1; i >= 0; i--) {
      const entry = timeline[i];
      if (entry && entry.at <= time) return entry.notes;
    }
    return timeline[0]?.notes ?? [recipe.root];
  };

  // Pads: each chord swells in while the last one is still fading.
  let padBus: AudioNode | null = null;
  if (recipe.pad) {
    const filter = g.filter('lowpass', recipe.pad.cutoff, 0.5);
    g.lfo(filter.frequency, 0.03, recipe.pad.cutoff * 0.35);
    filter.connect(send);
    padBus = filter;
  }

  // Lo-fi: keys through a slightly wobbling tape delay, plus drums and dust.
  const { lofi } = recipe;
  let keysBus: AudioNode | null = null;
  if (lofi) {
    const tape = g.node(ctx.createDelay(0.05));
    tape.delayTime.value = 0.012;
    g.lfo(tape.delayTime, 0.35, 0.0016);
    const warmth = g.filter('lowpass', 2600, 0.4);
    tape.connect(warmth).connect(send);
    keysBus = tape;
  }

  let chordIndex = 0;
  loop(g, start, (when) => {
    const offsets = recipe.chords[chordIndex % recipe.chords.length] ?? [0];
    chordIndex++;
    const notes = offsets.map((offset) => recipe.root + offset);
    timeline.push({ at: when, notes });
    if (timeline.length > 8) timeline.shift();

    if (padBus && recipe.pad) {
      for (const midi of notes) {
        padNote(g, padBus, {
          midi,
          start: when,
          duration: recipe.chordSeconds,
          attack: Math.min(5, recipe.chordSeconds * 0.4),
          release: recipe.chordSeconds * 0.45,
          level: recipe.pad.level / notes.length,
          wave: recipe.pad.wave,
          detune: recipe.pad.detune,
        });
      }
    }
    if (keysBus && lofi) {
      const bus = keysBus;
      // A gentle, human strum: lowest note first, a few milliseconds apart.
      notes.forEach((midi, i) =>
        keys(g, bus, {
          midi,
          when: when + i * rand(0.012, 0.03),
          level: lofi.level * 0.5,
          decay: recipe.chordSeconds * 0.95,
          pan: rand(-0.25, 0.25),
        }),
      );
    }
    return when + recipe.chordSeconds;
  });

  if (recipe.drone) {
    const level = g.gain(recipe.drone.level);
    g.lfo(level.gain, 0.04, recipe.drone.level * 0.3);
    level.connect(send);
    for (const [offset, amount] of [
      [-12, 1],
      [-5, 0.35],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.frequency.value = midiToHz(recipe.root + offset);
      const gain = g.gain(amount);
      osc.connect(gain).connect(level);
      g.source(osc, start);
    }
  }

  if (recipe.bells) {
    const b = recipe.bells;
    const scale = scaleNotes(recipe.root + 12 * b.octave, b.scale, 2);
    g.schedule(b.every, (when) => {
      if (when < start + 2) return;
      // Half the time a chord tone, half the time any note of the scale.
      const chord = chordAt(when).map((n) => n + 12 * b.octave);
      const midi = Math.random() < 0.5 ? pickFrom(chord) : pickFrom(scale);
      bell(g, send, {
        midi,
        when,
        level: b.level * rand(0.6, 1),
        decay: b.decay * rand(0.8, 1.2),
        pan: rand(-0.6, 0.6),
      });
    });
  }

  if (recipe.arp) {
    const a = recipe.arp;
    let step = 0;
    loop(g, start + 1.5, (when) => {
      const chord = [...chordAt(when)].sort((x, y) => x - y);
      // Up and back down the chord, like water finding its way.
      const cycle = [...chord, ...chord.slice(1, -1).reverse()];
      const midi = (cycle[step % cycle.length] ?? recipe.root) + 12 * a.octave;
      step++;
      bell(g, send, {
        midi,
        when,
        level: a.level * rand(0.75, 1),
        decay: 1.8,
        pan: rand(-0.3, 0.3),
      });
      return when + a.step * (Math.random() < 0.1 ? 2 : 1);
    });
  }

  if (recipe.bowl) {
    const b = recipe.bowl;
    loop(g, start + 0.5, (when) => {
      bowl(g, send, {
        midi: recipe.root + 12 * b.octave,
        when,
        level: b.level,
        pan: rand(-0.2, 0.2),
      });
      return when + b.every * rand(0.85, 1.2);
    });
  }

  if (recipe.lofi) {
    const { bpm, level } = recipe.lofi;
    const beat = 60 / bpm;
    const drums = g.filter('lowpass', 5200, 0.5);
    drums.connect(out);
    let count = 0;
    // Eighth notes with a lazy swing.
    loop(g, start + recipe.chordSeconds, (when) => {
      const eighth = count % 8;
      count++;
      // Kick on one and three, and now and then a lazy pickup.
      if (eighth === 0 || eighth === 4 || (eighth === 5 && Math.random() < 0.3)) {
        kick(g, drums, when, level * 0.9);
      }
      if (eighth === 2 || eighth === 6) {
        brush(g, drums, { when, level: level * 0.22, frequency: 1900, decay: 0.22, pan: 0.1 });
      }
      brush(g, drums, {
        when,
        level: level * (eighth % 2 === 0 ? 0.07 : 0.045),
        frequency: 8000,
        decay: 0.04,
        pan: -0.2,
      });
      return when + beat * (eighth % 2 === 0 ? 0.58 : 0.42);
    });
    // Vinyl dust.
    g.schedule(0.35, (when) =>
      noiseBurst(g, out, when, {
        duration: rand(0.002, 0.008),
        frequency: rand(2500, 7000),
        q: 1,
        peak: level * rand(0.02, 0.08),
        pan: rand(-0.7, 0.7),
        attack: 0.0005,
      }),
    );
  }

  return g;
}
