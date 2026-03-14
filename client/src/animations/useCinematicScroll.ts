"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { useCinematicStore } from "@/state/cinematicStore";

type UseCinematicScrollProps = {
  sectionRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

export function useCinematicScroll({ sectionRef, enabled = true }: UseCinematicScrollProps) {
  const setScrollProgress = useCinematicStore((state) => state.setScrollProgress);
  const setMovementBlur = useCinematicStore((state) => state.setMovementBlur);

  useEffect(() => {
    if (!enabled || !sectionRef.current) {
      return;
    }

    let isMounted = true;
    let ctx: gsap.Context | null = null;

    const configureScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!isMounted || !sectionRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
            const blur = Math.abs(self.getVelocity()) / 320;
            setMovementBlur(blur);
          },
        });
      }, sectionRef);
    };

    configureScrollTrigger();

    return () => {
      isMounted = false;
      ctx?.revert();
      setMovementBlur(0);
    };
  }, [enabled, sectionRef, setMovementBlur, setScrollProgress]);
}
