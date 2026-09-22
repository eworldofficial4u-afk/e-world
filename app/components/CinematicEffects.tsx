'use client';

import React from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export default function CinematicEffects() {
  return (
    // multisampling={0} is recommended when using custom effects to prevent edge-blurring conflicts
    // @ts-ignore
    <EffectComposer disableNormalPass enableNormalPass={false} multisampling={0}>
      
      {/* 
        1. Cinematic Bloom
        mipmapBlur creates a massive, soft glow.
        luminanceThreshold={0.5} means only bright objects (like our planets) will glow.
      */}
      <Bloom 
        intensity={1.5} 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        mipmapBlur={true} 
      />

      {/* 
        2. Chromatic Aberration
        Creates a red/cyan offset. 
        offset determines the strength [x, y]. 
      */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={new THREE.Vector2(0.002, 0.002)} 
        // @ts-ignore - Some versions of the types drop radialModulation, but the underlying engine supports it
        radialModulation={true} 
        modulationOffset={0.5} 
      />

      {/* 
        3. Film Grain
        Kept very low (opacity around 0.02 - 0.04) just to break up digital banding.
      */}
      <Noise 
        premultiply={true} 
        blendFunction={BlendFunction.SCREEN} 
        opacity={0.03} 
      />

      {/* 
        4. Vignette
        Darkens the corners of the viewport to focus attention on the center.
      */}
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={1.1} 
        blendFunction={BlendFunction.NORMAL} 
      />

    </EffectComposer>
  );
}
