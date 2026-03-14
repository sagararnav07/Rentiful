import { create } from "zustand";

type CursorMode = "default" | "interactive" | "cta";

type CinematicState = {
  introComplete: boolean;
  scrollProgress: number;
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  isTransitioning: boolean;
  movementBlur: number;
  cursorMode: CursorMode;
  setIntroComplete: (value: boolean) => void;
  setScrollProgress: (value: number) => void;
  setHoveredPropertyId: (value: string | null) => void;
  setSelectedPropertyId: (value: string | null) => void;
  setIsTransitioning: (value: boolean) => void;
  setMovementBlur: (value: number) => void;
  setCursorMode: (value: CursorMode) => void;
};

export const useCinematicStore = create<CinematicState>((set) => ({
  introComplete: false,
  scrollProgress: 0,
  hoveredPropertyId: null,
  selectedPropertyId: null,
  isTransitioning: false,
  movementBlur: 0,
  cursorMode: "default",
  setIntroComplete: (value) => set({ introComplete: value }),
  setScrollProgress: (value) => set({ scrollProgress: Math.min(1, Math.max(0, value)) }),
  setHoveredPropertyId: (value) => set({ hoveredPropertyId: value }),
  setSelectedPropertyId: (value) => set({ selectedPropertyId: value }),
  setIsTransitioning: (value) => set({ isTransitioning: value }),
  setMovementBlur: (value) => set({ movementBlur: Math.min(16, Math.max(0, value)) }),
  setCursorMode: (value) => set({ cursorMode: value }),
}));
