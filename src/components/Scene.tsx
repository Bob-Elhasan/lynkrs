"use client";

import * as React from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * A pinned scene whose scroll range drives the reveal of its own contents.
 *
 * This is the difference between content that animates *while* you scroll and
 * content that animates *because* you scroll: a `Step` maps a slice of the
 * scene's progress directly onto opacity and offset, so half a scroll leaves
 * an element half-revealed, and scrolling back takes it away again.
 */

const SceneProgress = React.createContext<MotionValue<number> | null>(null);

export function useSceneProgress() {
  const p = React.useContext(SceneProgress);
  if (!p) throw new Error("<Step> must be used inside a <Scene>");
  return p;
}

type SceneProps = {
  children: React.ReactNode;
  /** Scroll distance the scene occupies. More = slower, more deliberate reveal. */
  depth?: string;
  className?: string;
  id?: string;
};

export default function Scene({ children, depth = "260vh", className, id }: SceneProps) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className={`scene ${className ?? ""}`} id={id} style={{ height: depth }}>
      <div className="scene-stage">
        <div className="shell scene-inner">
          <SceneProgress.Provider value={scrollYProgress}>{children}</SceneProgress.Provider>
        </div>
      </div>
    </section>
  );
}

type StepProps = {
  children: React.ReactNode;
  /** Progress at which this element starts appearing. */
  from: number;
  /** Progress at which it is fully revealed. */
  to: number;
  /** Progress at which it starts leaving. Omit to keep it on screen. */
  until?: number;
  /** Vertical travel in px as it enters. */
  travel?: number;
  className?: string;
};

export function Step({ children, from, to, until, travel = 34, className }: StepProps) {
  const p = useSceneProgress();

  // Function transforms, not array ranges. An array-range useTransform whose
  // input identity changes gets treated as a style change, and Motion then
  // *animates* the element on its own clock (a WAAPI animation overriding the
  // inline value) — which is exactly the "runs alongside the scroll instead of
  // because of it" problem this whole component exists to fix. One callback,
  // one stable MotionValue, value read straight off progress.
  const a = Math.max(0, Math.min(from, 1));
  const b = Math.max(a + 0.001, Math.min(to, 1));
  const hasExit = until !== undefined && until > b;
  const c = hasExit ? Math.min(until as number, 0.999) : 1;
  const d = hasExit ? Math.min(c + 0.1, 1) : 1;

  const reveal = React.useCallback(
    (v: number) => {
      if (v <= a) return 0;
      if (v < b) return (v - a) / (b - a);
      if (!hasExit || v <= c) return 1;
      if (v >= d) return 0;
      return 1 - (v - c) / (d - c);
    },
    [a, b, c, d, hasExit]
  );

  const opacity = useTransform(p, reveal);
  const y = useTransform(p, (v) => {
    const r = reveal(v);
    // Enters from below; on exit drifts up rather than back down.
    return v > c && hasExit ? -travel * 0.5 * (1 - r) : travel * (1 - r);
  });

  return (
    <motion.div className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

/**
 * A rule that draws itself across a progress slice — the scroll literally
 * pulls the line out.
 */
export function StepRule({ from, to }: { from: number; to: number }) {
  const p = useSceneProgress();
  const scaleX = useTransform(p, (v) =>
    v <= from ? 0 : v >= to ? 1 : (v - from) / (to - from)
  );
  return <motion.div className="scene-rule" style={{ scaleX }} aria-hidden="true" />;
}

/** Scene index + label, revealed the same way. */
export function StepMeta({
  idx,
  label,
  from = 0,
  to = 0.08,
}: {
  idx: string;
  label: string;
  from?: number;
  to?: number;
}) {
  const p = useSceneProgress();
  const opacity = useTransform(p, (v) =>
    v <= from ? 0 : v >= to ? 1 : (v - from) / (to - from)
  );
  return (
    <motion.div className="meta scene-meta" style={{ opacity }}>
      <span className="idx">{idx}</span>
      <span className="lbl">{label}</span>
    </motion.div>
  );
}
