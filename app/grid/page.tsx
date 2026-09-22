"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import GridHero from "./components/GridHero";
import WireframeCityscape from "./components/WireframeCityscape";
import CityStatusTerminal from "./components/CityStatusTerminal";
import GridFactions from "./components/GridFactions";
import GridPenalCode from "./components/GridPenalCode";
import GridImmigration from "./components/GridImmigration";
import CinematicEffects from "../components/CinematicEffects";
import CustomCursor from "../components/CustomCursor";
import { useLiveStats } from "../../hooks/useLiveStats";
import { useDevicePerformance } from "../../hooks/useDevicePerformance";

export default function GridPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isMobile, dpr } = useDevicePerformance();

  // Live WebSocket Stats from VPS
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const { stats, isConnected } = useLiveStats(wsUrl);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return <div className="min-h-[100dvh] bg-black" />;
  }

  return (
    <main className="relative min-h-[100dvh] bg-[#020504] text-white selection:bg-cyan-400 selection:text-black font-mono overflow-x-hidden">
      {/* FIXED 3D WIREFRAME CITY BACKGROUND CANVAS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 18, 22], fov: 45 }}
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <color attach="background" args={["#020504"]} />

          {/* Fog for cyberpunk distance fade */}
          <fog attach="fog" args={["#020504", 15, 65]} />

          {/* Cyberpunk Atmospheric Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={1.4} color="#00f0ff" />
          <pointLight position={[-15, 10, 5]} intensity={1.0} color="#00aaff" />
          <pointLight position={[15, 5, -5]} intensity={0.8} color="#ff0055" />

          {/* Wireframe Skyscraper Cityscape animated by scrollProgress */}
          <WireframeCityscape scrollProgress={scrollProgress} />

          {/* Cinematic Post-Processing Pipeline */}
          <CinematicEffects />
        </Canvas>
      </div>

      {/* FIXED BRUTALIST TOP NAVIGATION */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 md:px-8 py-3 sm:py-4 bg-black/60 backdrop-blur-md border-b border-white/10 font-mono text-xs"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            data-interactive="true"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 hover:bg-white/15 border border-white/20 text-white tracking-widest uppercase transition-all text-[10px] sm:text-xs"
          >
            ← <span className="hidden xs:inline">E-WORLD </span><span>HUB</span>
          </Link>
          <span className="hidden sm:inline text-white/30">//////////////////</span>
          <span className="hidden md:inline text-cyan-400 font-bold tracking-wider">
            [ SECTOR 03 // E-WORLD RP ]
          </span>
        </div>

        {/* Section Anchors */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-white/60 tracking-wider text-[10px] sm:text-xs">
          <a href="#terminal" data-interactive="true" className="hover:text-white transition-colors">
            TERMINAL
          </a>
          <a href="#factions" data-interactive="true" className="hover:text-white transition-colors">
            FACTIONS
          </a>
          <a href="#penal-code" data-interactive="true" className="hidden xs:inline hover:text-white transition-colors">
            PENAL CODE
          </a>
          <a href="#apply" data-interactive="true" className="hover:text-white transition-colors">
            APPLY
          </a>
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-cyan-400 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-[10px] text-white/50 hidden md:inline">
              {isConnected ? "UPLINK LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </nav>

      {/* FOREGROUND SCROLLABLE SECTIONS */}
      <div className="relative z-10">
        {/* Section 1: FiveM Cyberpunk Grid Hero */}
        <GridHero
          citizensCount={stats.grid?.players ?? 124}
          maxCitizens={stats.grid?.max ?? 128}
          queueCount={stats.grid?.queue ?? 8}
        />

        {/* Section 2: City Status Terminal */}
        <CityStatusTerminal
          policeCount={stats.grid?.players ? Math.max(4, Math.round(stats.grid.players * 0.12)) : 14}
          emsCount={stats.grid?.players ? Math.max(2, Math.round(stats.grid.players * 0.05)) : 6}
          mechanicsCount={stats.grid?.players ? Math.max(3, Math.round(stats.grid.players * 0.08)) : 9}
        />

        {/* Section 3: Factions & Jobs */}
        <GridFactions />

        {/* Section 4: The Penal Code */}
        <GridPenalCode />

        {/* Section 5: Immigration Whitelist Application */}
        <GridImmigration />
      </div>

      {/* Technical Scanlines & Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30 scanlines opacity-40" />
      <div className="fixed inset-0 pointer-events-none z-30 bg-noise opacity-30" />
    </main>
  );
}
