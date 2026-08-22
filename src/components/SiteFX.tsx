"use client";

import { ScrollProgressProvider, ScrollProgress } from "@/components/animate-ui/scroll-progress";
import { CursorDot } from "@/components/animate-ui/cursor-dot";

export default function SiteFX() {
  return (
    <>
      <ScrollProgressProvider>
        <ScrollProgress className="fx-progress" />
      </ScrollProgressProvider>
      <div className="fx-grain" aria-hidden="true" />
      <CursorDot />
    </>
  );
}
