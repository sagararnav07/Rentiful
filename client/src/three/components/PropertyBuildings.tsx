"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { cityProperties, propertyById } from "@/three/data/properties";
import { useCinematicStore } from "@/state/cinematicStore";

type PropertyBuildingsProps = {
  onBuildingSelect: (id: string) => void;
};

// Procedural shader for glowing windows
const buildingCustomShader = (shader: any) => {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
      #include <common>
      varying vec3 vWorldPos;
      varying vec3 vInstPosition;
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
      #include <begin_vertex>
      vInstPosition = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      vWorldPos = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
    `
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `
      #include <common>
      varying vec3 vWorldPos;
      varying vec3 vInstPosition;
      
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
    `
  );
  
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <emissivemap_fragment>",
    `
      #include <emissivemap_fragment>
      
      vec2 windowGrid = vec2(vWorldPos.x * 2.5, vWorldPos.y * 3.0);
      if (abs(normal.z) > 0.5) windowGrid = vec2(vWorldPos.x * 2.5, vWorldPos.y * 3.0);
      else if (abs(normal.x) > 0.5) windowGrid = vec2(vWorldPos.z * 2.5, vWorldPos.y * 3.0);
      else windowGrid = vec2(vWorldPos.x * 2.5, vWorldPos.z * 2.5);
      
      vec2 gridId = floor(windowGrid);
      vec2 gridUv = fract(windowGrid);
      
      if (normal.y < 0.5) {
        float isWindow = step(0.2, gridUv.x) * step(0.2, gridUv.y) * step(gridUv.x, 0.8) * step(gridUv.y, 0.8);
        
        float chanceToBeLit = random(gridId + vInstPosition.xz);
        
        if (isWindow > 0.0 && chanceToBeLit > 0.85) {
           float flicker = 0.8 + 0.2 * sin(vWorldPos.y * 10.0 + vInstPosition.x);
           vec3 windowColor = vec3(1.0, 0.7, 0.3) * flicker * 2.0; 
           totalEmissiveRadiance += windowColor;
        }
      }
    `
  );
};

export function PropertyBuildings({ onBuildingSelect }: PropertyBuildingsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const hoverPulseRef = useRef<THREE.Mesh>(null!);
  const bgMeshRef = useRef<THREE.InstancedMesh>(null!);
  
  const bgCount = 400; // Large background city setup

  const hoveredPropertyId = useCinematicStore((state) => state.hoveredPropertyId);
  const setHoveredPropertyId = useCinematicStore((state) => state.setHoveredPropertyId);
  const setCursorMode = useCinematicStore((state) => state.setCursorMode);
  const isTransitioning = useCinematicStore((state) => state.isTransitioning);

  const indexToId = useMemo(() => cityProperties.map((property) => property.id), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const color = new THREE.Color();

    cityProperties.forEach((property, index) => {
      const [x, y, z] = property.position;
      const { width, depth, height } = property.dimensions;

      dummy.position.set(x, y, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = (index % 3) * 0.1;
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(index, dummy.matrix);
      meshRef.current.setColorAt(index, color.set(property.palette.base));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (bgMeshRef.current) {
      for (let i = 0; i < bgCount; i++) {
        // Spread buildings wide and deep behind the main scene
        const x = (Math.random() - 0.5) * 250;
        const z = -30 - Math.random() * 120;
        
        const height = 4 + Math.random() * 35;
        const width = 2 + Math.random() * 4;
        const depth = 2 + Math.random() * 4;

        dummy.position.set(x, height / 2, z);
        dummy.scale.set(width, height, depth);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        
        bgMeshRef.current.setMatrixAt(i, dummy.matrix);
        bgMeshRef.current.setColorAt(i, color.set("#050b14").lerp(new THREE.Color("#131a2c"), Math.random()));
      }
      bgMeshRef.current.instanceMatrix.needsUpdate = true;
      if (bgMeshRef.current.instanceColor) {
        bgMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [dummy]);

  useFrame((state, delta) => {
    if (!hoverPulseRef.current) return;

    if (!hoveredPropertyId || isTransitioning) {
      hoverPulseRef.current.visible = false;
      return;
    }

    const property = propertyById[hoveredPropertyId];
    if (!property) {
      hoverPulseRef.current.visible = false;
      return;
    }

    const pulse = 1.03 + Math.sin(state.clock.elapsedTime * 4.2) * 0.04;
    hoverPulseRef.current.visible = true;
    hoverPulseRef.current.position.set(...property.position);
    hoverPulseRef.current.scale.set(
      property.dimensions.width * pulse,
      property.dimensions.height * pulse,
      property.dimensions.depth * pulse
    );
    hoverPulseRef.current.rotation.y += delta * 0.6;
  });

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (isTransitioning || event.instanceId === undefined) {
      return;
    }

    const propertyId = indexToId[event.instanceId];
    if (!propertyId) return;
    setHoveredPropertyId(propertyId);
    setCursorMode("interactive");
  };

  const clearHover = () => {
    setHoveredPropertyId(null);
    setCursorMode("default");
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (isTransitioning || event.instanceId === undefined) {
      return;
    }

    const propertyId = indexToId[event.instanceId];
    if (propertyId) {
      onBuildingSelect(propertyId);
    }
  };

  return (
    <group>
      {/* Distant background city */}
      <instancedMesh ref={bgMeshRef} args={[undefined as any, undefined as any, bgCount]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.6}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </instancedMesh>

      {/* Main interactive properties */}
      <instancedMesh
        ref={meshRef}
        args={[undefined as any, undefined as any, cityProperties.length]}
        castShadow
        receiveShadow
        onPointerMove={handleMove}
        onPointerOut={clearHover}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={2.0}
          emissive={new THREE.Color(0x020617)}
          emissiveIntensity={0.4}
          onBeforeCompile={buildingCustomShader}
        />
      </instancedMesh>

      <mesh ref={hoverPulseRef} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          transparent
          opacity={0.15}
          roughness={0.0}
          transmission={0.4}
          thickness={1.5}
          metalness={1.0}
          emissive="#3b82f6"
          emissiveIntensity={1.5}
        />
        <Edges color="#60a5fa" threshold={5} />
      </mesh>
    </group>
  );
}