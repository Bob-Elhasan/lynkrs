"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";

export function MethodStep({ index, title, body }: { index: number; title: string; body: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });
  const active = useInView(ref, { margin: "-45% 0px -45% 0px" });

  return (
    <motion.div
      ref={ref}
      className={`step${active ? " active" : ""}`}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.07 }}
    >
      <span className="sn"></span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </motion.div>
  );
}
