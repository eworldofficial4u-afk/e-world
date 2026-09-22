"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface VoxelChunkProps {
  scrollProgress: number;
  blockType?: "grass_carried" | "dirt" | "grass";
  interactiveHover?: boolean;
}

// -------------------------------------------------------------
// AUTHENTIC MINECRAFT 16x16 PALETTES & PIXEL MAPS
// -------------------------------------------------------------
const DIRT_PALETTE = [
  "#3c2717", // 0: dark crevice
  "#4a311b", // 1: deep shadow brown
  "#573c24", // 2: dark dirt
  "#684729", // 3: classic dirt brown
  "#74512e", // 4: mid loam
  "#865d38", // 5: warm rich earth
  "#966a42", // 6: light loam / sand speck
  "#aa7a4e", // 7: pebble highlight
];

const DIRT_PIXELS = [
  [3, 3, 2, 4, 3, 2, 3, 4, 3, 3, 2, 4, 5, 4, 3, 2],
  [2, 4, 5, 3, 1, 2, 5, 6, 4, 2, 1, 3, 4, 5, 2, 1],
  [3, 5, 6, 4, 2, 3, 4, 5, 3, 1, 2, 4, 6, 7, 4, 3],
  [2, 3, 4, 2, 1, 2, 3, 4, 2, 0, 1, 3, 5, 6, 3, 2],
  [1, 2, 3, 1, 0, 1, 2, 3, 1, 0, 1, 2, 4, 5, 2, 1],
  [3, 4, 4, 2, 1, 2, 4, 5, 3, 2, 3, 4, 3, 4, 3, 2],
  [4, 6, 5, 3, 2, 3, 5, 7, 5, 4, 4, 5, 2, 3, 4, 3],
  [3, 5, 4, 2, 1, 2, 4, 6, 4, 3, 3, 4, 1, 2, 3, 2],
  [2, 3, 3, 1, 0, 1, 3, 5, 3, 2, 2, 3, 1, 1, 2, 1],
  [3, 4, 4, 2, 1, 2, 4, 5, 4, 3, 3, 4, 2, 2, 3, 2],
  [4, 5, 6, 4, 3, 4, 5, 6, 5, 4, 5, 6, 4, 3, 4, 3],
  [3, 4, 5, 3, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2, 3, 2],
  [2, 3, 4, 2, 1, 2, 3, 4, 3, 2, 3, 4, 2, 1, 2, 1],
  [3, 4, 5, 3, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2, 3, 2],
  [4, 5, 6, 4, 3, 4, 5, 6, 5, 4, 5, 6, 4, 3, 4, 3],
  [3, 4, 4, 2, 1, 2, 3, 4, 3, 2, 3, 4, 3, 2, 3, 2],
];

// Pre-tinted vibrant grass palette as featured in grass_carried
const GRASS_PALETTE = [
  "#3b5e1e", // 0: deep shadow grass
  "#4a7424", // 1: dark blade
  "#598b2b", // 2: lush foliage
  "#68a033", // 3: classic grass green
  "#77b33b", // 4: vibrant top grass
  "#86c642", // 5: bright grass highlight
];

const GRASS_TOP_PIXELS = [
  [3, 3, 2, 4, 3, 2, 3, 4, 3, 3, 2, 4, 5, 4, 3, 2],
  [2, 4, 5, 3, 1, 2, 5, 4, 4, 2, 1, 3, 4, 5, 2, 1],
  [3, 5, 4, 4, 2, 3, 4, 5, 3, 1, 2, 4, 4, 5, 4, 3],
  [2, 3, 4, 2, 1, 2, 3, 4, 2, 0, 1, 3, 5, 4, 3, 2],
  [1, 2, 3, 1, 0, 1, 2, 3, 1, 0, 1, 2, 4, 5, 2, 1],
  [3, 4, 4, 2, 1, 2, 4, 5, 3, 2, 3, 4, 3, 4, 3, 2],
  [4, 5, 5, 3, 2, 3, 5, 4, 5, 4, 4, 5, 2, 3, 4, 3],
  [3, 5, 4, 2, 1, 2, 4, 5, 4, 3, 3, 4, 1, 2, 3, 2],
  [2, 3, 3, 1, 0, 1, 3, 5, 3, 2, 2, 3, 1, 1, 2, 1],
  [3, 4, 4, 2, 1, 2, 4, 5, 4, 3, 3, 4, 2, 2, 3, 2],
  [4, 5, 4, 4, 3, 4, 5, 4, 5, 4, 5, 4, 4, 3, 4, 3],
  [3, 4, 5, 3, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2, 3, 2],
  [2, 3, 4, 2, 1, 2, 3, 4, 3, 2, 3, 4, 2, 1, 2, 1],
  [3, 4, 5, 3, 2, 3, 4, 5, 4, 3, 4, 5, 3, 2, 3, 2],
  [4, 5, 4, 4, 3, 4, 5, 4, 5, 4, 5, 4, 4, 3, 4, 3],
  [3, 4, 4, 2, 1, 2, 3, 4, 3, 2, 3, 4, 3, 2, 3, 2],
];

// Helper to generate crisp 16x16 pixel art canvas texture
function createPixelTexture(
  pixelGrid: number[][],
  palette: string[],
  scale = 8
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 16 * scale;
  canvas.height = 16 * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const idx = pixelGrid[y]?.[x] ?? 0;
      ctx.fillStyle = palette[idx] || palette[0];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Side texture: Grass top with jagged overhang dripping down onto dirt (classic grass_carried)
function createGrassSideTexture(scale = 8): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 16 * scale;
  canvas.height = 16 * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;

  // Base dirt
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = DIRT_PALETTE[DIRT_PIXELS[y][x]] || DIRT_PALETTE[0];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  // Grass drip overhang (grass_carried pattern)
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 16; x++) {
      let isGrass = false;
      let grassIdx = 3;
      if (y === 0 || y === 1) {
        isGrass = true;
        grassIdx = GRASS_TOP_PIXELS[y][x];
      } else if (y === 2) {
        isGrass = x % 3 !== 1 || x === 4 || x === 10 || x === 14;
        grassIdx = GRASS_TOP_PIXELS[y][x];
      } else if (y === 3) {
        isGrass = x === 1 || x === 4 || x === 8 || x === 11 || x === 15;
        grassIdx = 1;
      } else if (y === 4) {
        isGrass = x === 4 || x === 11;
        grassIdx = 0;
      }

      if (isGrass) {
        ctx.fillStyle = GRASS_PALETTE[grassIdx] || GRASS_PALETTE[2];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Minecraft mining crack overlay texture
function createCrackTexture(scale = 8): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 16 * scale;
  canvas.height = 16 * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 16 * scale, 16 * scale);
  ctx.fillStyle = "rgba(10, 10, 10, 0.85)";

  const crackPixels = [
    [2, 2], [3, 3], [4, 4], [5, 4], [6, 5], [7, 6], [8, 6], [9, 7],
    [10, 8], [11, 9], [12, 10], [13, 11], [14, 12],
    [8, 6], [8, 7], [8, 8], [7, 9], [6, 10], [6, 11], [5, 12],
    [10, 8], [11, 7], [12, 7], [13, 6], [14, 5],
    [4, 4], [4, 5], [3, 6], [2, 7], [2, 8], [5, 2], [6, 3],
  ];

  crackPixels.forEach(([x, y]) => {
    ctx.fillRect(x * scale, y * scale, scale, scale);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

interface DebrisChunk {
  id: number;
  initialPos: [number, number, number];
  disperseDir: [number, number, number];
  rotSpeed: [number, number, number];
  scale: number;
}

export default function VoxelChunk({
  scrollProgress,
  blockType = "grass_carried",
}: VoxelChunkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainBlockRef = useRef<THREE.Mesh>(null);
  const crackMeshRef = useRef<THREE.Mesh>(null);
  const debrisRefs = useRef<(THREE.Mesh | null)[]>([]);

  // 1. Procedurally generate pixel-perfect textures
  const { dirtTex, grassTopTex, grassSideTex, crackTex } = useMemo(() => {
    return {
      dirtTex: createPixelTexture(DIRT_PIXELS, DIRT_PALETTE, 8),
      grassTopTex: createPixelTexture(GRASS_TOP_PIXELS, GRASS_PALETTE, 8),
      grassSideTex: createGrassSideTexture(8),
      crackTex: createCrackTexture(8),
    };
  }, []);

  // 2. Build 6-face materials array for Three.js box geometry
  // Order: [+X right, -X left, +Y top, -Y bottom, +Z front, -Z back]
  const mainMaterials = useMemo(() => {
    if (!dirtTex) return [];

    const dirtMat = new THREE.MeshStandardMaterial({
      map: dirtTex,
      roughness: 0.88,
      metalness: 0.05,
    });

    // Default: grass_carried (pre-tinted iconic Minecraft grass block)
    if (blockType !== "dirt" && grassTopTex && grassSideTex) {
      const grassTopMat = new THREE.MeshStandardMaterial({
        map: grassTopTex,
        roughness: 0.82,
        metalness: 0.05,
      });
      const grassCarriedSideMat = new THREE.MeshStandardMaterial({
        map: grassSideTex,
        roughness: 0.88,
        metalness: 0.05,
      });
      return [
        grassCarriedSideMat, // +X right
        grassCarriedSideMat, // -X left
        grassTopMat,         // +Y top
        dirtMat,             // -Y bottom
        grassCarriedSideMat, // +Z front
        grassCarriedSideMat, // -Z back
      ];
    }

    // Pure Minecraft Dirt Block (all 6 faces)
    return [dirtMat, dirtMat, dirtMat, dirtMat, dirtMat, dirtMat];
  }, [dirtTex, grassTopTex, grassSideTex, blockType]);

  // Single material for smaller debris fragments
  const debrisMaterial = useMemo(() => {
    if (!dirtTex) return new THREE.MeshStandardMaterial({ color: "#865d38" });
    return new THREE.MeshStandardMaterial({
      map: dirtTex,
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [dirtTex]);

  // 3. Debris clusters that break apart from the block when scrolled
  const debris = useMemo<DebrisChunk[]>(() => {
    const list: DebrisChunk[] = [];
    const count = 32;

    for (let i = 0; i < count; i++) {
      // Points distributed in and around the 3D block
      const x = (Math.random() - 0.5) * 2.8;
      const y = (Math.random() - 0.5) * 2.8;
      const z = (Math.random() - 0.5) * 2.8;

      const len = Math.hypot(x, y, z) || 1;
      list.push({
        id: i,
        initialPos: [x, y, z],
        disperseDir: [
          (x / len) * (1.2 + Math.random() * 1.5),
          (y / len) * (1.2 + Math.random() * 1.5),
          (z / len) * (1.2 + Math.random() * 1.5),
        ],
        rotSpeed: [
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 2.5,
        ],
        scale: 0.35 + Math.random() * 0.45,
      });
    }
    return list;
  }, []);

  // 4. Floating atmospheric soil particles / green spores
  const sporesGeometry = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  // 5. Continuous 60fps animation & physics loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation driven by elapsed time + scroll progress + mouse parallax
      const mouseX = state.pointer?.x ?? 0;
      const mouseY = state.pointer?.y ?? 0;

      const targetRotY =
        state.clock.elapsedTime * 0.2 +
        scrollProgress * Math.PI * 2.2 +
        mouseX * 0.4;
      const targetRotX =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.12 +
        scrollProgress * 0.6 -
        mouseY * 0.3;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.08
      );

      // Smooth idle levitation
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.9) * 0.25;
    }

    // Fracture and break progression on the crack mesh
    if (crackMeshRef.current) {
      // Cracks intensify as scrollProgress reaches 0.35
      const crackProgress = Math.min(1, Math.max(0, scrollProgress * 2.8));
      const mat = crackMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, crackProgress * 0.85, 0.1);
      }
    }

    // Shrink/fade main block slightly as scrollProgress expands into full debris field
    if (mainBlockRef.current) {
      const targetScale = Math.max(0.15, 1 - Math.pow(scrollProgress, 1.5) * 0.85);
      mainBlockRef.current.scale.setScalar(
        THREE.MathUtils.lerp(mainBlockRef.current.scale.x, targetScale * 3.0, 0.08)
      );
    }

    // Disperse tumbling dirt voxels outward
    debris.forEach((chunk, index) => {
      const mesh = debrisRefs.current[index];
      if (!mesh) return;

      const disperseFactor = Math.pow(scrollProgress, 1.2) * 8.5;
      const targetX = chunk.initialPos[0] + chunk.disperseDir[0] * disperseFactor;
      const targetY = chunk.initialPos[1] + chunk.disperseDir[1] * disperseFactor;
      const targetZ = chunk.initialPos[2] + chunk.disperseDir[2] * disperseFactor;

      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, 0.1);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.1);
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, 0.1);

      // Tumble floating separated blocks
      if (scrollProgress > 0.02) {
        mesh.rotation.x += delta * chunk.rotSpeed[0];
        mesh.rotation.y += delta * chunk.rotSpeed[1];
        mesh.rotation.z += delta * chunk.rotSpeed[2];
        // Fade in scale as it disassembles
        const currentScale = THREE.MathUtils.lerp(mesh.scale.x, chunk.scale, 0.1);
        mesh.scale.setScalar(currentScale);
      } else {
        // Tucked into the block when intact
        mesh.scale.setScalar(
          THREE.MathUtils.lerp(mesh.scale.x, chunk.scale * 0.05, 0.1)
        );
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. MASTER MINECRAFT BLOCK (Size: 3.0 x 3.0 x 3.0) */}
      {mainMaterials.length === 6 && (
        <mesh ref={mainBlockRef} scale={[3, 3, 3]}>
          <boxGeometry args={[1, 1, 1]} />
          {mainMaterials.map((mat, i) => (
            <primitive key={i} object={mat} attach={`material-${i}`} />
          ))}
        </mesh>
      )}

      {/* 2. MINING CRACK OVERLAY (Intensifies on scroll) */}
      {crackTex && (
        <mesh ref={crackMeshRef} scale={[3.015, 3.015, 3.015]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            map={crackTex}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. DISPERSING DIRT DEBRIS VOXELS */}
      {debris.map((chunk, i) => (
        <mesh
          key={chunk.id}
          ref={(el) => {
            debrisRefs.current[i] = el;
          }}
          position={chunk.initialPos}
          scale={chunk.scale * 0.05}
          material={debrisMaterial}
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}

      {/* 4. FLOATING BIOME PARTICLES (Spore / Dust Motes) */}
      <points geometry={sporesGeometry}>
        <pointsMaterial
          size={0.09}
          color={blockType === "grass" ? "#a3e635" : "#d97706"}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

