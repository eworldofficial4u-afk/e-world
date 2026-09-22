"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface GridHeroProps {
  citizensCount: number;
  maxCitizens: number;
  queueCount: number;
}

export default function GridHero({
  citizensCount,
  maxCitizens,
  queueCount,
}: GridHeroProps) {
  const [copied, setCopied] = useState(false);
  const connectCommand = "cfx.re/join/eworld";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(connectCommand);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-16 z-10 pointer-events-none font-mono">
      {/* Top Header telemetry */}
      <div className="flex justify-between items-start pt-16 md:pt-8 gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#00f0ff]" />
            <span className="tracking-widest text-[10px] sm:text-xs">SECTOR 03 // E-WORLD FIVEM</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-white/30 tracking-widest">
            LOS SANTOS MAINFRAME // BUILD 3095
          </span>
        </div>

        <div className="text-right text-xs">
          <div className="text-white/40 tracking-wider text-[10px] sm:text-xs">CITY QUEUE</div>
          <div className="text-pink-500 font-bold tracking-widest text-xs sm:text-sm">
            {queueCount} <span className="text-white/30 text-[10px]">IN TRANSIT</span>
          </div>
        </div>
      </div>

      {/* Hero Central Typography */}
      <div className="max-w-3xl my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded font-mono text-[10px] sm:text-[11px] text-cyan-300 tracking-widest">
            <span>[ MAINFRAME ONLINE ]</span>
            <span className="text-white/20">/</span>
            <span>{citizensCount} / {maxCitizens} CITIZENS ACTIVE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.3)]">
            THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-500">
              GRID
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/70 tracking-wider leading-relaxed">
            A high-fidelity urban roleplay ecosystem. Uncompromising law enforcement,
            dynamic underground syndicates, and realistic economic infrastructure.
          </p>

          {/* Interactive CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pointer-events-auto w-full max-w-lg">
            {/* Direct Connect / Copy Command Button */}
            <InteractiveHoverButton
              onClick={handleCopy}
              text={copied ? "COPIED COMMAND!" : `CONNECT FIVEM`}
              className="min-w-44 border-cyan-400/50 text-cyan-300 font-mono text-xs py-3"
            />

            {/* Terminal CTA */}
            <a href="#terminal" data-interactive="true" className="w-full sm:w-auto">
              <InteractiveHoverButton
                text="DISPATCH TERMINAL"
                className="min-w-48 font-mono text-xs py-3 w-full sm:w-auto"
              />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Bottom Telemetry Guide */}
      <div className="flex items-center justify-between text-[10px] text-white/40 tracking-widest pb-4">
        <span>SCROLL TO TRAVERSE THE WIREFRAME CANYON</span>
        <span>MUNICIPAL OS // SEC-03</span>
      </div>
    </section>
  );
}
