import type { ParticleKind } from '../../themes/environments';
import { clamp } from '../math';
import { createGlowSprite, createSoftSprite, withAlpha } from './sprites';

export interface ScenePreset {
  kind: ParticleKind;
  density: number;
  particle: string;
  glow: string;
  accent: string;
}

export interface EngineConfig {
  /** 'low' halves resolution, frame rate and particle count. */
  quality: 'high' | 'low';
  /** Draw a single still frame; no motion at all. */
  reduced: boolean;
  /** Particles switched off entirely. */
  enabled: boolean;
}

export interface EngineSignals {
  /** 0 – 1 breath fullness, or null when nothing is breathing. */
  breath: () => number | null;
  /** 0 – 1 audio loudness. */
  level: () => number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Resting velocity the particle relaxes back to after being pushed. */
  bx: number;
  by: number;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
  twinkle: number;
  life: number;
  maxLife: number;
  squash: number;
}

interface Pulse {
  x: number;
  y: number;
  age: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
}

interface Leaf {
  x: number;
  y: number;
  vy: number;
  sway: number;
  rotation: number;
  spin: number;
  size: number;
}

const PULSE_LIFE = 2.6;
const POINTER_RADIUS = 130;
const FADE_OUT_SECONDS = 1.2;
const FADE_IN_SECONDS = 2.4;
const MAX_PARTICLES = 320;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * The living background. One canvas, one loop, a few hundred particles at most.
 * Pauses itself when the tab is hidden and lowers its own quality if the
 * device struggles. Nothing in here should ever move fast.
 */
export class AmbientEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private preset: ScenePreset | null = null;
  private pending: ScenePreset | null = null;
  private visibility = 0;
  private particles: Particle[] = [];
  private bokeh: Particle[] = [];
  private pulses: Pulse[] = [];
  private shooting: ShootingStar | null = null;
  private nextShootingAt = rand(35, 90);
  private leaves: Leaf[] = [];
  private nextLeafAt = rand(8, 20);
  private sprite: HTMLCanvasElement | null = null;
  private glowSprite: HTMLCanvasElement | null = null;
  private softSprite: HTMLCanvasElement | null = null;
  private config: EngineConfig = { quality: 'high', reduced: false, enabled: true };
  private autoLow = false;
  private slowFrames = 0;
  private intensity = 1;
  private targetIntensity = 1;
  private breath = 0;
  private pointer = { x: 0, y: 0, active: false };
  private raf = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private readonly resizeObserver: ResizeObserver | null;
  private readonly onVisibility = () => {
    if (document.visibilityState === 'visible') this.last = performance.now();
  };

  /** Called once if the engine decides the device needs a lighter scene. */
  onDegrade: (() => void) | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly signals: EngineSignals,
  ) {
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) throw new Error('Canvas 2D unavailable');
    this.ctx = ctx;
    this.resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.resize()) : null;
    this.resizeObserver?.observe(canvas);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  get effectiveQuality(): 'high' | 'low' {
    return this.autoLow ? 'low' : this.config.quality;
  }

  configure(config: EngineConfig): void {
    const qualityChanged = config.quality !== this.config.quality;
    this.config = config;
    if (qualityChanged) {
      this.resize();
      this.rebalance();
    }
    this.refresh();
  }

  setPreset(preset: ScenePreset): void {
    const current = this.pending ?? this.preset;
    if (current && samePreset(current, preset)) return;
    if (!this.preset || this.config.reduced || !this.config.enabled) {
      this.apply(preset);
      this.visibility = this.config.reduced ? 1 : this.visibility;
    } else {
      this.pending = preset;
    }
    this.refresh();
  }

  setIntensity(value: number): void {
    this.targetIntensity = clamp(value, 0, 1);
    if (this.config.reduced) {
      this.intensity = this.targetIntensity;
      this.refresh();
    }
  }

  setPointer(x: number, y: number, active: boolean): void {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = active;
  }

  /** A tap on empty space: a slow ring and a gentle push. */
  pulse(x: number, y: number): void {
    if (this.config.reduced || !this.config.enabled) return;
    if (this.pulses.length > 6) this.pulses.shift();
    this.pulses.push({ x, y, age: 0 });
    const radius = 280;
    for (const p of this.particles) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy);
      if (d > radius || d < 1) continue;
      const force = (1 - d / radius) * 70 * (p.depth + 0.3);
      p.vx += (dx / d) * force;
      p.vy += (dy / d) * force;
    }
  }

  destroy(): void {
    this.stopLoop();
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.particles = [];
    this.bokeh = [];
  }

  /* ------------------------------------------------------------------ */

  private refresh(): void {
    if (!this.config.enabled || !this.preset) {
      this.stopLoop();
      this.clear();
      return;
    }
    if (this.config.reduced) {
      this.stopLoop();
      if (this.pending) this.apply(this.pending);
      this.visibility = 1;
      this.draw();
      return;
    }
    this.startLoop();
  }

  private apply(preset: ScenePreset): void {
    this.preset = preset;
    this.pending = null;
    this.sprite = createGlowSprite(preset.particle);
    this.glowSprite = createGlowSprite(preset.glow, 128, 0.1);
    this.softSprite = createSoftSprite(preset.particle);
    this.pulses = [];
    this.shooting = null;
    this.leaves = [];
    this.spawnAll();
  }

  private targetCount(): number {
    if (!this.preset) return 0;
    const megapixels = (this.width * this.height) / 1_000_000;
    const scale = clamp(megapixels, 0.4, 2.4) ** 0.75;
    const quality = this.effectiveQuality === 'low' ? 0.45 : 1;
    const minimum = this.preset.kind === 'clouds' ? 6 : 12;
    return Math.min(
      MAX_PARTICLES,
      Math.max(minimum, Math.round(this.preset.density * scale * quality)),
    );
  }

  private spawnAll(): void {
    const count = this.targetCount();
    this.particles = Array.from({ length: count }, () => this.create(true));
    this.bokeh =
      this.preset?.kind === 'rain'
        ? Array.from({ length: this.effectiveQuality === 'low' ? 8 : 16 }, () => this.createBokeh())
        : [];
  }

  /** Grow or shrink the particle list without a visible reset. */
  private rebalance(): void {
    if (!this.preset) return;
    const count = this.targetCount();
    if (this.particles.length > count) this.particles.length = count;
    while (this.particles.length < count) this.particles.push(this.create(true));
  }

  private create(initial: boolean): Particle {
    const w = this.width;
    const h = this.height;
    const depth = Math.random();
    const p: Particle = {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      bx: 0,
      by: 0,
      size: 1,
      alpha: 0.5,
      depth,
      phase: Math.random() * Math.PI * 2,
      twinkle: rand(0.2, 1),
      life: 0,
      maxLife: 1,
      squash: 1,
    };

    switch (this.preset?.kind ?? 'stars') {
      case 'stars': {
        p.depth = depth * depth;
        p.size = 0.55 + p.depth * 1.5 + (Math.random() < 0.04 ? 1.4 : 0);
        p.alpha = 0.35 + p.depth * 0.65;
        p.bx = -(0.5 + p.depth * 2.2);
        p.twinkle = rand(0.15, 0.9);
        if (!initial) p.x = w + 4;
        break;
      }
      case 'bubbles': {
        p.size = 0.8 + depth * 2.6;
        p.alpha = 0.12 + depth * 0.4;
        p.by = -(5 + depth * 16);
        p.twinkle = rand(0.3, 0.8);
        if (!initial) p.y = h + 10;
        break;
      }
      case 'motes': {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(1.5, 6);
        p.bx = Math.cos(angle) * speed;
        p.by = Math.sin(angle) * speed - 1;
        p.size = 0.7 + depth * 1.8;
        p.alpha = 0.15 + depth * 0.55;
        p.twinkle = rand(0.2, 0.6);
        if (!initial) this.placeAtEdge(p);
        break;
      }
      case 'rain': {
        p.depth = 0.25 + depth * 0.75;
        p.by = 360 + p.depth * 520;
        p.bx = p.by * 0.08;
        p.size = 8 + p.depth * 18;
        p.alpha = 0.06 + p.depth * 0.2;
        p.x = rand(-120, w + 20);
        if (!initial) p.y = -rand(20, h * 0.3);
        break;
      }
      case 'embers': {
        p.x = w / 2 + gaussian() * w * 0.2;
        p.y = initial ? h - Math.random() * h * 0.75 : h + 10;
        p.by = -(12 + depth * 28);
        p.bx = rand(-3, 3);
        p.size = 0.7 + depth * 1.6;
        p.alpha = 0.35 + depth * 0.6;
        p.maxLife = rand(5, 11);
        p.life = initial ? Math.random() * p.maxLife : 0;
        p.twinkle = rand(2, 5);
        break;
      }
      case 'clouds': {
        const scale = clamp(Math.max(w, h) / 900, 0.6, 1.6);
        p.size = rand(220, 520) * scale;
        p.squash = rand(0.38, 0.55);
        p.alpha = rand(0.05, 0.11);
        p.y = rand(-0.05, 0.8) * h;
        p.x = initial ? rand(-p.size / 2, w + p.size / 2) : -p.size / 2;
        p.bx = rand(3, 8) * (0.6 + depth * 0.6);
        break;
      }
    }
    p.vx = p.bx;
    p.vy = p.by;
    return p;
  }

  private placeAtEdge(p: Particle): void {
    if (Math.abs(p.bx) > Math.abs(p.by)) {
      p.x = p.bx > 0 ? -8 : this.width + 8;
      p.y = Math.random() * this.height;
    } else {
      p.y = p.by > 0 ? -8 : this.height + 8;
      p.x = Math.random() * this.width;
    }
  }

  private createBokeh(): Particle {
    const p = this.create(true);
    p.x = Math.random() * this.width;
    p.y = rand(0.35, 1) * this.height;
    p.size = rand(30, 110);
    p.alpha = rand(0.04, 0.12);
    p.twinkle = rand(0.05, 0.2);
    p.bx = rand(-1.2, 1.2);
    p.by = 0;
    p.vx = p.bx;
    p.vy = 0;
    return p;
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const maxDpr = this.effectiveQuality === 'low' ? 1 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    if (this.width > 0 && this.height > 0) {
      // Keep particles where they are, relative to the new size (mobile toolbars resize constantly).
      const sx = width / this.width;
      const sy = height / this.height;
      for (const p of this.particles) {
        p.x *= sx;
        p.y *= sy;
      }
    }
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.rebalance();
    if (this.config.reduced || !this.running) this.draw();
  }

  /* ------------------------------------------------------------------ */

  private startLoop(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stopLoop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private readonly frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const elapsed = now - this.last;
    // Low quality renders at ~30 fps: half the work, still smooth for slow motion.
    if (this.effectiveQuality === 'low' && elapsed < 30) return;
    this.last = now;
    const dt = Math.min(0.05, elapsed / 1000);
    this.watchPerformance(elapsed);
    this.update(dt);
    this.draw();
  };

  private watchPerformance(elapsed: number): void {
    if (this.autoLow || this.config.quality === 'low' || document.visibilityState !== 'visible')
      return;
    // Sustained frames slower than ~38 fps: step down once, quietly.
    this.slowFrames =
      elapsed > 26 && elapsed < 200 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 2);
    if (this.slowFrames > 150) {
      this.autoLow = true;
      this.resize();
      this.rebalance();
      this.onDegrade?.();
    }
  }

  private update(dt: number): void {
    this.time += dt;
    const t = this.time;
    const preset = this.preset;
    if (!preset) return;

    // Crossfade between scenes: out, swap, in.
    if (this.pending) {
      this.visibility = Math.max(0, this.visibility - dt / FADE_OUT_SECONDS);
      if (this.visibility === 0) this.apply(this.pending);
    } else if (this.visibility < 1) {
      this.visibility = Math.min(1, this.visibility + dt / FADE_IN_SECONDS);
    }
    this.intensity += (this.targetIntensity - this.intensity) * Math.min(1, dt * 0.8);
    const breathTarget = this.signals.breath();
    this.breath += ((breathTarget ?? 0) - this.breath) * Math.min(1, dt * 3);

    const kind = preset.kind;
    const pushable = kind !== 'rain' && kind !== 'clouds';
    const relax = Math.min(1, dt * 0.9);
    const { x: px, y: py, active } = this.pointer;
    const r2 = POINTER_RADIUS * POINTER_RADIUS;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i] as Particle;
      if (pushable && active) {
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const force = (1 - d / POINTER_RADIUS) * 26 * dt * (p.depth + 0.4);
          p.vx += (dx / d) * force * 10;
          p.vy += (dy / d) * force * 10;
        }
      }
      p.vx += (p.bx - p.vx) * relax;
      p.vy += (p.by - p.vy) * relax;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (kind === 'bubbles') p.x += Math.sin(t * 0.7 + p.phase) * 5 * dt;
      if (kind === 'embers') {
        p.x += Math.sin(t * 0.9 + p.phase) * 7 * dt;
        p.life += dt;
      }
      if (this.isOut(p)) this.particles[i] = this.create(false);
    }

    for (const b of this.bokeh) {
      b.x += b.bx * dt;
      if (b.x < -b.size) b.x = this.width + b.size;
      if (b.x > this.width + b.size) b.x = -b.size;
    }

    for (const pulse of this.pulses) pulse.age += dt;
    this.pulses = this.pulses.filter((pulse) => pulse.age < PULSE_LIFE);

    if (kind === 'stars') this.updateShootingStar(dt);
    if (kind === 'motes') this.updateLeaves(dt);
  }

  private isOut(p: Particle): boolean {
    const m = this.preset?.kind === 'clouds' ? p.size : 24;
    if (this.preset?.kind === 'embers' && p.life >= p.maxLife) return true;
    return p.x < -m - 140 || p.x > this.width + m || p.y < -m - 40 || p.y > this.height + m;
  }

  private updateShootingStar(dt: number): void {
    if (this.shooting) {
      this.shooting.age += dt;
      this.shooting.x += this.shooting.vx * dt;
      this.shooting.y += this.shooting.vy * dt;
      if (this.shooting.age > this.shooting.life) this.shooting = null;
      return;
    }
    if (this.time < this.nextShootingAt) return;
    // Rare on purpose. It should feel like luck.
    this.nextShootingAt = this.time + rand(70, 180);
    const angle = rand(0.25, 0.5);
    const speed = rand(260, 380);
    const direction = Math.random() < 0.5 ? 1 : -1;
    this.shooting = {
      x: direction > 0 ? rand(0, this.width * 0.5) : rand(this.width * 0.5, this.width),
      y: rand(0, this.height * 0.35),
      vx: Math.cos(angle) * speed * direction,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: rand(1.1, 1.6),
    };
  }

  private updateLeaves(dt: number): void {
    if (this.time > this.nextLeafAt && this.leaves.length < 3) {
      this.nextLeafAt = this.time + rand(10, 28);
      this.leaves.push({
        x: rand(0.1, 0.9) * this.width,
        y: -20,
        vy: rand(14, 24),
        sway: rand(0, Math.PI * 2),
        rotation: rand(0, Math.PI * 2),
        spin: rand(-0.6, 0.6),
        size: rand(5, 9),
      });
    }
    for (const leaf of this.leaves) {
      leaf.y += leaf.vy * dt;
      leaf.sway += dt * 0.8;
      leaf.x += Math.sin(leaf.sway) * 18 * dt;
      leaf.rotation += leaf.spin * dt;
    }
    this.leaves = this.leaves.filter((leaf) => leaf.y < this.height + 30);
  }

  /* ------------------------------------------------------------------ */

  private clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private draw(): void {
    const { ctx, preset } = this;
    this.clear();
    if (!preset || !this.config.enabled || !this.sprite) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const level = this.config.reduced ? 0 : this.signals.level();
    const master = this.visibility * this.intensity * (1 + level * 0.35);
    if (master <= 0.002) return;

    // The whole field breathes with you: a barely-there expansion from the center.
    const scale = 1 + this.breath * 0.035;
    if (scale !== 1) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    const t = this.time;
    switch (preset.kind) {
      case 'rain':
        this.drawBokeh(master, t);
        this.drawRain(master);
        break;
      case 'clouds':
        this.drawClouds(master);
        break;
      default:
        this.drawGlowParticles(master, t, preset.kind);
    }
    if (this.leaves.length) this.drawLeaves(master);
    if (this.shooting) this.drawShootingStar(master);
    if (this.pulses.length) this.drawPulses(master);
    ctx.globalAlpha = 1;
  }

  private drawGlowParticles(master: number, t: number, kind: ParticleKind): void {
    const { ctx } = this;
    const sprite = this.sprite as HTMLCanvasElement;
    const breathGlow = 1 + this.breath * 0.25;
    for (const p of this.particles) {
      let alpha = p.alpha;
      if (kind === 'embers') {
        const life = p.life / p.maxLife;
        alpha *=
          Math.sin(Math.PI * clamp(life, 0, 1)) * (0.75 + 0.25 * Math.sin(t * p.twinkle + p.phase));
      } else {
        alpha *= 0.62 + 0.38 * Math.sin(t * p.twinkle + p.phase);
      }
      if (kind === 'bubbles') alpha *= clamp(p.y / (this.height * 0.4), 0, 1);
      const s = p.size * 6 * (kind === 'stars' ? 1 : breathGlow);
      ctx.globalAlpha = clamp(alpha * master, 0, 1);
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    }
  }

  private drawRain(master: number): void {
    const { ctx } = this;
    ctx.strokeStyle = this.preset?.particle ?? '#ffffff';
    ctx.lineCap = 'round';
    // Two batches (far, near): one path each instead of one per drop.
    for (const near of [false, true]) {
      ctx.beginPath();
      ctx.lineWidth = near ? 1.1 : 0.7;
      ctx.globalAlpha = (near ? 0.26 : 0.13) * master;
      for (const p of this.particles) {
        if (p.depth > 0.62 !== near) continue;
        const k = p.size / p.vy;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * k, p.y - p.size);
      }
      ctx.stroke();
    }
  }

  private drawBokeh(master: number, t: number): void {
    const { ctx } = this;
    const sprite = this.glowSprite as HTMLCanvasElement;
    for (const b of this.bokeh) {
      ctx.globalAlpha = clamp(
        b.alpha * (0.7 + 0.3 * Math.sin(t * b.twinkle + b.phase)) * master,
        0,
        1,
      );
      ctx.drawImage(sprite, b.x - b.size, b.y - b.size, b.size * 2, b.size * 2);
    }
  }

  private drawClouds(master: number): void {
    const { ctx } = this;
    const sprite = this.softSprite as HTMLCanvasElement;
    for (const p of this.particles) {
      const h = p.size * p.squash;
      ctx.globalAlpha = clamp(p.alpha * master, 0, 1);
      ctx.drawImage(sprite, p.x - p.size / 2, p.y - h / 2, p.size, h);
    }
  }

  private drawLeaves(master: number): void {
    const { ctx } = this;
    ctx.fillStyle = withAlpha(this.preset?.glow ?? '#c8a060', 1);
    for (const leaf of this.leaves) {
      ctx.save();
      ctx.globalAlpha = 0.35 * master;
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawShootingStar(master: number): void {
    const s = this.shooting;
    if (!s) return;
    const { ctx } = this;
    const fade = Math.sin(Math.PI * clamp(s.age / s.life, 0, 1));
    const tailX = s.x - s.vx * 0.22;
    const tailY = s.y - s.vy * 0.22;
    const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    gradient.addColorStop(0, withAlpha(this.preset?.particle ?? '#ffffff', 0.9));
    gradient.addColorStop(1, withAlpha(this.preset?.particle ?? '#ffffff', 0));
    ctx.globalAlpha = fade * master;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }

  private drawPulses(master: number): void {
    const { ctx } = this;
    ctx.strokeStyle = this.preset?.accent ?? '#ffffff';
    for (const pulse of this.pulses) {
      for (const delay of [0, 0.4]) {
        const age = pulse.age - delay;
        if (age <= 0) continue;
        const life = age / (PULSE_LIFE - delay);
        if (life >= 1) continue;
        ctx.globalAlpha = (1 - life) ** 2 * 0.32 * master;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, 12 + age * 120, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function samePreset(a: ScenePreset, b: ScenePreset): boolean {
  return (
    a.kind === b.kind &&
    a.density === b.density &&
    a.particle === b.particle &&
    a.glow === b.glow &&
    a.accent === b.accent
  );
}

/** Box–Muller, clamped: embers gather near the center of the hearth. */
function gaussian(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return clamp(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), -2.2, 2.2);
}
