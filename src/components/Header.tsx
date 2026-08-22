"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/animate-ui/magnetic";

const NAV_LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#method", label: "How we work" },
  { href: "#suite", label: "Growth Suite" },
  { href: "#modules", label: "Modules" },
  { href: "#partner", label: "Partnership" },
];

/**
 * Sits below the hero in normal flow, then sticks to the top of the viewport
 * once scrolled past. A zero-height sentinel above it reports when that
 * happens so the bar can take on its condensed glass treatment.
 */
export default function Header() {
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="topbar-sentinel" />
      <header className={`topbar${stuck ? " pill" : ""}`} id="topbar">
        <div className="topbar-in">
          <a className="brand" href="#top">
            <span className="wordmark">Lynkrs.</span>
          </a>
          <nav className="topnav">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <Magnetic asChild strength={0.4}>
            <a className="topcta" href="#contact">
              Start a conversation
              <span className="arw">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </Magnetic>
        </div>
      </header>
    </>
  );
}
