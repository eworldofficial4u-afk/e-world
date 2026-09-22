'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

export default function VoxelChunk() {
  const groupRef = useRef<THREE.Group>(null!);

  // Procedurally generate a floating island chunk
  const { top, stone, ore } = useMemo(() => {
    const topBlocks: [number, number, number][] = [];
    const stoneBlocks: [number, number, number][] = [];
    const oreBlocks: [number, number, number][] = [];
    
    const size = 6; // Radius of the island
    
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        // Cut off the corners to make it a circular floating island
        if (Math.sqrt(x * x + z * z) > size) continue;
        
        // Simple math-based height map to simulate terrain
        const height = Math.floor(Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2);
        
        // Build downward from the terrain height to the base of the chunk
        for (let y = -6; y <= height; y++) {
          const pos: [number, number, number] = [x, y, z];
          
          if (y === height) {
            topBlocks.push(pos); // Top layer (Grass)
          } else if (Math.random() > 0.88) {
            oreBlocks.push(pos); // Random glowing ores inside the stone
          } else {
            stoneBlocks.push(pos); // Deep stone
          }
        }
      }
    }
    
    return { top: topBlocks, stone: stoneBlocks, ore: oreBlocks };
  }, []);

  // Animation: Slow rotation and anti-gravity floating
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Base Stone Blocks */}
      <Instances range={stone.length}>
        <boxGeometry args={[1, 1, 1]} />
        {/* Dark, matte finish */}
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
        {stone.map((pos, i) => (
          // scale={0.95} creates the micro-gaps for light to bleed through
          <Instance key={i} position={pos} scale={0.95} />
        ))}
      </Instances>

      {/* 2. Top Layer (Neon Grass) */}
      <Instances range={top.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1.5} toneMapped={false} />
        {top.map((pos, i) => (
          <Instance key={i} position={pos} scale={0.95} />
        ))}
      </Instances>

      {/* 3. Glowing Ores */}
      <Instances range={ore.length}>
        <boxGeometry args={[1, 1, 1]} />
        {/* Pushed to 4.0 intensity so the bloom filter catches it heavily */}
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={4.0} toneMapped={false} />
        {ore.map((pos, i) => (
          <Instance key={i} position={pos} scale={0.95} />
        ))}
      </Instances>
    </group>
  );
}
