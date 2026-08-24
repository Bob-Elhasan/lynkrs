"use client";

import { useEffect, useRef } from "react";
import {
  add,
  buildPath,
  cross,
  dot,
  frameAt,
  modelMatrix,
  mul,
  norm,
  normalAt,
  sub,
  viewMatrix,
  type Station,
  type Vec3,
} from "./sceneGeometry";

/* One endless rectangular prism carries the whole site. It curves and bends
   through 3D space; every panel of copy is fixed flat to one of its four faces;
   and scrolling only ever moves the camera, which rides the tube like a car on
   a rail — banking through the bends, orbiting round to the next face.

   Reading beats motion wherever the two disagree. The tube is deliberately
   straight where the panels are and bends only in between, and the camera comes
   to a full stop square-on to each panel at a distance that frames it. The ride
   happens between stops, never across one.

   The panels are ordinary sections in the document. The 3D is switched on after
   mount by `data-ready`, so with JavaScript off — or reduced motion asked for —
   the same markup is simply a stacked page. */

/** Fraction of each stop-to-stop step spent held still before the camera moves. */
const HOLD = 0.26;
/** Fraction spent travelling. What is left is the settle at the far end. */
const TRAVEL = 0.54;
/** How far the camera swings out from the tube through the middle of a move.
    Far enough to see the track curving away rather than a face filling the frame. */
const PULL_BACK = 900;
/** Through a move the eye also swings out to the side of the track and rises
    above it, so each move is flown rather than merely zoomed. The aim stays
    locked on the tube's axis and the horizon stays level, which is what keeps
    the ride legible instead of disorienting. All of it scales by `swing`, which
    is 0 at every stop. */
const RIDE_SIDE = 760;
const RIDE_LIFT = 460;
/** Tube left showing between one panel and the next, as a fraction of viewport. */
const GAP = 0.5;
/** Straight tube run beyond the first and last panel, so it reads as endless. */
const LEAD = 1600;
/** How much track either side of the camera is drawn. Beyond this the tube has
    usually bent out of frame, and leaving it in only lets far-off stretches loom
    back across the shot. Culling it also keeps the per-frame work small. */
const DRAW_RANGE = 6000;
/** Frames generated per span. More is smoother tube and more elements. */
const PER_SPAN = 8;
/** Must match the perspective on .scene-viewport, or the fit maths is wrong. */
const PERSPECTIVE = 1400;
/** How much of the frame a panel may fill when the camera settles. */
const FIT_W = 0.94;
const FIT_H = 0.86;
/** Scroll length granted to each step, as a fraction of the viewport. */
const STEP_SCROLL = 1.0;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function faceOf(turn: number) {
  return ((turn % 4) + 4) % 4;
}

/**
 * One panel of copy, fixed flat to a face of the prism.
 *
 * `turn` is cumulative quarter-turns from the start, not a face index, so the
 * camera always knows which way round to swing. `bend` and `climb` steer the
 * tube itself across the span that follows this panel — sideways and up/down
 * respectively, in degrees — which is what the camera then has to ride.
 */
export function Panel({
  turn,
  bend = 0,
  climb = 0,
  className = "",
  children,
}: {
  turn: number;
  bend?: number;
  climb?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`panel ${className}`.trim()}
      data-turn={turn}
      data-bend={bend}
      data-climb={climb}
      data-face={faceOf(turn)}
    >
      <div className="panel-in">{children}</div>
    </section>
  );
}

export default function Scene({ children }: { children: React.ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tubeRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    const tube = tubeRef.current;
    const spacer = spacerRef.current;
    if (!scene || !world || !tube || !spacer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = Array.from(world.querySelectorAll<HTMLElement>(".panel"));
    if (panels.length < 2) return;

    const turns = panels.map((el) => Number(el.dataset.turn ?? 0));
    const bends = panels.map((el) => Number(el.dataset.bend ?? 0));
    const climbs = panels.map((el) => Number(el.dataset.climb ?? 0));

    let half = 0;
    /** Where each panel sits along the route, and the distance that frames it. */
    let arcs: number[] = [];
    let rests: number[] = [];
    let path = buildPath([], PER_SPAN);
    /** Outward normal and centre of each panel, for shading. */
    let normals: Vec3[] = [];
    let centres: Vec3[] = [];

    const layout = () => {
      half = panels[0].offsetWidth / 2;
      const gap = window.innerHeight * GAP;
      const availW = window.innerWidth * FIT_W;
      const availH = window.innerHeight * FIT_H;

      // A span runs from one panel's centre to the next, and carries that
      // panel's steering. Lead-in and lead-out keep the tube running past both
      // ends of the content.
      const stations: Station[] = [{ span: LEAD, bend: 0, climb: 0 }];
      for (let i = 0; i < panels.length - 1; i++) {
        stations.push({
          span: panels[i].offsetHeight / 2 + gap + panels[i + 1].offsetHeight / 2,
          bend: bends[i],
          climb: climbs[i],
        });
      }
      stations.push({ span: LEAD, bend: 0, climb: 0 });

      path = buildPath(stations, PER_SPAN);
      const { frames, marks } = path;

      arcs = [];
      rests = [];
      normals = [];
      centres = [];

      panels.forEach((el, i) => {
        // marks[0] is the start of the lead-in, so panel i is at marks[i + 1].
        const f = frames[marks[i + 1]];
        const n = normalAt(f, faceOf(turns[i]) * 90);
        // A hair proud of the tube surface, or the two z-fight.
        const centre = add(f.pos, mul(n, half + 2));
        const ey = f.t;
        const ex = norm(cross(ey, n));

        const w = el.offsetWidth;
        const h = el.offsetHeight;
        el.style.marginLeft = `${(-w / 2).toFixed(2)}px`;
        el.style.marginTop = `${(-h / 2).toFixed(2)}px`;
        el.style.transform = modelMatrix(centre, ex, ey, n);

        arcs.push(f.arc);
        normals.push(n);
        centres.push(add(f.pos, mul(n, half)));

        // Never magnify; pull back as far as the wider or taller panel needs so
        // none of its copy falls outside the frame.
        const scale = Math.min(availW / w, availH / h, 1);
        rests.push(PERSPECTIVE / scale - PERSPECTIVE);
      });

      buildTube();

      spacer.style.height = `${
        (panels.length - 1) * window.innerHeight * STEP_SCROLL + window.innerHeight
      }px`;
    };

    /** Quads of the tube, with where each sits along the route, for culling. */
    let quads: HTMLElement[] = [];
    let quadArcs: number[] = [];
    let quadShown: boolean[] = [];

    /** Skin the route: four quads per pair of frames. */
    const buildTube = () => {
      const { frames } = path;
      const side = half * 2;
      const parts: string[] = [];
      quadArcs = [];

      for (let s = 0; s < frames.length - 1; s++) {
        const f0 = frames[s];
        const f1 = frames[s + 1];
        for (let k = 0; k < 4; k++) {
          const deg = k * 90;
          const n0 = normalAt(f0, deg);
          const n1 = normalAt(f1, deg);
          const p0 = add(f0.pos, mul(n0, half));
          const p1 = add(f1.pos, mul(n1, half));
          const run = sub(p1, p0);
          const length = Math.hypot(run[0], run[1], run[2]);
          if (length < 0.5) continue;

          const ey = norm(run);
          let ez = norm(add(n0, n1));
          const ex = norm(cross(ey, ez));
          ez = cross(ex, ey);
          const centre = mul(add(p0, p1), 0.5);
          // Quad length is measured between face centres, but through a bend the
          // tube's corner travels a longer arc than its centre — so a quad cut to
          // the centre length tears open at the corners. Overrun by a share of
          // the tube's own width, which covers the worst corner on these bends.
          // Neighbours on a face are the same colour, so the overlap is invisible.
          const h = length + half * 0.3;

          quadArcs.push((f0.arc + f1.arc) / 2);
          parts.push(
            `<i class="tube-face" data-face="${k}" style="width:${side.toFixed(
              2
            )}px;height:${h.toFixed(2)}px;margin-left:${(-side / 2).toFixed(
              2
            )}px;margin-top:${(-h / 2).toFixed(2)}px;transform:${modelMatrix(
              centre,
              ex,
              ey,
              ez
            )}"></i>`
          );
        }
      }
      tube.innerHTML = parts.join("");
      quads = Array.from(tube.children) as HTMLElement[];
      quadShown = quads.map(() => true);
    };

    let frame = 0;

    const draw = () => {
      frame = 0;
      const max = spacer.offsetHeight - window.innerHeight;
      const p = max > 0 ? clamp01(window.scrollY / max) : 0;

      const t = p * (panels.length - 1);
      const i = Math.min(Math.floor(t), panels.length - 2);
      const within = t - i;
      // Settle, ride, settle. The camera is completely still for the first and
      // last of every step, which is when the copy is meant to be read.
      const e = easeInOutCubic(clamp01((within - HOLD) / TRAVEL));

      const arc = arcs[i] + (arcs[i + 1] - arcs[i]) * e;
      const f = frameAt(path.frames, arc);
      const deg = (turns[i] + (turns[i + 1] - turns[i]) * e) * 90;
      const n = normalAt(f, deg);

      // Swing wide through the middle of a move, so the bend is seen from
      // outside rather than from a face pressed up against the camera.
      const swing = 4 * e * (1 - e);
      const dist =
        half + rests[i] + (rests[i + 1] - rests[i]) * e + swing * PULL_BACK;

      // The eye swings out and up through the move; the aim stays on the tube's
      // axis and the horizon stays the track's own direction. At a stop every
      // offset is zero, so this is exactly "straight out from the panel, looking
      // straight at it" — which is why copy still reads dead-on.
      const side = norm(cross(f.t, n));
      const lead = turns[i + 1] >= turns[i] ? 1 : -1;
      const eye = add(
        add(f.pos, mul(n, half + dist)),
        add(mul(side, lead * swing * RIDE_SIDE), mul(f.t, -swing * RIDE_LIFT))
      );
      const fwd = norm(sub(f.pos, eye));
      world.style.transform = viewMatrix(eye, fwd, mul(f.t, -1));

      // Per panel: how square-on it is to the camera. Both its legibility and
      // the shading that makes the prism read as solid.
      panels.forEach((el, k) => {
        const toEye = norm(sub(eye, centres[k]));
        const vis = Math.max(0, dot(normals[k], toEye));
        el.style.setProperty("--vis", (vis * vis).toFixed(4));
      });

      // Draw only the stretch of track around the camera. Touch the style only
      // when a quad actually changes state, so this stays cheap.
      for (let k = 0; k < quads.length; k++) {
        const show = Math.abs(quadArcs[k] - arc) < DRAW_RANGE;
        if (show !== quadShown[k]) {
          quads[k].style.display = show ? "" : "none";
          quadShown[k] = show;
        }
      }

      // The tube is skinned per face index, shaded from the camera's angle to
      // the frame it is currently riding.
      for (let k = 0; k < 4; k++) {
        const vis = Math.max(0, dot(normalAt(f, k * 90), n));
        world.style.setProperty(`--vis${k}`, vis.toFixed(4));
      }
    };

    /** Where the camera settles on a given panel. */
    const stopFor = (k: number) => k * window.innerHeight * STEP_SCROLL;

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
      const k = panels.indexOf(panel as HTMLElement);
      if (k < 0) return;
      ev.preventDefault();
      window.scrollTo({ top: stopFor(k), behavior: "smooth" });
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
      tube.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="scene" ref={sceneRef}>
        <div className="scene-viewport">
          <div className="world" ref={worldRef}>
            <div className="tube" ref={tubeRef} aria-hidden="true" />
            {children}
          </div>
        </div>
      </div>
      {/* Gives the ride its scroll length. Zero-height until the scene is live,
          so the fallback is just the document. */}
      <div className="scene-spacer" ref={spacerRef} aria-hidden="true" />
    </>
  );
}
