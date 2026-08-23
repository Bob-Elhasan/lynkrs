"use client";

import { useEffect, useRef } from "react";

/* One rectangular prism carries the whole site. Every panel of copy sits on one
   of its four faces, and scrolling only ever moves the camera: it settles on a
   panel, travels to the next, settles again. Nothing on the prism itself moves,
   scales or fades.

   The panels are ordinary sections in the document. The 3D is switched on after
   mount by `data-ready`, so with JavaScript off — or reduced motion asked for —
   the same markup is simply a stacked page. */

/** Fraction of each panel-to-panel step spent held still before the camera moves. */
const HOLD = 0.28;
/** Fraction spent travelling. What is left is the settle at the far end. */
const TRAVEL = 0.52;
/** How far the camera eases back while it swings around a corner. Enough that
    the prism is seen whole between panels, rather than one face filling the
    frame the entire way down. */
const PULL_BACK = 900;
/** Blue prism left showing between one panel and the next, as a fraction of the
    viewport. Panels size to their own copy, so the gap is what stays constant. */
const GAP = 0.42;
/** Must match the perspective on .scene-viewport, or the fit maths is wrong. */
const PERSPECTIVE = 1400;
/** How much of the frame a panel is allowed to fill when the camera settles. */
const FIT_W = 0.94;
const FIT_H = 0.86;
/** Scroll length granted to each step, as a fraction of the viewport. */
const STEP_SCROLL = 0.9;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function faceOf(turn: number) {
  return ((turn % 4) + 4) % 4;
}

/**
 * One panel of copy, fixed to a face of the prism.
 *
 * `turn` is cumulative quarter-turns from the start, not a face index, so the
 * camera always knows which way round to swing: consecutive panels sharing a
 * turn sit on the same face and the camera simply descends between them.
 */
export function Panel({
  turn,
  className = "",
  children,
}: {
  turn: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`panel ${className}`.trim()}
      data-turn={turn}
      data-face={faceOf(turn)}
    >
      <div className="panel-in">{children}</div>
    </section>
  );
}

export default function Scene({ children }: { children: React.ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    const spacer = spacerRef.current;
    if (!scene || !world || !spacer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = Array.from(world.querySelectorAll<HTMLElement>(".panel"));
    const sides = Array.from(world.querySelectorAll<HTMLElement>(".prism-side"));
    if (panels.length < 2) return;

    const turns = panels.map((el) => Number(el.dataset.turn ?? 0));

    let half = 0;
    /** Centre height of each panel down the prism, and the camera distance that
        frames it. Both depend on the panel's own measured height. */
    let ys: number[] = [];
    let rests: number[] = [];

    /** Place the prism. Re-run on resize: the face is sized in viewport units,
        and how much copy fits in a panel changes with it. */
    const layout = () => {
      half = panels[0].offsetWidth / 2;
      const gap = window.innerHeight * GAP;
      const availW = window.innerWidth * FIT_W;
      const availH = window.innerHeight * FIT_H;

      ys = [];
      rests = [];
      let y = 0;
      let prev = 0;

      panels.forEach((el, i) => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (i > 0) y += prev / 2 + gap + h / 2;
        prev = h;
        ys.push(y);

        // Never magnify; pull back as far as the taller or wider panel needs so
        // none of its copy falls outside the frame.
        const scale = Math.min(availW / w, availH / h, 1);
        rests.push(PERSPECTIVE / scale - PERSPECTIVE + half);

        el.style.marginTop = `${(-h / 2).toFixed(2)}px`;
        el.style.transform =
          `translateY(${y.toFixed(2)}px) ` +
          `rotateY(${faceOf(turns[i]) * 90}deg) ` +
          `translateZ(${(half + 2).toFixed(2)}px)`;
      });

      // The solid body: four planes spanning the whole journey, so the far side
      // of the prism is always occluded and it reads as one object.
      const first = ys[0] - panels[0].offsetHeight / 2 - gap;
      const last = ys[ys.length - 1] + panels[panels.length - 1].offsetHeight / 2 + gap;
      const span = last - first;
      const mid = (first + last) / 2;
      sides.forEach((el, i) => {
        el.style.height = `${span.toFixed(2)}px`;
        el.style.marginTop = `${(-span / 2).toFixed(2)}px`;
        el.style.transform =
          `translateY(${mid.toFixed(2)}px) ` +
          `rotateY(${i * 90}deg) ` +
          `translateZ(${half.toFixed(2)}px)`;
      });

      spacer.style.height = `${
        (panels.length - 1) * window.innerHeight * STEP_SCROLL + window.innerHeight
      }px`;
    };

    let frame = 0;

    const draw = () => {
      frame = 0;
      const max = spacer.offsetHeight - window.innerHeight;
      const p = max > 0 ? clamp01(window.scrollY / max) : 0;

      const t = p * (panels.length - 1);
      const i = Math.min(Math.floor(t), panels.length - 2);
      const within = t - i;
      // Settle, travel, settle — the camera is still for the first and last of
      // each step, so there is time to read the panel it is parked on.
      const e = easeInOutCubic(clamp01((within - HOLD) / TRAVEL));

      const quarter = turns[i] + (turns[i + 1] - turns[i]) * e;
      const yaw = quarter * 90;
      const camY = ys[i] + (ys[i + 1] - ys[i]) * e;
      // Ease back through the middle of a corner, so the turn is legible.
      const swing = 4 * e * (1 - e) * Math.abs(turns[i + 1] - turns[i]);
      const dist = rests[i] + (rests[i + 1] - rests[i]) * e + swing * PULL_BACK;

      world.style.transform =
        `translateZ(${-dist.toFixed(2)}px) ` +
        `rotateY(${(-yaw).toFixed(3)}deg) ` +
        `translateY(${(-camY).toFixed(2)}px)`;

      // How square-on each face is to the camera, which is both the text's
      // legibility and the prism's shading.
      for (let k = 0; k < 4; k++) {
        const vis = Math.max(0, Math.cos(((yaw - k * 90) * Math.PI) / 180));
        world.style.setProperty(`--vis${k}`, (vis * vis).toFixed(4));
      }
    };

    /** Where the camera settles on a given panel. */
    const stopFor = (i: number) => i * window.innerHeight * STEP_SCROLL;

    /* In-page links point at sections that now live in a fixed layer, so the
       browser has nowhere to scroll them to. Send the camera instead.
       #contact is left alone: LeadFlow opens the enquiry modal on that one. */
    const onClick = (ev: MouseEvent) => {
      const link = (ev.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.length < 2 || href === "#contact") return;
      const panel = document.getElementById(href.slice(1))?.closest(".panel");
      if (!panel) return;
      const i = panels.indexOf(panel as HTMLElement);
      if (i < 0) return;
      ev.preventDefault();
      window.scrollTo({ top: stopFor(i), behavior: "smooth" });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };
    const onResize = () => {
      layout();
      draw();
    };

    scene.setAttribute("data-ready", "");
    layout();
    draw();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scene.removeAttribute("data-ready");
    };
  }, []);

  return (
    <>
      <div className="scene" ref={sceneRef}>
        <div className="scene-viewport">
          <div className="world" ref={worldRef}>
            <div className="prism-side" aria-hidden="true" />
            <div className="prism-side" aria-hidden="true" />
            <div className="prism-side" aria-hidden="true" />
            <div className="prism-side" aria-hidden="true" />
            {children}
          </div>
        </div>
      </div>
      {/* Gives the camera flight its scroll length. Zero-height until the scene
          is live, so the fallback is just the document. */}
      <div className="scene-spacer" ref={spacerRef} aria-hidden="true" />
    </>
  );
}
