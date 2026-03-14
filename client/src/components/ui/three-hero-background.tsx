"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { cn } from "@/lib/utils";

type ThreeHeroBackgroundProps = {
  className?: string;
};

const COLORS = [0xf8d37c, 0xf59e0b, 0xfb7185, 0x60a5fa, 0x22d3ee, 0x34d399];

export function ThreeHeroBackground({ className }: ThreeHeroBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    const keyLight = new THREE.PointLight(0xffefc3, 2.2, 20);
    keyLight.position.set(3, 4, 4);
    const rimLight = new THREE.PointLight(0x60a5fa, 1.8, 20);
    rimLight.position.set(-4, -2, 4);
    scene.add(ambientLight, keyLight, rimLight);

    const meshes: THREE.Mesh[] = [];
    const meshCount = 10;

    for (let i = 0; i < meshCount; i += 1) {
      let geometry: THREE.BufferGeometry;
      if (i % 3 === 0) {
        geometry = new THREE.IcosahedronGeometry(0.45 + Math.random() * 0.18, 1);
      } else if (i % 3 === 1) {
        geometry = new THREE.TorusGeometry(0.35 + Math.random() * 0.14, 0.11, 20, 48);
      } else {
        geometry = new THREE.OctahedronGeometry(0.4 + Math.random() * 0.2, 0);
      }

      const material = new THREE.MeshStandardMaterial({
        color: COLORS[i % COLORS.length],
        roughness: 0.25,
        metalness: 0.55,
        transparent: true,
        opacity: 0.82,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const radius = 1.8 + Math.random() * 2.2;
      const angle = (i / meshCount) * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.6,
        (Math.random() - 0.5) * 2.4
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(mesh);
      meshes.push(mesh);
    }

    const pointer = new THREE.Vector2(0, 0);
    const targetCameraPosition = new THREE.Vector2(0, 0);

    const onPointerMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      pointer.x = (event.clientX / innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / innerHeight) * 2 - 1);
      targetCameraPosition.x = pointer.x * 0.9;
      targetCameraPosition.y = pointer.y * 0.55;
    };

    const onResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove);
    }
    window.addEventListener("resize", onResize);

    let morphTimeline: gsap.core.Timeline | null = null;
    if (!reduceMotion) {
      morphTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
      morphTimeline.to(group.rotation, { y: Math.PI * 2, duration: 24, ease: "none" }, 0);

      meshes.forEach((mesh, index) => {
        morphTimeline?.to(
          mesh.position,
          {
            x: `+=${(Math.random() - 0.5) * 1.2}`,
            y: `+=${(Math.random() - 0.5) * 1.0}`,
            z: `+=${(Math.random() - 0.5) * 0.8}`,
            duration: 5 + Math.random() * 2,
          },
          index * 0.12
        );
        morphTimeline?.to(
          mesh.rotation,
          {
            x: `+=${Math.PI * (0.35 + Math.random() * 0.45)}`,
            y: `+=${Math.PI * (0.2 + Math.random() * 0.3)}`,
            duration: 6 + Math.random() * 2,
          },
          index * 0.1
        );
      });
    }

    const clock = new THREE.Clock();
    let rafId = 0;

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();

      camera.position.x += (targetCameraPosition.x - camera.position.x) * 0.04;
      camera.position.y += (targetCameraPosition.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      if (reduceMotion) {
        group.rotation.y = elapsed * 0.08;
      }

      meshes.forEach((mesh, index) => {
        mesh.rotation.z += 0.0012 + index * 0.00008;
        mesh.rotation.x += 0.0008;
      });

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(rafId);
      if (!reduceMotion) {
        window.removeEventListener("pointermove", onPointerMove);
      }
      window.removeEventListener("resize", onResize);
      morphTimeline?.kill();

      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    />
  );
}
