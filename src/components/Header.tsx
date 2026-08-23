"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#method", label: "How we work" },
  { href: "#suite", label: "Growth Suite" },
  { href: "#modules", label: "What we run" },
  { href: "#partner", label: "Together" },
];

/**
 * Sits below the hero, then sticks to the top once scrolled past. A zero
 * height sentinel above it reports when that happens so the bar can pick up
 * its divider only when it is actually overlapping content.
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
      <div ref={sentinel} aria-hidden="true" />
      <header className={`topbar${stuck ? " stuck" : ""}`}>
        <div className="topbar-in">
          <a className="wordmark" href="#top" title="Back to top">
            <Logo />
          </a>
          <nav className="topnav">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <a className="topcta" href="#contact">
            <span>Start a conversation</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </header>
    </>
  );
}
