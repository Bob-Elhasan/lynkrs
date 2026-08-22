"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";

const PRODUCTS = [
  {
    rn: "01",
    stage: "Diagnostics",
    title: "Growth™ Diagnostics",
    voice: '"I just need to know if I\'m doing well."',
    body: "Audits across website, SEO, journey and channels — plus a 90-day roadmap that names the bottlenecks.",
  },
  {
    rn: "02",
    stage: "Launchpad",
    title: "Growth™ Launchpad",
    voice: '"I want to start this properly."',
    body: "Monthly strategy, SEO operations, lead generation and a KPI dashboard for the runway phase.",
  },
  {
    rn: "03",
    stage: "Accelerate",
    title: "Growth™ Accelerate",
    voice: '"Time to speed things up."',
    body: "Funnel and CRM optimisation, media oversight and nurturing built to lower CAC and lift revenue.",
  },
  {
    rn: "04",
    stage: "Scale",
    title: "Growth™ Scale",
    voice: '"Let\'s go big."',
    body: "Tracking, automation, SOPs and executive dashboards — the infrastructure predictable scaling needs.",
  },
];

/**
 * Vertical scroll drives a horizontal rail while the section is pinned —
 * the same construction as wlt.design's services section (pin + "+=320%",
 * translating the inner wrapper on X).
 */
export default function Rail() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Travel the rail by its overflow width: 4 cards at ~62vw, less one viewport.
  const x = useTransform(scrollYProgress, [0.06, 1], ["0vw", "-176vw"]);

  return (
    <section className="rail" ref={ref} id="suite">
      <div className="rail-stage">
        <div className="rail-head">
          <div className="meta">
            <span className="idx">05</span>
            <span className="lbl">The Growth™ Suite</span>
          </div>
          <h2>Four products. Four stages of growth.</h2>
          <p className="sub">Start wherever you are — each one hands off cleanly to the next.</p>
        </div>

        <motion.div className="rail-track" style={{ x }}>
          {PRODUCTS.map((p) => (
            <article className="rail-card" key={p.rn}>
              <div className="pcard-top">
                <span className="stage">{p.stage}</span>
                <span className="rn">{p.rn}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="voice">{p.voice}</p>
              <p>{p.body}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
