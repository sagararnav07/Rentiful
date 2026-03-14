"use client";

import { useMemo, useRef } from "react";
import { Points } from "three";
import { useFrame } from "@react-three/fiber";

const PARTICLE_COUNT = 600;

export function CityParticles() {
  const pointsRef = useRef<Points | null>(null);

  const [positions, sizes] = useMemo(() => {
    const positionBuffer = new Float32Array(PARTICLE_COUNT * 3);
    const sizeBuffer = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const radius = 22 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 10 + 0.3;

      positionBuffer[i * 3] = Math.cos(theta) * radius;
      positionBuffer[i * 3 + 1] = y;
      positionBuffer[i * 3 + 2] = Math.sin(theta) * radius * 0.45;

      sizeBuffer[i] = Math.random() * 1.2 + 0.25;
    }

    return [positionBuffer, sizeBuffer];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.015;
    pointsRef.current.rotation.x = Math.sin(performance.now() * 0.00008) * 0.06;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fef3c7"
        size={0.13}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}
