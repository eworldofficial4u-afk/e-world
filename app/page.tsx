"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CosmicTriadScene from "./components/CosmicTriadScene";
import CosmicHudOverlay from "./components/CosmicHudOverlay";
import CustomCursor from "./components/CustomCursor";
import AnoAI from "@/components/ui/animated-shader-background";
import { useLiveStats } from "../hooks/useLiveStats";
import { useDevicePerformance } from "../hooks/useDevicePerformance";

export default function EWorldHome() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeWorld, setActiveWorld] = useState<string | null>(null);
  const { isMobile, dpr } = useDevicePerformance();

  // Live WebSocket Stats from orchestrator
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const { stats, isConnected } = useLiveStats(wsUrl);

  const handleSelectWorld = (id: string | null) => {
    if (id === "community") {
      router.push("/community");
    } else if (id === "smp") {
      router.push("/smp");
    } else if (id === "rp" || id === "grid" || id === "fivem") {
      router.push("/grid");
    } else {
      setActiveWorld(id);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-full min-h-dvh h-dvh bg-black overflow-hidden select-none">

      {/* ========================================================================= */}
      {/* 1. PHOTOREALISTIC EARTH SPACE HORIZON & SUNRISE BACKDROP */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* High-Resolution Static Earth Space View with Sunrise, City Lights & Asteroids */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] transition-transform duration-700"
          style={{
            backgroundImage: "url('/assets/earth_space_backdrop.jpg')",
          }}
        />
        {/* Atmospheric vignette and contrast enhancement for HUD readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/75" />
      </div>

      {/* Addon: Dynamic Cosmic Aurora Shader Background */}
      {mounted && !isMobile && (
        <div className="absolute inset-0 pointer-events-none z-[2] opacity-30 mix-blend-screen overflow-hidden">
          <AnoAI />
        </div>
      )}

      {/* Technical Scanlines & Grid Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 scanlines opacity-25" />
      <div className="absolute inset-0 pointer-events-none z-20 bg-noise opacity-15" />

      {/* ========================================================================= */}
      {/* 2. THREE.JS 3D R3F CANVAS: TRIAD ORBS & CELESTIAL ASTEROIDS */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-10">
        {mounted && (
          <Canvas
            dpr={dpr}
            camera={{ position: [0, 0.5, 14.5], fov: 46 }}
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            {/* Celestial illumination */}
            <ambientLight intensity={0.65} />
            <directionalLight position={[12, 16, 12]} intensity={1.8} color="#ffffff" />
            <pointLight position={[-10, -5, 5]} intensity={1.2} color="#38bdf8" />
            <pointLight position={[10, -5, 5]} intensity={1.2} color="#f59e0b" />

            <Suspense fallback={null}>
              {/* Three Terrarium Spheres & Asteroid Belt */}
              <CosmicTriadScene
                activeWorld={activeWorld}
                onSelectWorld={handleSelectWorld}
              />
            </Suspense>

            {/* Soft Bloom for Glowing Rings & Neon Auras */}
            {/* @ts-ignore */}
            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.85}
                luminanceSmoothing={0.7}
                mipmapBlur={true}
              />
            </EffectComposer>
          </Canvas>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE THEORY BRUTALIST & HOLOGRAPHIC HUD OVERLAY */}
      {/* ========================================================================= */}
      <CosmicHudOverlay
        activeWorld={activeWorld}
        onSelectWorld={handleSelectWorld}
        isConnected={isConnected}
        stats={stats}
      />
    </main>
  );
}
