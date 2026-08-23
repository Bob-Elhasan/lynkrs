"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// The form, its country data and its validators are a chunk of their own, so
// the page itself stays light until somebody actually wants to talk to us.
const LeadModal = dynamic(() => import("./LeadModal"), { ssr: false });

const SEEN_KEY = "lynkrs.lead.prompted";
/** Long enough that the popup never lands on someone still reading the hero. */
const EXIT_ARMS_AFTER = 12_000;

export default function LeadFlow() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  /* ── every call to action on the page opens the journey ──────────────── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement | null)?.closest?.('a[href="#contact"]');
      if (!link) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* ── and once, when the cursor heads for the tab bar ─────────────────── */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      /* private mode: treat as unseen */
    }

    let armed = false;
    const arm = window.setTimeout(() => (armed = true), EXIT_ARMS_AFTER);

    const onLeave = (e: MouseEvent) => {
      if (!armed || e.clientY > 0 || e.relatedTarget) return;
      // one prompt per visit, whatever they do with it
      document.removeEventListener("mouseout", onLeave);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* nothing to do */
      }
      setOpen(true);
    };

    document.addEventListener("mouseout", onLeave);
    return () => {
      window.clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  /* someone who has opened it once should not be ambushed later */
  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* nothing to do */
    }
  }, [open]);

  return open ? <LeadModal onClose={close} /> : null;
}
