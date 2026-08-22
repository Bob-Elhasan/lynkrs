"use client";

import * as React from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "motion/react";
import { FlightScene } from "@/three/flight-scene";

/**
 * Captions gated on flight progress, mirroring wlt.design's `roomProgress`
 * anchors (they fire at 14/18/34/38/56/62% of the camera clip).
 */
const CAPTIONS = [
  {
    at: 0.04,
    until: 0.24,
    kicker: "01 — Not vanity metrics",
    h: "Performance must serve business objectives.",
    p: "If a number doesn't move the business, it doesn't belong in the report.",
  },
  {
    at: 0.28,
    until: 0.48,
    kicker: "02 — Signal over noise",
    h: "Data should guide decisions, not fill reports.",
    p: "Every dashboard we build exists to settle a question someone actually asked.",
  },
  {
    at: 0.52,
    until: 0.72,
    kicker: "03 — Ideas with a job",
    h: "Creativity works best when it's accountable.",
    p: "Concepts are briefed against outcomes, tested in market, and kept or cut.",
  },
  {
    at: 0.76,
    until: 0.98,
    kicker: "04 — Short & long term",
    h: "Sustainable growth balances results with equity.",
    p: "We scale what compounds instead of borrowing from next quarter.",
  },
];

export default function Flight() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<FlightScene | null>(null);
  const [active, setActive] = React.useState(-1);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The copy block rushes toward and past the camera, the way wlt.design
  // drives `.scene-content-inner` to z:4000 alongside the camera scrub.
  const copyZ = useTransform(scrollYProgress, [0, 1], [-1400, 2600]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scene: FlightScene;
    try {
      scene = new FlightScene(canvas, reduced);
    } catch {
      // No WebGL — the section still reads as a normal dark scroll section.
      return;
    }
    sceneRef.current = scene;
    scene.progress = scrollYProgress.get();
    scene.start();

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (sceneRef.current) sceneRef.current.progress = v;
    const i = CAPTIONS.findIndex((c) => v >= c.at && v <= c.until);
    setActive(i);
  });

  return (
    <section className="flight" ref={sectionRef} id="flight">
      <div className="flight-stage">
        <canvas ref={canvasRef} className="flight-canvas" aria-hidden="true" />
        <div className="flight-vignette" aria-hidden="true" />

        <motion.div className="flight-copy" style={{ z: copyZ }}>
          {CAPTIONS.map((c, i) => (
            <div className={`flight-cap${active === i ? " active" : ""}`} key={c.kicker}>
              <span className="fc-kick">{c.kicker}</span>
              <h2>{c.h}</h2>
              <p>{c.p}</p>
            </div>
          ))}
        </motion.div>

        <div className="flight-hud" aria-hidden="true">
          <span className="fh-label">Flight</span>
          <div className="fh-bar">
            <motion.div className="fh-fill" style={{ scaleY: scrollYProgress }} />
          </div>
          <span className="fh-label">3D</span>
        </div>
      </div>

      {/* Screen-reader / no-JS accessible copy for the pinned canvas section. */}
      <div className="sr-only">
        {CAPTIONS.map((c) => (
          <section key={c.kicker}>
            <h2>{c.h}</h2>
            <p>{c.p}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
