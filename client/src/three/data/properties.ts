export type CityProperty = {
  id: string;
  slug: string;
  name: string;
  location: string;
  price: number;
  bedrooms: number;
  rating: number;
  image: string;
  heroImage: string;
  description: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  position: [number, number, number];
  palette: {
    base: string;
    emissive: string;
    glow: string;
  };
};

export const cityProperties: CityProperty[] = [
  {
    id: "p1",
    slug: "aether-tower-penthouse",
    name: "Aether Tower Penthouse",
    location: "Downtown Harbor",
    price: 4200,
    bedrooms: 3,
    rating: 4.9,
    image: "/landing-search1.png",
    heroImage: "/singlelisting-2.jpg",
    description:
      "Panoramic skyline views, private rooftop deck, and concierge services in a sunset-lit high-rise district.",
    dimensions: { width: 1.2, depth: 1.2, height: 4.8 },
    position: [-16, 2.4, -2],
    palette: { base: "#f59e0b", emissive: "#f97316", glow: "#fdba74" },
  },
  {
    id: "p2",
    slug: "marina-glass-loft",
    name: "Marina Glass Loft",
    location: "Marina Mile",
    price: 3600,
    bedrooms: 2,
    rating: 4.8,
    image: "/landing-search2.png",
    heroImage: "/singlelisting-3.jpg",
    description:
      "Double-height glass loft with cinematic sunset reflections and direct access to waterfront walkways.",
    dimensions: { width: 1.5, depth: 1.1, height: 3.7 },
    position: [-12, 1.85, 1.8],
    palette: { base: "#60a5fa", emissive: "#22d3ee", glow: "#93c5fd" },
  },
  {
    id: "p3",
    slug: "skyline-court-residence",
    name: "Skyline Court Residence",
    location: "Crescent District",
    price: 2900,
    bedrooms: 2,
    rating: 4.7,
    image: "/landing-search3.png",
    heroImage: "/landing-splash.jpg",
    description:
      "Modern residence with curated interiors and easy transit to arts, food, and nightlife neighborhoods.",
    dimensions: { width: 1.1, depth: 1.4, height: 3.2 },
    position: [-8.5, 1.6, -2.8],
    palette: { base: "#c084fc", emissive: "#f472b6", glow: "#f5d0fe" },
  },
  {
    id: "p4",
    slug: "atlas-park-villa",
    name: "Atlas Park Villa",
    location: "Garden Quarter",
    price: 5100,
    bedrooms: 4,
    rating: 4.95,
    image: "/landing-i1.png",
    heroImage: "/landing-call-to-action.jpg",
    description:
      "Large villa-style home with private courtyard, integrated smart controls, and serene green surroundings.",
    dimensions: { width: 1.9, depth: 1.7, height: 4.2 },
    position: [-4.8, 2.1, 2.6],
    palette: { base: "#34d399", emissive: "#10b981", glow: "#6ee7b7" },
  },
  {
    id: "p5",
    slug: "solstice-heights-suite",
    name: "Solstice Heights Suite",
    location: "Old Town Core",
    price: 3350,
    bedrooms: 2,
    rating: 4.75,
    image: "/landing-i2.png",
    heroImage: "/singlelisting-2.jpg",
    description:
      "Elegant suite featuring warm wood textures, skyline terrace access, and dedicated work-from-home alcove.",
    dimensions: { width: 1.3, depth: 1.1, height: 3.9 },
    position: [-0.8, 1.95, -1.7],
    palette: { base: "#fca5a5", emissive: "#fb7185", glow: "#fecdd3" },
  },
  {
    id: "p6",
    slug: "horizon-studio-labs",
    name: "Horizon Studio Labs",
    location: "Innovation Row",
    price: 2400,
    bedrooms: 1,
    rating: 4.6,
    image: "/landing-i3.png",
    heroImage: "/singlelisting-3.jpg",
    description:
      "Creative compact studio with modular furniture, ambient lighting scenes, and rooftop social lounge.",
    dimensions: { width: 0.95, depth: 0.95, height: 2.8 },
    position: [3.1, 1.4, 2.1],
    palette: { base: "#facc15", emissive: "#f59e0b", glow: "#fde68a" },
  },
  {
    id: "p7",
    slug: "lumen-riverside-duplex",
    name: "Lumen Riverside Duplex",
    location: "River Belt",
    price: 4700,
    bedrooms: 3,
    rating: 4.92,
    image: "/landing-i4.png",
    heroImage: "/landing-call-to-action.jpg",
    description:
      "Duplex with split-level living, floor-to-ceiling windows, and riverfront jogging routes right outside.",
    dimensions: { width: 1.45, depth: 1.3, height: 4.5 },
    position: [6.8, 2.25, -2.9],
    palette: { base: "#38bdf8", emissive: "#0ea5e9", glow: "#bae6fd" },
  },
  {
    id: "p8",
    slug: "nova-terrace-home",
    name: "Nova Terrace Home",
    location: "North Terrace",
    price: 3950,
    bedrooms: 3,
    rating: 4.84,
    image: "/landing-i5.png",
    heroImage: "/landing-splash.jpg",
    description:
      "Contemporary terrace residence with flexible family spaces and a shaded outdoor entertainment deck.",
    dimensions: { width: 1.4, depth: 1.6, height: 3.8 },
    position: [10.9, 1.9, 1.6],
    palette: { base: "#a78bfa", emissive: "#8b5cf6", glow: "#ddd6fe" },
  },
  {
    id: "p9",
    slug: "vanta-arc-apartments",
    name: "Vanta Arc Apartments",
    location: "Skybridge Zone",
    price: 2800,
    bedrooms: 1,
    rating: 4.66,
    image: "/landing-i6.png",
    heroImage: "/singlelisting-2.jpg",
    description:
      "Architectural apartment with curved facade, adaptive mood lighting, and co-living amenity floors.",
    dimensions: { width: 1.1, depth: 1.1, height: 3.1 },
    position: [14.3, 1.55, -1.1],
    palette: { base: "#fda4af", emissive: "#e11d48", glow: "#fecdd3" },
  },
  {
    id: "p10",
    slug: "aurora-boulevard-house",
    name: "Aurora Boulevard House",
    location: "Boulevard East",
    price: 5600,
    bedrooms: 4,
    rating: 4.97,
    image: "/landing-i7.png",
    heroImage: "/landing-call-to-action.jpg",
    description:
      "Signature boulevard address with cinematic entry hall, private garage, and premium wellness amenities.",
    dimensions: { width: 2.1, depth: 1.8, height: 5.1 },
    position: [18.2, 2.55, 2.8],
    palette: { base: "#fb923c", emissive: "#f97316", glow: "#fdba74" },
  },
];

export const propertyById = cityProperties.reduce<Record<string, CityProperty>>((acc, property) => {
  acc[property.id] = property;
  return acc;
}, {});

export const propertyBySlug = cityProperties.reduce<Record<string, CityProperty>>((acc, property) => {
  acc[property.slug] = property;
  return acc;
}, {});
