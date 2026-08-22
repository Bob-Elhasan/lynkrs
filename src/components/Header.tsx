"use client";

import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#method", label: "How we work" },
  { href: "#suite", label: "Growth Suite" },
  { href: "#modules", label: "Modules" },
  { href: "#partner", label: "Partnership" },
];

export default function Header() {
  const [pill, setPill] = useState(false);
  const [hide, setHide] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setPill(y > 80);
      setHide(y > lastY.current && y > 400);
      lastY.current = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`topbar${pill ? " pill" : ""}${hide ? " hide" : ""}`}
      id="topbar"
    >
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
        <a className="topcta" href="#contact">
          Start a conversation
          <span className="arw">
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </header>
  );
}
