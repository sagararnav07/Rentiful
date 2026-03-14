"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BedDouble, MapPin, ArrowUpRight } from "lucide-react";
import { CityProperty } from "@/three/data/properties";
import { MagneticButton } from "./MagneticButton";

type PropertyPreviewCardProps = {
  property: CityProperty | null;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onOpenProperty: (slug: string) => void;
};

export function PropertyPreviewCard({ property, cardRef, onOpenProperty }: PropertyPreviewCardProps) {
  return (
    <div
      ref={cardRef}
      className="pointer-events-none absolute left-0 top-0 z-40 w-[320px] -translate-x-1/2 -translate-y-full opacity-0"
    >
      <AnimatePresence mode="wait">
        {property ? (
          <motion.article
            key={property.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto rounded-3xl border border-white/25 bg-white/10 p-3 shadow-[0_30px_80px_-20px_rgba(30,41,59,0.85)] backdrop-blur-2xl"
            data-cursor="interactive"
          >
            <div className="relative h-36 overflow-hidden rounded-2xl">
              <Image
                src={property.heroImage}
                alt={property.name}
                fill
                className="object-cover"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-2 left-2 rounded-full bg-black/45 px-3 py-1 text-sm font-semibold text-white">
                ${property.price.toLocaleString()}/mo
              </p>
            </div>

            <div className="px-1 pb-1 pt-3 text-white">
              <h3 className="text-base font-semibold leading-tight">{property.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                {property.location}
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-white/90">
                  <BedDouble className="h-3.5 w-3.5" />
                  {property.bedrooms} beds
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-amber-100">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  {property.rating.toFixed(1)}
                </span>
              </div>

              <MagneticButton
                onClick={() => onOpenProperty(property.slug)}
                className="mt-4 w-full bg-gradient-to-r from-orange-400/75 to-cyan-400/70 text-slate-950"
              >
                Quick Preview
                <ArrowUpRight className="ml-1 inline h-4 w-4" />
              </MagneticButton>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
