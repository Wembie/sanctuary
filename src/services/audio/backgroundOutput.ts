/**
 * Routes the Web Audio output through a real <audio> element.
 *
 * Why: phones treat an HTMLMediaElement as "media playback". That keeps sound
 * going with the screen locked (iOS suspends a bare AudioContext) and lets the
 * OS show lock-screen controls through the Media Session API.
 *
 * If anything is missing or play() is refused, the graph stays connected
 * straight to the speakers, exactly as before.
 */
export class BackgroundOutput {
  private element: HTMLAudioElement | null = null;
  private stream: MediaStreamAudioDestinationNode | null = null;
  private state: 'idle' | 'starting' | 'active' | 'failed' = 'idle';
  private pausingOnPurpose = false;
  private pauseTimer: number | undefined;
  private readonly externalPause = new Set<() => void>();

  constructor(
    private readonly ctx: AudioContext,
    private readonly source: AudioNode,
  ) {}

  get active(): boolean {
    return this.state === 'active';
  }

  /** Must run inside a user gesture (that's when play() is allowed). Safe to call repeatedly. */
  start(): void {
    if (this.state === 'active') {
      this.resume();
      return;
    }
    if (this.state !== 'idle') return;
    if (
      typeof this.ctx.createMediaStreamDestination !== 'function' ||
      typeof Audio === 'undefined'
    ) {
      this.state = 'failed';
      return;
    }
    try {
      const stream = this.ctx.createMediaStreamDestination();
      const element = new Audio();
      element.srcObject = stream.stream;
      element.setAttribute('playsinline', '');
      this.source.connect(stream);
      this.stream = stream;
      this.element = element;
      this.state = 'starting';
      element
        .play()
        .then(() => {
          // Only now drop the direct path, so there is never a moment of silence.
          this.source.disconnect(this.ctx.destination);
          this.state = 'active';
          element.addEventListener('pause', this.onPause);
        })
        .catch(() => this.fallBack());
    } catch {
      this.fallBack();
    }
  }

  /** The OS (lock screen, headphones unplugged) paused us: tell whoever cares. */
  onExternalPause(listener: () => void): () => void {
    this.externalPause.add(listener);
    return () => {
      this.externalPause.delete(listener);
    };
  }

  resume(): void {
    window.clearTimeout(this.pauseTimer);
    if (this.state !== 'active' || !this.element?.paused) return;
    void this.element.play().catch(() => undefined);
  }

  /** Pause the element after the master fade, so the OS shows "paused" too. */
  pauseAfter(seconds: number): void {
    if (this.state !== 'active') return;
    window.clearTimeout(this.pauseTimer);
    this.pauseTimer = window.setTimeout(() => {
      if (!this.element || this.element.paused) return;
      this.pausingOnPurpose = true;
      this.element.pause();
    }, seconds * 1000);
  }

  private readonly onPause = () => {
    if (this.pausingOnPurpose) {
      this.pausingOnPurpose = false;
      return;
    }
    this.externalPause.forEach((listener) => listener());
  };

  private fallBack(): void {
    this.state = 'failed';
    try {
      if (this.stream) this.source.disconnect(this.stream);
    } catch {
      /* already disconnected */
    }
    this.element = null;
    this.stream = null;
  }
}
