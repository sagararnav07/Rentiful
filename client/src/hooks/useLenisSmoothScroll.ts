"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function useLenisSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [enabled]);
}
