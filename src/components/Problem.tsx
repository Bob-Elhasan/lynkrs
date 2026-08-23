"use client";

import { useEffect, useRef } from "react";

const COSTS = [
  {
    n: "01",
    title: "Wasted spend",
    body: "Media runs without a clear brief, so the budget goes out and very little comes back.",
  },
  {
    n: "02",
    title: "Rising costs",
    body: "Nobody checks what the content actually earns, so winning a customer keeps getting dearer.",
  },
  {
    n: "03",
    title: "Starting over",
    body: "SEO chases traffic instead of revenue, and every month begins from scratch.",
  },
  {
    n: "04",
    title: "No room to grow",
    body: "A good month looks great in a report, but there is nothing underneath it to build on.",
  },
];

/* The flowing form and the prism are one object: a rectangular bar that snakes
   down the section and swells into the four-sided segment the camera turns.
   It runs straight through the middle — the stretch on screen while the prism
   is at full size — so the prism reads as a swelling on the bar, not a separate
   thing floating in front of it. Coordinates are in the 400x2000 viewBox. */
const BEAM =
  "M200 -140 C200 10 100 40 100 170 C100 300 200 250 200 300 " +
  "L200 1670 " +
  "C200 1800 300 1750 300 1880 C300 2010 200 2040 200 2160";

/* Scroll choreography, as fractions of the track. The prism turns through the
   four faces across the middle; the ends are the camera moving in and back out. */
const ENTER_END = 0.14;
const EXIT_START = 0.84;
/* Each face holds still for the first part of its segment before the turn
   begins, so there is time to read it. */
const FACE_HOLD = 0.3;
const FACE_TURN = 0.45;
/* The prism never rests perfectly square-on. A few degrees keeps a sliver of the
   next face showing as a shaded edge, which is what matches the thickness the
   flowing bar carries — dead-on, the prism would read as a flat card and the two
   would stop looking like one object. Chosen so the sliver is about as wide as the bar's
   own shaded side; the face still reads at 99% of full-on. */
const REST_TILT = 4;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * The problem section as a scroll-driven scene: a rectangular prism flows down
 * the page as a bar, swells where the camera pushes into it, turns through its
 * four faces — one cost per face — then narrows back into the flow as the
 * camera pulls out and the closing line takes its place.
 *
 * The 3D only switches on once this mounts and sets `data-ready`. Until then,
 * and whenever reduced motion is asked for, the same markup lays itself out as
 * the flat four-column grid, so the copy is readable without JavaScript and the
 * page keeps its one-quiet-entrance promise for anyone who wants it still.
 */
export default function Problem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = trackRef.current?.closest<HTMLElement>(".problem-scene");
    const track = trackRef.current;
    const prism = prismRef.current;
    if (!section || !track || !prism) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const faces = Array.from(
      prism.querySelectorAll<HTMLElement>(".prism-face")
    );

    let frame = 0;

    const draw = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? clamp01(-rect.top / travel) : 0;

      // Camera: in at the top, held through the turns, back out at the end.
      let zoom = 1;
      let fade = 1;
      if (p < ENTER_END) {
        // Scale only, never opacity: the prism is a swelling on the bar, and a
        // translucent one would show the opaque bar straight through itself.
        zoom = lerp(0.52, 1, easeOutCubic(p / ENTER_END));
      } else if (p > EXIT_START) {
        const t = (p - EXIT_START) / (1 - EXIT_START);
        zoom = lerp(1, 0.6, easeInCubic(t));
        fade = 1 - clamp01((t - 0.25) / 0.45);
      }

      // Turn: three quarter-turns spread across the four faces.
      const span = rp(p);
      const step = span * (COSTS.length - 1);
      const index = Math.min(Math.floor(step), COSTS.length - 2);
      const within = step - index;
      const turn = easeInOutCubic(clamp01((within - FACE_HOLD) / FACE_TURN));
      const rotation = -90 * (index + turn) - REST_TILT;

      prism.style.transform = `rotateY(${rotation}deg)`;
      // Set on the track so the bar and the stage both read them.
      track.style.setProperty("--zoom", zoom.toFixed(4));
      track.style.setProperty("--fade", fade.toFixed(4));
      track.style.setProperty(
        "--note",
        clamp01((p - EXIT_START - 0.06) / 0.1).toFixed(4)
      );

      // A face is lit in proportion to how square-on it is to the camera, which
      // doubles as the depth shading for the one turning away.
      faces.forEach((face, i) => {
        const angle = ((rotation + 90 * i) * Math.PI) / 180;
        const vis = Math.max(0, Math.cos(angle));
        face.style.setProperty("--vis", (vis * vis).toFixed(4));
      });
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    section.setAttribute("data-ready", "");
    draw();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      section.removeAttribute("data-ready");
    };
  }, []);

  return (
    <section className="band problem-scene" id="problem">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">01</span>
          <span className="lbl">The problem</span>
        </div>
        <div className="head">
          <h2 className="rv">
            Most marketing does not fail because nobody is working hard. It fails because nothing is joined
            up.
          </h2>
          <p className="rv" data-delay="80">
            Different agencies, different targets, and nobody owning the result. You end up paying for that
            in four places at once.
          </p>
        </div>
      </div>

      <div className="scene-track" ref={trackRef}>
        {/* Rides in the track rather than the sticky stage, so the bar actually
            travels while the prism segment of it stays put on screen. Drawn
            twice: the offset copy underneath is the bar's shaded side, which is
            what gives it the same extruded thickness as the prism. */}
        <svg
          className="scene-beam"
          viewBox="0 0 400 2000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="beam-side" vectorEffect="non-scaling-stroke" d={BEAM} />
          <path className="beam-face" vectorEffect="non-scaling-stroke" d={BEAM} />
        </svg>

        <div className="scene-stage">
          <div className="scene-camera">
            <div className="prism" ref={prismRef}>
              {COSTS.map((c, i) => (
                <article
                  className="prism-face"
                  key={c.n}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="n">{c.n}</span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Rises as the camera pulls back. Its flat-layout twin below is the
              one that shows when the scene is off; CSS keeps exactly one. */}
          <p className="scene-note">
            Marketing turns into a cost you tolerate instead of an investment you make.
          </p>
        </div>
      </div>

      <div className="shell">
        <p className="problem-note rv" data-delay="280">
          Marketing turns into a cost you tolerate instead of an investment you make.
        </p>
      </div>
    </section>
  );
}

/** Progress through the turning stretch alone, 0 before it and 1 after. */
function rp(p: number) {
  return clamp01((p - ENTER_END) / (EXIT_START - ENTER_END));
}
