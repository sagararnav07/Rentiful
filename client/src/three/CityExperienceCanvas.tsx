"use client";

import { MutableRefObject, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette, DepthOfField } from "@react-three/postprocessing";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { CityParticles } from "@/three/components/CityParticles";
import { PropertyBuildings } from "@/three/components/PropertyBuildings";
import { cityProperties, propertyById } from "@/three/data/properties";
import { useCinematicStore } from "@/state/cinematicStore";

type PointerState = {
  x: number;
  y: number;
};

type CityExperienceCanvasProps = {
  pointerRef: MutableRefObject<PointerState>;
  hoverCardRef: MutableRefObject<HTMLDivElement | null>;
  onOpenProperty: (slug: string) => void;
};

function CityWorld({ pointerRef, hoverCardRef, onOpenProperty }: CityExperienceCanvasProps) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);

  const introComplete = useCinematicStore((state) => state.introComplete);
  const scrollProgress = useCinematicStore((state) => state.scrollProgress);
  const hoveredPropertyId = useCinematicStore((state) => state.hoveredPropertyId);
  const selectedPropertyId = useCinematicStore((state) => state.selectedPropertyId);
  const isTransitioning = useCinematicStore((state) => state.isTransitioning);
  const setIntroComplete = useCinematicStore((state) => state.setIntroComplete);
  const setSelectedPropertyId = useCinematicStore((state) => state.setSelectedPropertyId);
  const setIsTransitioning = useCinematicStore((state) => state.setIsTransitioning);

  const lookTarget = useRef(new THREE.Vector3(0, 1.6, 0));
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.fov = 46;
    camera.near = 0.1;
    camera.far = 160;
    camera.updateProjectionMatrix();

    camera.position.set(0, 17, 42);

    const introTimeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => setIntroComplete(true),
    });

    introTimeline.to(camera.position, { x: -18, y: 7, z: 16, duration: 2.6 }, 0);
    introTimeline.to(lookTarget.current, { x: -18, y: 2.1, z: 0, duration: 2.6 }, 0);
    introTimeline.to(camera.position, { x: -18, y: 6.1, z: 14.2, duration: 1.8 }, 2.1);

    return () => {
      introTimeline.kill();
      setIntroComplete(false);
      setIsTransitioning(false);
      setSelectedPropertyId(null);
    };
  }, [camera, setIntroComplete, setIsTransitioning, setSelectedPropertyId]);

  useEffect(() => {
    if (!selectedPropertyId || !introComplete) {
      return;
    }

    const property = propertyById[selectedPropertyId];
    if (!property) {
      return;
    }

    setIsTransitioning(true);

    const [x, y, z] = property.position;

    const transition = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => onOpenProperty(property.slug),
    });

    transition.to(camera.position, { x: x + 1.7, y: y + 1.3, z: z + 2.2, duration: 1.25 }, 0);
    transition.to(lookTarget.current, { x, y: y * 0.75, z, duration: 1.25 }, 0);

    return () => {
      transition.kill();
    };
  }, [camera, introComplete, onOpenProperty, selectedPropertyId, setIsTransitioning]);

  useFrame(() => {
    const pointer = pointerRef.current;

    if (introComplete && !isTransitioning) {
      const cameraLaneX = -18 + scrollProgress * 36;

      desiredPosition.set(
        cameraLaneX + pointer.x * 0.95,
        6.1 + pointer.y * 0.45,
        14.1 + Math.abs(pointer.x) * 0.45
      );
      desiredLook.set(cameraLaneX + pointer.x * 1.2, 1.9 + pointer.y * 0.42, 0.2);

      camera.position.lerp(desiredPosition, 0.05);
      lookTarget.current.lerp(desiredLook, 0.06);
    }

    camera.lookAt(lookTarget.current);

    const card = hoverCardRef.current;
    if (!card || !hoveredPropertyId || isTransitioning) {
      if (card) card.style.opacity = "0";
      return;
    }

    const property = propertyById[hoveredPropertyId];
    if (!property) {
      card.style.opacity = "0";
      return;
    }

    projected.set(
      property.position[0],
      property.position[1] + property.dimensions.height * 0.62,
      property.position[2]
    );
    projected.project(camera);

    const isVisible = projected.z <= 1;
    if (!isVisible) {
      card.style.opacity = "0";
      return;
    }

    const screenX = (projected.x * 0.5 + 0.5) * size.width;
    const screenY = (-projected.y * 0.5 + 0.5) * size.height;

    card.style.opacity = "1";
    card.style.transform = `translate3d(${screenX}px, ${screenY - 18}px, 0) translate(-50%, -100%)`;
  });

  const handleBuildingSelect = (propertyId: string) => {
    if (isTransitioning) return;
    setSelectedPropertyId(propertyId);
  };

  return (
    <>
      <color attach="background" args={["#030514"]} />
      {/* Exponential fog for atmosphere */}
      <fogExp2 attach="fog" args={["#070a20", 0.012]} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <ambientLight intensity={1.5} color="#1d4ed8" />
      <directionalLight
        position={[-20, 10, -20]}
        intensity={6.0}
        color="#f97316"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[10, 5, 20]} intensity={4.5} color="#8b5cf6" distance={80} />
      <pointLight position={[-15, 8, 15]} intensity={3.5} color="#ec4899" distance={70} />

      {/* Grid Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[400, 200]} />
        <meshStandardMaterial color="#020410" roughness={0.2} metalness={0.9} />
      </mesh>

      <PropertyBuildings onBuildingSelect={handleBuildingSelect} />
      <CityParticles />

      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.01} focalLength={0.15} bokehScale={2.5} />
        <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.5} luminanceSmoothing={0.8} />
        <Noise opacity={0.025} premultiply />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

export function CityExperienceCanvas({ pointerRef, hoverCardRef, onOpenProperty }: CityExperienceCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 8, 24], fov: 46 }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <CityWorld pointerRef={pointerRef} hoverCardRef={hoverCardRef} onOpenProperty={onOpenProperty} />
      </Suspense>
    </Canvas>
  );
}
