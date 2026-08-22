"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Entry gate, mirroring wlt.design's pace.js "Launching 3D" screen that holds
 * the header hidden until `body.preloaded`. Counts to 100 while the page
 * settles, then curtains up.
 */
export default function Preloader() {
  const [pct, setPct] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    // Reduced motion still runs through the same rAF, just with no duration —
    // the first frame completes it and lifts the curtain immediately.
    const DURATION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1500;

    const tick = (now: number) => {
      const t = DURATION === 0 ? 1 : Math.min((now - start) / DURATION, 1);
      // Ease out so it decelerates into 100 rather than running linearly.
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        document.body.classList.add("preloaded");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preload"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preload-in">
            <span className="preload-word">Lynkrs.</span>
            <span className="preload-note">Launching 3D</span>
          </div>
          <div className="preload-pct">{String(pct).padStart(3, "0")}</div>
          <div className="preload-bar" style={{ transform: `scaleX(${pct / 100})` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
