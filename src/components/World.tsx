"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { NetworkField } from "@/two/network-field";

/**
 * One continuous 2D field behind every section between the hero and the CTA.
 *
 * The canvas is a sticky background pulled out of flow with a matching
 * negative margin, so it stays pinned for the whole range while the content
 * scrolls over it. Its state is a pure function of scroll progress — it has no
 * clock of its own, so it only ever moves when the reader does.
 */
export default function World({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fieldRef = React.useRef<NetworkField | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = ref.current;
    if (!canvas || !host) return;

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#3d7fff";

    let field: NetworkField;
    try {
      field = new NetworkField(canvas, accent);
    } catch {
      return; // no 2d context — sections still read on the flat background
    }
    fieldRef.current = field;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Draw the resolved end state once and leave it there.
      field.renderStatic(1);
      return () => {
        field.dispose();
        fieldRef.current = null;
      };
    }

    field.progress = scrollYProgress.get();
    field.start();

    const io = new IntersectionObserver(([e]) => field.setPaused(!e.isIntersecting), {
      rootMargin: "10% 0px 10% 0px",
    });
    io.observe(host);

    return () => {
      io.disconnect();
      field.dispose();
      fieldRef.current = null;
    };
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (fieldRef.current) fieldRef.current.progress = v;
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
