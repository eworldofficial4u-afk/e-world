"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface WireframeCityscapeProps {
  scrollProgress: number;
}

interface BuildingData {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isAccent: boolean;
}

export default function WireframeCityscape({
  scrollProgress,
}: WireframeCityscapeProps) {
  const cityGroupRef = useRef<THREE.Group>(null);
  const trafficRef = useRef<THREE.Points>(null);
  const glitchTime = useRef(0);

  // Procedural Skyscraper Grid
  const buildings = useMemo<BuildingData[]>(() => {
    const list: BuildingData[] = [];
    let id = 0;
    const gridX = 7;
    const gridZ = 7;
    const spacingX = 4.5;
    const spacingZ = 4.5;
    const offsetX = ((gridX - 1) * spacingX) / 2;
    const offsetZ = ((gridZ - 1) * spacingZ) / 2;

    for (let x = 0; x < gridX; x++) {
      for (let z = 0; z < gridZ; z++) {
        // Leave avenues / central street open
        if (x === 3) continue;

        const posX = x * spacingX - offsetX;
        const posZ = z * spacingZ - offsetZ;
        
        // Random procedural skyscraper height
        const height = 4 + Math.pow(Math.random(), 1.5) * 14;
        const width = 2.2 + Math.random() * 1.2;
        const depth = 2.2 + Math.random() * 1.2;
        const isAccent = Math.random() > 0.8;
        const color = isAccent ? "#ff0055" : "#00f0ff";

        list.push({
          id: id++,
          position: [posX, height / 2, posZ],
          size: [width, height, depth],
          color,
          isAccent,
        });
      }
    }
    return list;
  }, []);

  // Pre-generate Box Edges for high-performance wireframe rendering
  const buildingMeshes = useMemo(() => {
    return buildings.map((b) => {
      const boxGeom = new THREE.BoxGeometry(...b.size);
      const edgesGeom = new THREE.EdgesGeometry(boxGeom);
      return {
        ...b,
        geometry: edgesGeom,
      };
    });
  }, [buildings]);

  // Traffic Light Trails
  const trafficData = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 16 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      speeds[i] = 4 + Math.random() * 10;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geom, speeds, count };
  }, []);

  useFrame((state, delta) => {
    // Camera cinematic sweep based on scroll progress
    const cam = state.camera;
    const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);

    // Dynamic camera coordinates through city canyon
    const targetCamX = Math.sin(progress * Math.PI * 1.4) * 8;
    const targetCamY = 18 - progress * 13 + Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    const targetCamZ = 22 - progress * 26;

    cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetCamX, 0.08);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetCamY, 0.08);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetCamZ, 0.08);

    const lookTargetZ = -progress * 15;
    cam.lookAt(0, 3 + (1 - progress) * 3, lookTargetZ);

    // Random glitch surge
    glitchTime.current += delta;
    if (cityGroupRef.current) {
      if (Math.sin(glitchTime.current * 4) > 0.985) {
        cityGroupRef.current.position.x = (Math.random() - 0.5) * 0.15;
      } else {
        cityGroupRef.current.position.x = 0;
      }
    }

    // Animate traffic light trails
    if (trafficRef.current) {
      const posAttr = trafficRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < trafficData.count; i++) {
        arr[i * 3 + 2] += trafficData.speeds[i] * delta;
        if (arr[i * 3 + 2] > 20) {
          arr[i * 3 + 2] = -20;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={cityGroupRef}>
      {/* Ground Grid Plane */}
      <gridHelper
        args={[80, 80, "#00f0ff", "#082528"]}
        position={[0, 0, 0]}
      />

      {/* Wireframe Skyscrapers */}
      {buildingMeshes.map((b) => (
        <group key={b.id} position={b.position}>
          {/* Glowing wireframe edges */}
          <lineSegments geometry={b.geometry}>
            <lineBasicMaterial
              color={b.color}
              linewidth={1.5}
              transparent
              opacity={b.isAccent ? 0.95 : 0.7}
              toneMapped={false}
            />
          </lineSegments>

          {/* Semi-transparent dark glass body */}
          <mesh>
            <boxGeometry args={b.size} />
            <meshBasicMaterial
              color="#010a0c"
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>
      ))}

      {/* High-speed aerial traffic streams */}
      <points ref={trafficRef} geometry={trafficData.geometry}>
        <pointsMaterial
          size={0.15}
          color="#ff0055"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
