"use client";

import { useEffect } from "react";

/**
 * One quiet entrance for the whole page: anything marked `.rv` fades and
 * lifts once as it comes into view, then is left alone. Deliberately the
 * only motion on the page besides hover states.
 */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          // Siblings in a group stagger slightly so lists arrive in order.
          const delay = Number(el.dataset.delay ?? 0);
          window.setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
