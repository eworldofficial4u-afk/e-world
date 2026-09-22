"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

interface PostProcessingProps {
  transitionProgress: number;
}

export default function PostProcessingPipeline({
  transitionProgress,
}: PostProcessingProps) {
  const { viewport } = useThree();
  const chromaRef = useRef<any>(null);

  // Subtle chromatic aberration offset Vector2
  const chromaOffset = useMemo(
    () => new THREE.Vector2(0.002, 0.002),
    []
  );

  useFrame((state, delta) => {
    if (chromaRef.current) {
      // Dynamic chromatic aberration surge during route transition
      const surge = transitionProgress * 0.015;
      chromaRef.current.offset.x = 0.0018 + surge;
      chromaRef.current.offset.y = 0.0018 + surge;
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* High-threshold soft glow bloom for bioluminescent plasma */}
      <Bloom
        luminanceThreshold={0.25}
        luminanceSmoothing={0.9}
        intensity={1.6}
        mipmapBlur
      />

      {/* Subtle RGB split at screen edges */}
      <ChromaticAberration
        ref={chromaRef}
        offset={chromaOffset}
        radialModulation
        modulationOffset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Fine-grain 35mm film texture to eliminate digital color banding */}
      <Noise
        premultiply
        opacity={0.06}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* Deep cinematic vignette to frame the brutalist viewport */}
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={1.1}
      />
    </EffectComposer>
  );
}
