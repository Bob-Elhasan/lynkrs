"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CursorDot() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [big, setBig] = React.useState(false);

  React.useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);

    const grow = () => setBig(true);
    const shrink = () => setBig(false);
    const hoverables = document.querySelectorAll("a, button, .btn, .pcard, .cost, .mod-head");
    hoverables.forEach((h) => {
      h.addEventListener("mouseenter", grow);
      h.addEventListener("mouseleave", shrink);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      hoverables.forEach((h) => {
        h.removeEventListener("mouseenter", grow);
        h.removeEventListener("mouseleave", shrink);
      });
    };
  }, [x, y]);

  return <motion.div className={`fx-cursor${big ? " big" : ""}`} style={{ x: springX, y: springY }} aria-hidden="true" />;
}
