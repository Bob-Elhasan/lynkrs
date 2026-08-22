"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { Slot, type WithAsChild } from "./slot";

type MagneticProps = WithAsChild<HTMLMotionProps<"div"> & { strength?: number }>;

export function Magnetic({ strength = 0.3, asChild = false, ...props }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    />
  );
}
