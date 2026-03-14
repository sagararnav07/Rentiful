"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { CityExperienceCanvas } from "@/three/CityExperienceCanvas";
import { useLenisSmoothScroll } from "@/hooks/useLenisSmoothScroll";
import { useCinematicScroll } from "@/animations/useCinematicScroll";
import { useCinematicStore } from "@/state/cinematicStore";
import { propertyById } from "@/three/data/properties";
import { PropertyPreviewCard } from "./PropertyPreviewCard";
import { MagneticButton } from "./MagneticButton";
import { CustomCursor } from "./CustomCursor";

export function CinematicLandingExperience() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);
  const hoverCardRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const hoveredPropertyId = useCinematicStore((state) => state.hoveredPropertyId);
  const scrollProgress = useCinematicStore((state) => state.scrollProgress);
  const movementBlur = useCinematicStore((state) => state.movementBlur);
  const introComplete = useCinematicStore((state) => state.introComplete);
  const setCursorMode = useCinematicStore((state) => state.setCursorMode);
  const setSelectedPropertyId = useCinematicStore((state) => state.setSelectedPropertyId);
  const setHoveredPropertyId = useCinematicStore((state) => state.setHoveredPropertyId);
  const setIsTransitioning = useCinematicStore((state) => state.setIsTransitioning);

  useLenisSmoothScroll(true);
  useCinematicScroll({ sectionRef });

  const hoveredProperty = useMemo(
    () => (hoveredPropertyId ? propertyById[hoveredPropertyId] ?? null : null),
    [hoveredPropertyId]
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const cursorHost = target.closest("[data-cursor]") as HTMLElement | null;
      if (!cursorHost) return;

      const cursorType = cursorHost.dataset.cursor;
      setCursorMode(cursorType === "cta" ? "cta" : "interactive");
    };

    const onPointerOut = (event: PointerEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (relatedTarget?.closest("[data-cursor]")) {
        return;
      }

      setCursorMode(hoveredPropertyId ? "interactive" : "default");
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
    };
  }, [hoveredPropertyId, setCursorMode]);

  useEffect(() => {
    return () => {
      setSelectedPropertyId(null);
      setHoveredPropertyId(null);
      setIsTransitioning(false);
      setCursorMode("default");
    };
  }, [setCursorMode, setHoveredPropertyId, setIsTransitioning, setSelectedPropertyId]);

  const handleOpenProperty = (slug: string) => {
    router.push(`/landing/properties/${slug}`, { scroll: false });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className="relative min-h-[430vh] cursor-none overflow-x-clip bg-[#04030b] text-white"
    >
      <CustomCursor />

      <section ref={sectionRef} className="relative h-[430vh]">
        <div className="sticky top-0 h-screen w-screen overflow-hidden">
          <div className="absolute inset-0">
            <CityExperienceCanvas
              pointerRef={pointerRef}
              hoverCardRef={hoverCardRef}
              onOpenProperty={handleOpenProperty}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400/20 via-purple-900/10 to-transparent"
            style={{ filter: `blur(${movementBlur * 0.35}px)` }}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

          <div className="absolute inset-x-0 top-0 z-20 px-8 pt-12 md:px-16 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex max-w-[90rem] items-start justify-between gap-6"
            >
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/90 shadow-[0_0_15px_rgba(251,146,60,0.5)] backdrop-blur-2xl"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Rentiful CityVerse 2.0
                </motion.div>
                <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-[5.5rem] leading-[1.05]">
                  Experience Rentals in a
                  <span className="block mt-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(236,72,153,0.4)]">
                    Living Metaverse
                  </span>
                </h1>
                <p className="mt-8 max-w-xl text-lg text-white/80 font-light leading-relaxed">
                  Scroll to fly through a breathing futuristic skyline. Hover illuminated buildings to unveil premium glass aesthetics. Click to execute a cinematic timeline dive into the property detail sequence.
                </p>
              </div>

              <div className="hidden min-w-[220px] rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl shadow-2xl md:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Exploration</p>
                <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <motion.div
                    className="relative h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-500"
                    animate={{ width: `${Math.round(scrollProgress * 100)}%` }}
                    transition={{ ease: "easeOut", duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full blur-sm" />
                  </motion.div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-sm font-semibold text-white/90">{Math.round(scrollProgress * 100)}%</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Scanned</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-10 flex max-w-[90rem] flex-wrap items-center gap-5"
            >
              <MagneticButton
                onClick={() => {
                  const target = window.innerHeight * 1.7;
                  window.scrollTo({ top: target, behavior: "smooth" });
                }}
                className="bg-white text-black hover:bg-orange-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold tracking-wide"
              >
                Launch Exploration
                <Compass className="ml-3 inline h-5 w-5" />
              </MagneticButton>

              <MagneticButton
                onClick={() => {
                  const firstProperty = Object.values(propertyById)[0];
                  if (firstProperty) {
                    handleOpenProperty(firstProperty.slug);
                  }
                }}
                className="border-white/20 bg-white/5 text-white backdrop-blur-xl hover:bg-white/10 transition-all font-semibold"
              >
                Featured Listing
                <ArrowRight className="ml-3 inline h-5 w-5" />
              </MagneticButton>
            </motion.div>
          </div>

          <PropertyPreviewCard
            property={hoveredProperty}
            cardRef={hoverCardRef}
            onOpenProperty={handleOpenProperty}
          />

          <motion.div
            animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 20 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="pointer-events-none absolute bottom-12 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-6 py-3 text-xs font-semibold tracking-widest text-white/70 backdrop-blur-2xl uppercase shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Wheel Map Horizon
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-30 mx-auto -mt-8 max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Cinematic Discovery",
              description: "A GPU-accelerated low-poly city with atmospheric fog and dusk lighting designed for immersive property exploration.",
            },
            {
              title: "Interactive Property Layers",
              description: "Hover highlights, glass preview cards, custom cursor morphing, and magnetic controls that respond with physical depth.",
            },
            {
              title: "Frictionless Transition",
              description: "Click any tower to trigger a camera dive and enter a premium, motion-driven property detail environment.",
            },
          ].map((item) => (
            <motion.article
              key={item.title}
              whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
              transition={{ type: "spring", stiffness: 210, damping: 18 }}
              className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_25px_80px_-30px_rgba(14,116,144,0.8)] backdrop-blur-xl"
              data-cursor="interactive"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
