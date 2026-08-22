import * as React from "react";
import { type MotionValue } from "motion/react";

export function useMotionValueState(motionValue: MotionValue): number {
  return React.useSyncExternalStore(
    (callback) => {
      const unsub = motionValue.on("change", callback);
      return unsub;
    },
    () => motionValue.get(),
    () => motionValue.get()
  );
}
