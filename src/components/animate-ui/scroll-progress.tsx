"use client";

import * as React from "react";
import { motion, useScroll, useSpring, type MotionValue, type HTMLMotionProps, type SpringOptions } from "motion/react";

import { Slot, type WithAsChild } from "./slot";
import { getStrictContext } from "./get-strict-context";
import { useMotionValueState } from "./use-motion-value-state";

type ScrollProgressContextType = {
  progress: MotionValue<number>;
  scale: MotionValue<number>;
};

const [LocalScrollProgressProvider, useScrollProgress] = getStrictContext<ScrollProgressContextType>("ScrollProgressContext");

type ScrollProgressProviderProps = {
  children: React.ReactNode;
  transition?: SpringOptions;
};

export function ScrollProgressProvider({
  transition = { stiffness: 250, damping: 40, bounce: 0 },
  ...props
}: ScrollProgressProviderProps) {
  const { scrollYProgress } = useScroll();
  const scale = useSpring(scrollYProgress, transition);

  return <LocalScrollProgressProvider value={{ progress: scrollYProgress, scale }} {...props} />;
}

type ScrollProgressProps = WithAsChild<HTMLMotionProps<"div">>;

export function ScrollProgress({ style, asChild = false, ...props }: ScrollProgressProps) {
  const { scale } = useScrollProgress();
  const scaleValue = useMotionValueState(scale);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      data-slot="scroll-progress"
      style={{ width: scaleValue * 100 + "%", ...style }}
      {...props}
    />
  );
}
