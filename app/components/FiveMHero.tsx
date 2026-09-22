'use client';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, Glitch } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import GridCity from './GridCity';

export default function FiveMHero() {
  const [copied, setCopied] = useState(false);

  const handleInitiate = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('cfx.re/join/eworld');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
    const terminal = document.getElementById('terminal');
    if (terminal) {
      terminal.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center font-mono">
      
      {/* 3D WebGL Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 8, 25], fov: 45 }}>
          
          {/* We don't need lights because we are using MeshBasicMaterial and Edges! */}
          <fog attach="fog" args={['#000000', 10, 60]} />
          
          <GridCity />

          {/* Cyberpunk Post-Processing Pipeline */}
          {/* @ts-ignore */}
          <EffectComposer disableNormalPass multisampling={0}>
            {/* Massive soft glow for the neon lines */}
            <Bloom intensity={2.0} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur={true} />
            
            <ChromaticAberration 
              blendFunction={BlendFunction.NORMAL} 
              offset={new THREE.Vector2(0.003, 0.003)} 
            />
            <Noise opacity={0.04} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>

        </Canvas>
      </div>

      {/* 2D HTML/Terminal UI Overlay */}
      <div className="relative z-10 pointer-events-none w-full max-w-7xl px-8 flex flex-col items-start mt-[10vh]">
        
        {/* Terminal Header */}
        <div className="backdrop-blur-md bg-black/40 p-8 border border-[#00aaff]/30 shadow-[0_0_30px_rgba(0,170,255,0.1)]">
          <h2 className="text-[#00aaff] font-mono text-xs tracking-[0.4em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00aaff] animate-pulse" />
            LSPD_MAINFRAME // SECURE_CONNECTION
          </h2>
          <h1 className="text-white text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-none drop-shadow-2xl">
            E-WORLD
          </h1>
          <p className="text-gray-400 font-mono mt-6 max-w-md text-sm leading-relaxed tracking-wider">
            High-stakes roleplay in a reactive metropolis. Enforce the law, manipulate the underground economy, or run the streets.
          </p>
          
          {/* Live Data Mockup */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#00aaff]/20 pt-6">
            <div>
              <p className="text-[#00aaff] text-xs tracking-widest opacity-60">CITIZENS</p>
              <p className="text-2xl font-bold tracking-widest text-white">124 <span className="text-sm opacity-40">/ 128</span></p>
            </div>
            <div>
              <p className="text-[#ff00aa] text-xs tracking-widest opacity-60">THREAT LEVEL</p>
              <p className="text-2xl font-bold tracking-widest text-white">ELEVATED</p>
            </div>
          </div>
          
          <button 
            onClick={handleInitiate}
            data-cursor-interactive="true"
            data-interactive="true"
            className="pointer-events-auto mt-8 w-full py-4 border border-[#00aaff] text-[#00aaff] font-mono font-bold tracking-widest hover:bg-[#00aaff] hover:text-black transition-colors duration-300 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-[#00aaff] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10">
              {copied ? "[ VECTORS COPIED // cfx.re/join/eworld ]" : "[ INITIATE FLIGHT TO CITY ]"}
            </span>
          </button>
        </div>
      </div>
      
    </section>
  );
}
