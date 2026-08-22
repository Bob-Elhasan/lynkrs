"use client";

import { ScrollProgressProvider, ScrollProgress } from "@/components/animate-ui/scroll-progress";
import { CursorDot } from "@/components/animate-ui/cursor-dot";
import { LenisScroll } from "@/components/animate-ui/lenis-scroll";

export default function SiteFX() {
  return (
    <>
      <LenisScroll />
      <ScrollProgressProvider>
        <ScrollProgress className="fx-progress" />
      </ScrollProgressProvider>
      <div className="fx-grain" aria-hidden="true" />
      <CursorDot />
    </>
  );
}
