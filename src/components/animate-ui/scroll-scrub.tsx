"use client";

import * as React from "react";
import { motion, useScroll, useTransform, type HTMLMotionProps } from "motion/react";

import { Slot, type WithAsChild } from "./slot";

/** Scale + fade an element in as it crosses into view, scrubbed directly to scroll position. */
type ScrollScaleProps = WithAsChild<
  HTMLMotionProps<"div"> & {
    fromScale?: number;
  }
>;

export function ScrollScale({ fromScale = 0.92, asChild = false, ...props }: ScrollScaleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.4"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [fromScale, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const Component = asChild ? Slot : motion.div;

  return <Component ref={ref} style={{ scale, opacity }} {...props} />;
}

/**
 * Draws a fill bar's scaleY from 0-1 as it scrolls through view. Relies on the
 * element itself being CSS-sized (e.g. height:100%) to match the track it overlays,
 * so it can target its own bounding box instead of needing an external container ref.
 */
export function ScrollFill({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.6"],
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
      aria-hidden="true"
    />
  );
}

/** Vertical parallax drift tied to how far this element itself has scrolled through the viewport. */
type ParallaxProps = HTMLMotionProps<"div"> & { speed?: number };

export function Parallax({ speed = 0.2, style, ...props }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);

  return <motion.div ref={ref} style={{ y, ...style }} {...props} />;
}
