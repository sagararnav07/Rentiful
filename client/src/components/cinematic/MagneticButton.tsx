"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export function MagneticButton({ className, onClick, children }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const strength = 16;

    const onMove = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);

      button.style.transform = `translate3d(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px, 0)`;
    };

    const onLeave = () => {
      button.style.transform = "translate3d(0, 0, 0)";
    };

    button.addEventListener("mousemove", onMove);
    button.addEventListener("mouseleave", onLeave);

    return () => {
      button.removeEventListener("mousemove", onMove);
      button.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <motion.button
      ref={buttonRef}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      data-cursor="cta"
      className={cn(
        "group relative overflow-hidden rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-transform duration-300",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
