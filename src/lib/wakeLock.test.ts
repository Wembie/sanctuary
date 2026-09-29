import { describe, expect, it } from 'vitest';
import { ScreenWakeLock, type WakeLockApi, type WakeLockSentinelLike } from './wakeLock';

class FakeSentinel implements WakeLockSentinelLike {
  released = false;
  private listeners: (() => void)[] = [];
  addEventListener(_type: 'release', listener: () => void) {
    this.listeners.push(listener);
  }
  async release() {
    if (this.released) return;
    this.released = true;
    this.listeners.forEach((l) => l());
  }
}

function fakeApi(options: { fail?: boolean } = {}) {
  const sentinels: FakeSentinel[] = [];
  let resolveNext: ((s: FakeSentinel) => void) | null = null;
  const api: WakeLockApi & { deferred: boolean } = {
    deferred: false,
    request: async () => {
      if (options.fail) throw new DOMException('Low battery', 'NotAllowedError');
      const sentinel = new FakeSentinel();
      sentinels.push(sentinel);
      if (api.deferred) await new Promise<FakeSentinel>((r) => (resolveNext = r));
      return sentinel;
    },
  };
  return { api, sentinels, resolve: () => resolveNext?.(sentinels.at(-1) as FakeSentinel) };
}

describe('ScreenWakeLock', () => {
  it('acquires and releases', async () => {
    const { api, sentinels } = fakeApi();
    const lock = new ScreenWakeLock(api, () => true);
    await lock.set(true);
    expect(lock.held).toBe(true);
    await lock.set(false);
    expect(lock.held).toBe(false);
    expect(sentinels[0]?.released).toBe(true);
  });

  it('does not stack requests', async () => {
    const { api, sentinels } = fakeApi();
    const lock = new ScreenWakeLock(api, () => true);
    await lock.set(true);
    await lock.set(true);
    await lock.resume();
    expect(sentinels).toHaveLength(1);
  });

  it('re-acquires after the browser drops the lock (tab hidden, then visible)', async () => {
    const { api, sentinels } = fakeApi();
    let visible = true;
    const lock = new ScreenWakeLock(api, () => visible);
    await lock.set(true);
    visible = false;
    await sentinels[0]?.release(); // what the browser does on hide
    expect(lock.held).toBe(false);
    await lock.resume(); // still hidden: nothing
    expect(sentinels).toHaveLength(1);
    visible = true;
    await lock.resume();
    expect(lock.held).toBe(true);
    expect(sentinels).toHaveLength(2);
  });

  it('does not resume once no longer wanted', async () => {
    const { api, sentinels } = fakeApi();
    const lock = new ScreenWakeLock(api, () => true);
    await lock.set(true);
    await lock.set(false);
    await lock.resume();
    expect(sentinels).toHaveLength(1);
    expect(lock.held).toBe(false);
  });

  it('releases a lock that arrives after it was turned off', async () => {
    const { api, sentinels, resolve } = fakeApi();
    api.deferred = true;
    const lock = new ScreenWakeLock(api, () => true);
    const pending = lock.set(true);
    await lock.set(false);
    resolve();
    await pending;
    expect(lock.held).toBe(false);
    expect(sentinels[0]?.released).toBe(true);
  });

  it('is silent when unsupported or refused', async () => {
    const unsupported = new ScreenWakeLock(undefined, () => true);
    expect(unsupported.supported).toBe(false);
    await expect(unsupported.set(true)).resolves.toBeUndefined();

    const refused = new ScreenWakeLock(fakeApi({ fail: true }).api, () => true);
    await expect(refused.set(true)).resolves.toBeUndefined();
    expect(refused.held).toBe(false);
  });
});
