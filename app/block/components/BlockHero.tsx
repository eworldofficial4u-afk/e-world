"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface BlockHeroProps {
  onlinePlayers: number;
  maxPlayers: number;
  serverTps: string | number;
}

export default function BlockHero({
  onlinePlayers,
  maxPlayers,
  serverTps,
}: BlockHeroProps) {
  const [copied, setCopied] = useState(false);
  const serverIP = "mc.eworld.net";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(serverIP);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between p-4 sm:p-8 md:p-16 z-10 pointer-events-none">
      {/* Top Header info */}
      <div className="flex justify-between items-start pt-16 md:pt-8 gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ffaa]" />
            <span className="tracking-widest text-[10px] sm:text-xs">SECTOR 02 // E-WORLD SMP</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-white/30 tracking-widest">
            MINECRAFT VOXEL MATRIX // GRASS_CARRIED 1.21.4
          </span>
        </div>

        <div className="text-right font-mono text-xs">
          <div className="text-white/40 tracking-wider text-[10px] sm:text-xs">CLUSTER TPS</div>
          <div className="text-emerald-400 font-bold tracking-widest text-xs sm:text-sm">
            {serverTps} <span className="text-white/30 text-[10px]">/ 20.0</span>
          </div>
        </div>
      </div>

      {/* Main Hero Typography */}
      <div className="max-w-3xl my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] sm:text-[11px] text-emerald-400/90 tracking-widest">
            <span>[ SYSTEM ACTIVE ]</span>
            <span className="text-white/20">/</span>
            <span>{onlinePlayers} SURVIVORS ONLINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter uppercase text-white drop-shadow-[0_0_30px_rgba(0,255,170,0.25)]">
            E-WORLD <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              SMP
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm md:text-base font-mono text-white/60 tracking-wider leading-relaxed">
            A high-stakes, decentralized survival multiplayer ecosystem. Anarchic economy,
            bespoke world generation, and zero-compromise mechanical purity.
          </p>

          {/* Interactive CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pointer-events-auto w-full max-w-lg">
            {/* Click to Copy IP Button */}
            <InteractiveHoverButton
              onClick={handleCopy}
              text={copied ? "IP COPIED!" : `COPY ${serverIP}`}
              className="w-full sm:w-auto sm:min-w-44 border-emerald-500/40 text-emerald-300 font-mono text-xs py-3"
            />

            {/* Scroll CTA */}
            <a href="#lore" data-interactive="true" className="w-full sm:w-auto">
              <InteractiveHoverButton
                text="EXPLORE PROTOCOLS"
                className="w-full sm:w-auto sm:min-w-48 font-mono text-xs py-3"
              />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Hero Bottom Scroll Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] sm:text-[10px] text-white/40 tracking-widest pb-4">
        <span>SCROLL TO DISASSEMBLE GRASS_CARRIED MATRIX</span>
        <span>01 // 05 SECTIONS</span>
      </div>
    </section>
  );
}
