import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The sound graphs themselves are irrelevant here: record who asks for what.
const started: string[] = [];
vi.mock('./generators', () => ({
  GENERATORS: new Proxy(
    {},
    {
      get: (_target, id: string) => () => {
        started.push(id);
        return { dispose: () => undefined };
      },
    },
  ),
  chime: () => undefined,
}));
vi.mock('./music/composer', () => ({
  createPiece: () => {
    started.push('music');
    return { dispose: () => undefined };
  },
}));

/** Just enough of an AudioContext for the manager's own wiring. */
class FakeParam {
  value = 0;
  cancelScheduledValues() {}
  setValueAtTime(v: number) {
    this.value = v;
  }
  setTargetAtTime(v: number) {
    this.value = v;
  }
}
class FakeNode {
  gain = new FakeParam();
  threshold = new FakeParam();
  knee = new FakeParam();
  ratio = new FakeParam();
  attack = new FakeParam();
  release = new FakeParam();
  fftSize = 512;
  smoothingTimeConstant = 0;
  connect<T>(target: T): T {
    return target;
  }
  disconnect() {}
  getByteTimeDomainData() {}
}
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  destination = new FakeNode();
  createGain = () => new FakeNode();
  createDynamicsCompressor = () => new FakeNode();
  createAnalyser = () => new FakeNode();
  resume = () => Promise.resolve();
  suspend = () => Promise.resolve();
  close = () => Promise.resolve();
  addEventListener() {}
}

const track = {
  kind: 'generative' as const,
  id: 'slow-tide',
  category: 'Deep Relaxation' as const,
  recipe: { root: 50, chords: [[0]], chordSeconds: 10, reverb: 0 },
};

describe('AudioManager', () => {
  beforeEach(() => {
    started.length = 0;
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('plays a saved mix and music requested before audio was unlocked', async () => {
    const { AudioManager } = await import('./AudioManager');
    const manager = new AudioManager();

    // What happens on page load: stores restored from localStorage, no gesture yet.
    manager.setMaster(0.8, true);
    manager.sync({ rain: 0.6, fire: 0.4 });
    manager.playMusic(track, 0.6);
    expect(started).toEqual([]);

    // The first tap ("Enter Sanctuary") unlocks audio.
    manager.unlock();
    expect(started.sort()).toEqual(['fire', 'music', 'rain']);
    manager.destroy();
  });

  it('does not replay something that was turned off before the unlock', async () => {
    const { AudioManager } = await import('./AudioManager');
    const manager = new AudioManager();
    manager.sync({ rain: 0.6 });
    manager.sync({});
    manager.playMusic(track, 0.6);
    manager.playMusic(null, 0.6);
    manager.unlock();
    expect(started).toEqual([]);
    manager.destroy();
  });
});
