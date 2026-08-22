"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { FlightScene } from "@/three/flight-scene";

/**
 * A single continuous 3D world behind every section between the hero and the
 * closing CTA. The canvas is a sticky background pulled out of flow with a
 * negative margin, so it stays pinned for the whole range while the content
 * scrolls over it — one uninterrupted flight rather than a per-section effect.
 */
export default function World({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<FlightScene | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = ref.current;
    if (!canvas || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let scene: FlightScene;
    try {
      scene = new FlightScene(canvas, false);
    } catch {
      return; // no WebGL — sections still read fine on the flat background
    }
    sceneRef.current = scene;
    scene.progress = scrollYProgress.get();
    scene.start();

    // Stop rendering entirely once the world scrolls out of view; there is no
    // reason to keep a WebGL loop running behind the footer.
    const io = new IntersectionObserver(([e]) => scene.setPaused(!e.isIntersecting), {
      rootMargin: "10% 0px 10% 0px",
    });
    io.observe(host);

    return () => {
      io.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (sceneRef.current) sceneRef.current.progress = v;
  });

  return (
    <div className="world" ref={ref}>
      <div className="world-bg" aria-hidden="true">
        <canvas ref={canvasRef} className="world-canvas" />
        <div className="world-scrim" />
      </div>
      {children}
    </div>
  );
}
