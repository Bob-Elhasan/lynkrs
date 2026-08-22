"use client";

import { useState } from "react";
import { Effect } from "@/components/animate-ui/effect";

const MODULES = [
  {
    mn: "M/01",
    title: "Performance & media buying",
    outcome: (
      <>
        Our core execution engine — turning paid media into <span className="em">predictable revenue</span>{" "}
        through scalable, high-efficiency spend.
      </>
    ),
    items: [
      "Paid media strategy & execution",
      "Continuous performance optimisation",
      "Funnel & conversion optimisation",
      "Creative testing & iteration",
      "Budget efficiency & scaling logic",
    ],
  },
  {
    mn: "M/02",
    title: "Content & brand",
    outcome: (
      <>
        Content as a performance asset, not a creative output — <span className="em">lower CAC, higher ROAS</span>{" "}
        across every touchpoint.
      </>
    ),
    items: [
      "Social media strategy & planning",
      "Content storytelling framework",
      "Visual & written production",
      "Community engagement & growth",
      "Content performance analysis",
    ],
  },
  {
    mn: "M/03",
    title: "SEO revenue system",
    outcome: (
      <>
        Organic visibility turned into <span className="em">compounding revenue</span> — profitability that
        doesn&apos;t depend on paid spend.
      </>
    ),
    items: [
      "Revenue projection & SEO tracking",
      "Technical SEO & UX optimisation",
      "Keyword & search intent strategy",
      "Content & on-page optimisation",
      "Authority building & backlinks",
    ],
  },
];

export default function Modules() {
  const [open, setOpen] = useState(0);

  return (
    <section className="modules" id="modules">
      <div className="shell">
        <div className="meta">
          <span className="idx">06</span>
          <span className="lbl">Our modules</span>
        </div>
        <Effect fade slide>
          {MODULES.map((m, i) => (
            <div className={`mod${open === i ? " open" : ""}`} key={m.mn}>
              <button
                type="button"
                className="mod-head"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span className="mn">{m.mn}</span>
                <h3>{m.title}</h3>
                <span className="tog">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div className="mod-body">
                <div className="mod-inner">
                  <div className="mod-content">
                    <p className="outcome">{m.outcome}</p>
                    <ul className="mlist">
                      {m.items.map((item, idx) => (
                        <li key={item}>
                          <span className="mk">{String(idx + 1).padStart(2, "0")}</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Effect>
      </div>
    </section>
  );
}
