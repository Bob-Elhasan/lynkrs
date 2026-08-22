/**
 * 2D scroll-driven network field.
 *
 * Every visual property is a pure function of scroll progress (0..1) — nothing
 * runs on its own clock. Scrolling *is* the animation, so stopping mid-way
 * leaves the field half-formed and scrolling back genuinely reverses it.
 *
 * The field morphs through four layouts that carry the page's argument:
 *   0.00–0.25  scattered   — fragmentation, no connections
 *   0.25–0.50  aligned     — nodes pull into one ring, first links appear
 *   0.50–0.75  sequenced   — they order into a single path, linked in series
 *   0.75–1.00  structured  — four columns of increasing height, densely linked
 */

export type Layout = { x: number; y: number }[];

const NODES_WIDE = 64;
const NODES_LITE = 34;

/** Smootherstep — eases layout-to-layout morphs without a time source. */
function ease(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export class NetworkField {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private layouts: Layout[] = [];
  private n: number;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private seeds: number[] = [];
  private raf = 0;
  private paused = false;
  private dirty = true;

  /** Scroll progress 0..1, set externally. */
  progress = 0;
  private drawn = -1;

  private accent: string;
  private accentSoft: string;

  constructor(canvas: HTMLCanvasElement, accent = "#3d7fff") {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;

    this.accent = accent;
    this.accentSoft = accent;

    this.n = window.innerWidth < 900 ? NODES_LITE : NODES_WIDE;
    for (let i = 0; i < this.n; i++) this.seeds.push(Math.random());

    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
    this.measure();
  }

  private measure() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width || window.innerWidth;
    this.h = rect.height || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildLayouts();
    this.dirty = true;
  }

  private onResize() {
    this.measure();
  }

  /** Four target arrangements the field morphs between. */
  private buildLayouts() {
    const { w, h, n } = this;
    const cx = w * 0.62;
    const cy = h * 0.5;

    const scattered: Layout = [];
    const aligned: Layout = [];
    const sequenced: Layout = [];
    const structured: Layout = [];

    for (let i = 0; i < n; i++) {
      const s = this.seeds[i];
      const s2 = this.seeds[(i * 7 + 3) % n];

      // scattered — deliberately uneven, clustered in the right half
      scattered.push({
        x: w * 0.32 + s * w * 0.66,
        y: h * 0.08 + s2 * h * 0.84,
      });

      // aligned — one ring, evenly spaced
      const a = (i / n) * Math.PI * 2;
      const r = Math.min(w, h) * 0.3;
      aligned.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.86 });

      // sequenced — a single ordered path across the field
      const t = i / (n - 1);
      sequenced.push({
        x: w * 0.3 + t * w * 0.62,
        y: cy + Math.sin(t * Math.PI * 2.2) * h * 0.16,
      });

      // structured — four columns of increasing height
      const col = Math.floor((i / n) * 4);
      const within = (i / n) * 4 - col;
      const colX = w * 0.36 + col * (w * 0.17);
      const colH = h * (0.2 + col * 0.11);
      structured.push({
        x: colX + (s - 0.5) * w * 0.035,
        y: h * 0.74 - within * colH,
      });
    }

    this.layouts = [scattered, aligned, sequenced, structured];
  }

  /** Node position at a given progress, morphing between adjacent layouts. */
  private nodeAt(i: number, p: number) {
    const seg = Math.min(Math.floor(p * 3), 2);
    const t = ease(p * 3 - seg);
    const a = this.layouts[seg][i];
    const b = this.layouts[seg + 1][i];
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }

  private draw() {
    const p = Math.min(Math.max(this.progress, 0), 1);
    const { ctx, w, h, n } = this;
    ctx.clearRect(0, 0, w, h);

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) pts.push(this.nodeAt(i, p));

    // Links build as the field organises: none while fragmented, chained once
    // sequenced, dense once structured.
    const linkStrength = ease(Math.min(Math.max((p - 0.22) / 0.5, 0), 1));
    if (linkStrength > 0.001) {
      ctx.lineWidth = 1;
      for (let i = 0; i < n - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        // Long links fade out, so the chain reads as local rather than a mess.
        const near = Math.max(0, 1 - d / (Math.min(w, h) * 0.34));
        const alpha = near * linkStrength * 0.75;
        if (alpha < 0.01) continue;
        ctx.strokeStyle = this.rgba(this.accent, alpha);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // A second pass of cross-links once structured, for density.
      const dense = ease(Math.min(Math.max((p - 0.72) / 0.28, 0), 1));
      if (dense > 0.001) {
        for (let i = 0; i < n - 4; i += 2) {
          const a = pts[i];
          const b = pts[i + 4];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          const near = Math.max(0, 1 - d / (Math.min(w, h) * 0.26));
          const alpha = near * dense * 0.45;
          if (alpha < 0.01) continue;
          ctx.strokeStyle = this.rgba(this.accentSoft, alpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const { x, y } = pts[i];
      const s = this.seeds[i];
      // Nodes brighten and settle to a common size as the field organises.
      const r = lerp(1.1 + s * 2.6, 2.1, ease(p));
      const alpha = lerp(0.42 + s * 0.34, 1, ease(p));
      ctx.fillStyle = this.rgba(this.accent, alpha);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawn = p;
  }

  private rgba(hex: string, a: number) {
    const v = hex.replace("#", "");
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  setPaused(paused: boolean) {
    if (paused === this.paused) return;
    this.paused = paused;
    if (!paused) this.start();
  }

  start() {
    if (this.raf) cancelAnimationFrame(this.raf);
    const tick = () => {
      if (this.paused) {
        this.raf = 0;
        return;
      }
      this.raf = requestAnimationFrame(tick);
      // Nothing animates on its own — redraw only when scroll actually moved.
      if (this.dirty || Math.abs(this.progress - this.drawn) > 0.0004) {
        this.dirty = false;
        this.draw();
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  /** Draw once, for reduced-motion where no loop runs. */
  renderStatic(p: number) {
    this.progress = p;
    this.draw();
  }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
  }
}
