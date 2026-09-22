"use client";

import React from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface CommunityHeroProps {
  onExploreGalaxy: () => void;
  onOpenIndex: () => void;
  discordMembers?: number;
  voiceActive?: number;
}

export default function CommunityHero({
  onExploreGalaxy,
  onOpenIndex,
  discordMembers = 12300,
  voiceActive = 2380,
}: CommunityHeroProps) {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 pt-24 pb-16 z-10 font-mono">
      {/* Kicker Telemetry */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] tracking-[0.25em] uppercase rounded-full mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
        <span>E-WORLD PROTOCOL // DISCORD MAINFRAME</span>
      </div>

      {/* Main Massive Chrome Prismatic Title */}
      <h1 className="chrome-text chrome-bevel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight uppercase leading-none select-none max-w-6xl drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]">
        A WORLD <br className="hidden sm:inline" />
        BEYOND PLAY<span className="text-amber-400">.</span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-white/70 text-sm sm:text-base font-sans tracking-wide leading-relaxed mt-6 mb-10">
        An independent universe for the next generation of players. Connecting
        Minecraft survival, FiveM roleplay cinema, and competitive tournament
        operations through one unified community.
      </p>

      {/* Live Community Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
        <div className="hologram-glass p-4 rounded border border-white/15 text-center">
          <span className="text-amber-400 text-[10px] tracking-widest block mb-1">
            VERIFIED CITIZENS
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
            {discordMembers.toLocaleString()}+
          </span>
        </div>
        <div className="hologram-glass p-4 rounded border border-white/15 text-center">
          <span className="text-emerald-400 text-[10px] tracking-widest block mb-1">
            VOICE & CHAT ACTIVE
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
            {voiceActive.toLocaleString()}+
          </span>
        </div>
        <div className="hologram-glass p-4 rounded border border-white/15 text-center col-span-2 sm:col-span-1">
          <span className="text-cyan-400 text-[10px] tracking-widest block mb-1">
            SANCTIONED REALMS
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
            06 ACTIVE
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Discord Primary CTA */}
        <a
          href="https://discord.gg/ewld"
          target="_blank"
          rel="noreferrer"
          data-interactive="true"
        >
          <InteractiveHoverButton
            text="CONNECT DISCORD"
            className="min-w-48 border-amber-400/50 text-amber-300 font-bold text-xs py-3.5 tracking-[0.2em] shadow-[0_0_25px_rgba(245,158,11,0.35)]"
          />
        </a>

        {/* Galaxy Topology CTA */}
        <InteractiveHoverButton
          onClick={onExploreGalaxy}
          text="GALAXY TOPOLOGY"
          className="min-w-48 text-xs py-3.5 tracking-[0.2em]"
        />

        {/* Index Matrix CTA */}
        <InteractiveHoverButton
          onClick={onOpenIndex}
          text="DIRECTORY INDEX"
          className="min-w-44 text-xs py-3.5 tracking-[0.2em]"
        />
      </div>
    </section>
  );
}
