"use client";

import { useState } from "react";

const MODULES = [
  {
    mn: "M/01",
    title: "Performance and media buying",
    outcome: (
      <>
        Where most of the work happens. We turn paid media into{" "}
        <span className="em">revenue you can count on</span>, without spending more to get it.
      </>
    ),
    items: [
      "Paid media strategy and execution",
      "Ongoing performance work",
      "Funnel and conversion work",
      "Creative testing",
      "Budget efficiency and scaling",
    ],
  },
  {
    mn: "M/02",
    title: "Content and brand",
    outcome: (
      <>
        Content that earns its place. Made to bring{" "}
        <span className="em">costs down and returns up</span>, not just to fill a calendar.
      </>
    ),
    items: [
      "Social strategy and planning",
      "Storytelling framework",
      "Visual and written production",
      "Community growth",
      "Content performance analysis",
    ],
  },
  {
    mn: "M/03",
    title: "SEO revenue system",
    outcome: (
      <>
        Visibility that <span className="em">keeps paying</span>. Organic growth that does not disappear
        the day you pause the ads.
      </>
    ),
    items: [
      "Revenue projection and tracking",
      "Technical SEO and page experience",
      "Keyword and search intent",
      "On page optimisation",
      "Authority building",
    ],
  },
];

export default function Modules() {
  const [open, setOpen] = useState(0);

  return (
    <section className="band band-tint" id="modules">
      <div className="shell">
        <div className="meta rv">
          <span className="idx">06</span>
          <span className="lbl">What we run</span>
        </div>
        {MODULES.map((m, i) => (
          <div className={`mod rv${open === i ? " open" : ""}`} key={m.mn} data-delay={i * 70}>
            <button
              type="button"
              className="mod-head"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <span className="mn">{m.mn}</span>
              <h3>{m.title}</h3>
              <span className="tog" aria-hidden="true">
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
      </div>
    </section>
  );
}
