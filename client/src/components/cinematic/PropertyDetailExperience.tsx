"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { CityProperty } from "@/three/data/properties";
import { MagneticButton } from "./MagneticButton";

type PropertyDetailExperienceProps = {
  property: CityProperty;
};

export function PropertyDetailExperience({ property }: PropertyDetailExperienceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let ctx: gsap.Context | null = null;

    const setup = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!isMounted || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.from(".detail-reveal", {
          y: 64,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".detail-flow",
            start: "top 78%",
          },
        });
      }, rootRef);
    };

    setup();

    return () => {
      isMounted = false;
      ctx?.revert();
    };
  }, []);

  const gallery = [property.heroImage, property.image, "/landing-splash.jpg", "/landing-call-to-action.jpg"];

  return (
    <motion.main
      ref={rootRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="min-h-screen bg-[#05040c] pb-20 text-white"
    >
      <section className="relative h-[78vh] overflow-hidden">
        <Image src={property.heroImage} alt={property.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-[#05040c]" />

        <div className="absolute inset-x-0 top-8 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/landing" scroll={false}>
            <MagneticButton className="bg-white/10">Back to City</MagneticButton>
          </Link>
          <div className="rounded-full border border-white/30 bg-black/30 px-4 py-2 text-sm backdrop-blur-xl">
            {property.location}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-20 mx-auto max-w-7xl px-6 md:px-10">
          <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">{property.name}</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">{property.description}</p>
        </div>
      </section>

      <section className="detail-flow mx-auto mt-10 grid max-w-7xl gap-8 px-6 md:grid-cols-[1.5fr_1fr] md:px-10">
        <div className="space-y-6">
          <article className="detail-reveal rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Property Snapshot</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Monthly Rent</p>
                <p className="mt-2 text-xl font-semibold">${property.price.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Bedrooms</p>
                <p className="mt-2 text-xl font-semibold">{property.bedrooms}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Rating</p>
                <p className="mt-2 text-xl font-semibold">{property.rating.toFixed(1)}</p>
              </div>
            </div>
          </article>

          <article className="detail-reveal rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Interactive Gallery</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {gallery.map((image, index) => (
                <motion.div
                  key={`${image}-${index}`}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative h-52 overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={image}
                    alt={`${property.name} gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </motion.div>
              ))}
            </div>
          </article>

          <article className="detail-reveal rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Location Pulse</h2>
            <div className="relative mt-5 h-64 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_10%_10%,rgba(251,146,60,0.35),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.4),transparent_35%)]" />
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_0_12px_rgba(251,146,60,0.2)]" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-orange-200/50" />
              <p className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-xl">
                {property.location} · 6 min to transit
              </p>
            </div>
          </article>
        </div>

        <aside className="detail-reveal md:sticky md:top-28 md:h-fit">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
            <h3 className="text-xl font-semibold">Book This Property</h3>
            <p className="mt-2 text-sm text-white/75">
              Reserve a private tour, request a lease draft, and unlock an AI-curated neighborhood report.
            </p>
            <div className="mt-6 space-y-3">
              <MagneticButton className="w-full bg-gradient-to-r from-orange-300 to-amber-200 text-slate-900">
                Request Private Tour
              </MagneticButton>
              <MagneticButton className="w-full border-cyan-200/60 text-cyan-100">
                Start Application
              </MagneticButton>
            </div>
          </div>
        </aside>
      </section>
    </motion.main>
  );
}
