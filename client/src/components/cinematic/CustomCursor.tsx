"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useCinematicStore } from "@/state/cinematicStore";

export function CustomCursor() {
  const mode = useCinematicStore((state) => state.cursorMode);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const hiddenOnTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || hiddenOnTouch) return;

    const setOuterX = gsap.quickTo(outer, "x", { duration: 0.25, ease: "power3.out" });
    const setOuterY = gsap.quickTo(outer, "y", { duration: 0.25, ease: "power3.out" });
    const setInnerX = gsap.quickTo(inner, "x", { duration: 0.08, ease: "power2.out" });
    const setInnerY = gsap.quickTo(inner, "y", { duration: 0.08, ease: "power2.out" });

    const onMove = (event: PointerEvent) => {
      setOuterX(event.clientX);
      setOuterY(event.clientY);
      setInnerX(event.clientX);
      setInnerY(event.clientY);
    };

    window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [hiddenOnTouch]);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || hiddenOnTouch) return;

    if (mode === "interactive") {
      gsap.to(outer, { width: 56, height: 56, backgroundColor: "rgba(147, 197, 253, 0.18)", duration: 0.2 });
      gsap.to(inner, { scale: 1.6, duration: 0.2 });
      return;
    }

    if (mode === "cta") {
      gsap.to(outer, { width: 64, height: 64, borderColor: "rgba(251, 146, 60, 0.9)", duration: 0.2 });
      gsap.to(inner, { scale: 1.9, backgroundColor: "rgba(251, 146, 60, 1)", duration: 0.2 });
      return;
    }

    gsap.to(outer, {
      width: 44,
      height: 44,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(255, 255, 255, 0.45)",
      duration: 0.2,
    });
    gsap.to(inner, { scale: 1, backgroundColor: "rgba(255, 255, 255, 1)", duration: 0.2 });
  }, [hiddenOnTouch, mode]);

  if (hiddenOnTouch) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/10 backdrop-blur-lg"
      />
      <div
        ref={innerRef}
        className="pointer-events-none fixed left-0 top-0 z-[121] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
    </>
  );
}
