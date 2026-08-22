"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function SiteFX() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.innerWidth > 900;

    if (reduce) {
      document.querySelectorAll(".rv,.stg,.fx-scrub").forEach((el) => el.classList.add("in"));
      gsap.set(".fx-scrub", { opacity: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const cleanups: Array<() => void> = [];

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    });

    // progress bar
    const progressTrigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => gsap.set(".fx-progress", { scaleX: self.progress }),
    });
    cleanups.push(() => progressTrigger.kill());

    // batched entrance reveals
    const batches: ScrollTrigger[] = [];
    const batchReveal = (selector: string, stagger: number) => {
      const created = ScrollTrigger.batch(selector, {
        start: "top 85%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger }),
      });
      batches.push(...created);
    };
    batchReveal(".rv", 0.12);
    batchReveal(".stg", 0.08);
    cleanups.push(() => batches.forEach((b) => b.kill()));

    // scrub-owned dramatic reveals (dark section quote, closer headline)
    const scrubTriggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>(".fx-scrub").forEach((el) => {
      const anim = gsap.fromTo(
        el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 40%",
            scrub: 0.6,
          },
        }
      );
      if (anim.scrollTrigger) scrubTriggers.push(anim.scrollTrigger);
    });
    cleanups.push(() => scrubTriggers.forEach((t) => t.kill()));

    // ambient parallax orbs (desktop only)
    if (wide) {
      document.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0.2");
        const trigger = el.closest("section") || el.parentElement;
        const anim = gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: trigger as Element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
        if (anim.scrollTrigger) scrubTriggers.push(anim.scrollTrigger);
      });
    }

    // method timeline draw + active step highlight
    const methodSteps = document.querySelector(".method .steps");
    if (methodSteps) {
      const fillAnim = gsap.fromTo(
        ".method .timeline-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: methodSteps, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        }
      );
      if (fillAnim.scrollTrigger) scrubTriggers.push(fillAnim.scrollTrigger);

      const stepEls = document.querySelectorAll(".method .step");
      stepEls.forEach((step) => {
        const t = ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => step.classList.add("active"),
          onEnterBack: () => step.classList.add("active"),
          onLeave: () => step.classList.remove("active"),
          onLeaveBack: () => step.classList.remove("active"),
        });
        batches.push(t);
      });
    }

    // magnetic buttons
    if (fine) {
      const magnets = document.querySelectorAll<HTMLElement>(".btn, .topcta");
      magnets.forEach((m) => {
        const xTo = gsap.quickTo(m, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(m, "y", { duration: 0.4, ease: "power3" });
        const move = (e: MouseEvent) => {
          const r = m.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.3);
          yTo((e.clientY - r.top - r.height / 2) * 0.3);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        m.addEventListener("mousemove", move);
        m.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          m.removeEventListener("mousemove", move);
          m.removeEventListener("mouseleave", leave);
        });
      });

      // cursor dot
      const dot = cursorRef.current;
      if (dot) {
        const dotX = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3" });
        const cursorMove = (e: MouseEvent) => {
          dotX(e.clientX);
          dotY(e.clientY);
        };
        window.addEventListener("mousemove", cursorMove);
        cleanups.push(() => window.removeEventListener("mousemove", cursorMove));

        const grow = () => dot.classList.add("big");
        const shrink = () => dot.classList.remove("big");
        const hoverables = document.querySelectorAll("a, button, .btn, .pcard, .cost, .mod-head");
        hoverables.forEach((h) => {
          h.addEventListener("mouseenter", grow);
          h.addEventListener("mouseleave", shrink);
        });
        cleanups.push(() => {
          hoverables.forEach((h) => {
            h.removeEventListener("mouseenter", grow);
            h.removeEventListener("mouseleave", shrink);
          });
        });
      }
    }

    ScrollTrigger.refresh();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="fx-progress" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />
      <div className="fx-cursor" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
