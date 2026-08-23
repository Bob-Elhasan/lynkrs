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

/* Scroll choreography, as fractions of the track. The prism turns through the
   four faces across the middle; the ends are the camera moving in and back out. */
const ENTER_END = 0.14;
const EXIT_START = 0.84;
/* Each face holds still for the first part of its segment before the turn
   begins, so there is time to read it. */
const FACE_HOLD = 0.3;
const FACE_TURN = 0.45;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * The problem section as a scroll-driven scene: the camera pushes in on a
 * rectangular prism, which turns through its four faces — one cost per face —
 * before pulling back out to the closing line.
 *
 * The 3D only switches on once this mounts and sets `data-ready`. Until then,
 * and whenever reduced motion is asked for, the same markup lays itself out as
 * the flat four-column grid, so the copy is readable without JavaScript and the
 * page keeps its one-quiet-entrance promise for anyone who wants it still.
 */
export default function Problem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = trackRef.current?.closest<HTMLElement>(".problem-scene");
    const track = trackRef.current;
    const stage = stageRef.current;
    const prism = prismRef.current;
    if (!section || !track || !stage || !prism) return;

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
        zoom = lerp(0.52, 1, easeOutCubic(p / ENTER_END));
        fade = clamp01(p / (ENTER_END * 0.6));
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
      const rotation = -90 * (index + turn);

      prism.style.transform = `rotateY(${rotation}deg)`;
      stage.style.setProperty("--zoom", zoom.toFixed(4));
      stage.style.setProperty("--fade", fade.toFixed(4));
      stage.style.setProperty(
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
        {/* Rides in the track rather than the sticky stage, so it genuinely
            travels past the prism instead of hanging still behind it. */}
        <svg
          className="scene-ribbon"
          viewBox="0 0 400 2000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            d="M200 0 C200 200 60 260 60 460 C60 660 340 700 340 900 C340 1100 200 1160 200 1360 L200 2000"
          />
        </svg>

        <div className="scene-stage" ref={stageRef}>
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
