"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import VoxelChunk from "../block/components/VoxelChunk";
import BlockHero from "../block/components/BlockHero";
import BlockLoreRules from "../block/components/BlockLoreRules";
import BlockLiveMap from "../block/components/BlockLiveMap";
import BlockLeaderboard from "../block/components/BlockLeaderboard";
import BlockArmory from "../block/components/BlockArmory";
import BlockDashboardWidget from "../block/components/BlockDashboardWidget";
import { NebulaPlane } from "../components/NebulaBackground";
import CinematicEffects from "../components/CinematicEffects";
import CustomCursor from "../components/CustomCursor";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";
import { useLiveStats } from "../../hooks/useLiveStats";
import { useDevicePerformance } from "../../hooks/useDevicePerformance";

export default function EWorldSMPPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liquidActive, setLiquidActive] = useState(true);
  const [blockType, setBlockType] = useState<"grass_carried" | "dirt">("grass_carried");
  const { isMobile, isLowPower, dpr, isPageVisible, enablePostProcessing } = useDevicePerformance();

  // Live WebSocket Stats
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://e-world-bot-production.up.railway.app";
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
    <main className="relative min-h-[100dvh] bg-black text-white selection:bg-emerald-400 selection:text-black font-sans overflow-x-hidden">
      {/* FIXED 3D VOXEL CORE BACKGROUND CANVAS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas
          dpr={dpr}
          frameloop={isPageVisible ? "always" : "never"}
          camera={{ position: [0, 0, 11], fov: 45 }}
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <color attach="background" args={["#010302"]} />

          {/* Lighting optimized for voxel isometric chunk */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.8} color="#ffffff" />
          <pointLight position={[-10, -5, -5]} intensity={0.8} color="#f59e0b" />

          {/* Cosmic Nebula background */}
          <NebulaPlane />

          {/* The Interactive Disassembling Minecraft Dirt Block */}
          <VoxelChunk scrollProgress={scrollProgress} blockType={blockType} />

          {/* Post-Processing Pipeline */}
          {enablePostProcessing && <CinematicEffects />}
        </Canvas>
      </div>

      {/* Dynamic Liquid Effect Animation Layer (Subtle, sleek, non-intrusive) */}
      {liquidActive && !isLowPower && (
        <div className="fixed inset-0 pointer-events-none z-[1] opacity-25 mix-blend-screen transition-opacity duration-700">
          <LiquidEffectAnimation displacementScale={0.4} roughness={0.25} metalness={0.05} />
        </div>
      )}

      {/* FIXED BRUTALIST HEADER BAR */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-black/60 backdrop-blur-lg border-b border-white/10 font-mono text-xs"
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
          <span className="hidden md:inline text-emerald-400 font-bold tracking-wider">
            [ SECTOR 02 // E-WORLD SMP ]
          </span>
        </div>

        {/* Section Anchors, Block Selector & Liquid Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-white/60 tracking-wider text-[10px] sm:text-xs">
          <a href="#lore" data-interactive="true" className="hover:text-white transition-colors">
            LORE
          </a>
          <a href="#map" data-interactive="true" className="hover:text-white transition-colors">
            MAP
          </a>
          <a href="#leaderboard" data-interactive="true" className="hidden xs:inline hover:text-white transition-colors">
            RANKS
          </a>
          <a href="#armory" data-interactive="true" className="hover:text-white transition-colors">
            ARMORY
          </a>

          {/* Minecraft Block Type Selector */}
          <button
            onClick={() => setBlockType(blockType === "grass_carried" ? "dirt" : "grass_carried")}
            data-interactive="true"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 tracking-widest uppercase transition-all cursor-pointer"
            title="Switch Minecraft Specimen Block"
          >
            <span
              className={`w-2 h-2 border border-white/40 shadow-sm ${
                blockType === "grass_carried" ? "bg-[#68a033]" : "bg-[#865d38]"
              }`}
            />
            <span>BLOCK: {blockType.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setLiquidActive(!liquidActive)}
            data-interactive="true"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 tracking-widest uppercase transition-all cursor-pointer"
            title="Toggle Liquid Fluid Ether"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${liquidActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
            <span>LIQUID: {liquidActive ? "ON" : "OFF"}</span>
          </button>
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500"
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
        {/* Section 1: The Drop (Hero) */}
        <BlockHero
          onlinePlayers={stats.block?.players ?? 42}
          maxPlayers={stats.block?.max ?? 100}
          serverTps={stats.block?.tps ?? "20.0"}
        />

        {/* Section 2: Lore & Survival Protocols */}
        <BlockLoreRules />

        {/* Section 3: Live Satellite Map */}
        <BlockLiveMap />

        {/* Section 4: Economy & Leaderboards */}
        <BlockLeaderboard />

        {/* Section 5: The Armory */}
        <BlockArmory />
      </div>

      {/* Interactive SMP Dashboard Widget */}
      <BlockDashboardWidget
        tps={stats.block?.tps ?? "20.0"}
        online={stats.block?.players ?? 42}
      />

      {/* Technical Scanlines and Vignette Overlays */}
      <div className="fixed inset-0 pointer-events-none z-30 scanlines opacity-40" />
      <div className="fixed inset-0 pointer-events-none z-30 bg-noise opacity-30" />
    </main>
  );
}
