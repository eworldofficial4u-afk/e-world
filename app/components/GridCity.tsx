'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Grid } from '@react-three/drei';
import * as THREE from 'three';

export default function GridCity() {
  const cityRef = useRef<THREE.Group>(null!);

  // Procedurally generate the city blocks
  const buildings = useMemo(() => {
    const layout = [];
    const gridSize = 12; // 12x12 city grid
    const spacing = 3;   // Distance between buildings

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Skip some spots randomly to create roads and gaps
        if (Math.random() > 0.8) continue;

        // Calculate distance from center to create a "Downtown" skyline
        const distance = Math.sqrt(x * x + z * z);
        const maxDistance = Math.sqrt(gridSize * gridSize * 2);
        const normalizedDistance = 1 - distance / maxDistance;

        // Height is taller in the center, shorter on the edges, with randomness
        const height = Math.max(1, Math.random() * 10 * normalizedDistance + 1);
        const width = 1 + Math.random() * 1.5;
        const depth = 1 + Math.random() * 1.5;

        // 90% Cyan buildings, 10% Magenta/Pink for high-contrast accents
        const isAccent = Math.random() > 0.9;
        
        layout.push({
          position: [x * spacing, height / 2, z * spacing],
          scale: [width, height, depth],
          // Push RGB values past 1.0 (e.g., 4.0) so the Bloom filter catches them
          color: isAccent ? new THREE.Color(4.0, 0.0, 2.0) : new THREE.Color(0.0, 3.0, 4.0),
        });
      }
    }
    return layout;
  }, []);

  // Slowly pan the entire city to simulate flying over it
  useFrame((state) => {
    if (cityRef.current) {
      cityRef.current.position.z = (state.clock.elapsedTime * 2) % 3; // Seamless loop over the grid spacing
    }
  });

  return (
    <group>
      {/* The Infinite Tron-style Floor Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionColor={new THREE.Color(0.0, 1.0, 2.0)} 
        cellColor={new THREE.Color(0.0, 0.5, 1.0)} 
        position={[0, 0, 0]} 
        cellSize={1} 
        sectionSize={3}
      />

      <group ref={cityRef}>
        {buildings.map((b, i) => (
          <mesh 
            key={i} 
            position={b.position as [number, number, number]} 
            scale={b.scale as [number, number, number]}
          >
            <boxGeometry />
            {/* The base material is pure black to hide buildings behind it */}
            <meshBasicMaterial color="#000000" />
            
            {/* The glowing wireframe edges */}
            <Edges
              linewidth={2}
              threshold={15} // Only outline the sharp corners
              color={b.color}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
