"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface CommunityNavbarProps {
  currentMode: "explore" | "index";
  onToggleMode: (mode: "explore" | "index") => void;
  isConnected: boolean;
}

export default function CommunityNavbar({
  currentMode,
  onToggleMode,
  isConnected,
}: CommunityNavbarProps) {
  const [time, setTime] = useState("18:45:00 UTC");
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toTimeString().split(" ")[0] + " UTC"
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 font-mono text-xs backdrop-blur-md bg-black/60 border-b border-white/10 pointer-events-auto">
      {/* Left: Brand Identity & E-World Hub Link */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          data-interactive="true"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/20 text-white tracking-widest uppercase transition-all"
        >
          ← <span>E-WORLD HUB</span>
        </Link>
        <span className="hidden sm:inline text-white/30">//////////////////</span>
        <div className="flex items-center gap-2.5">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-400/40">
            <Image
              src="/assets/e-world-logo.webp"
              alt="E-World Logo"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-widest leading-none">
              E-WORLD
            </span>
            <span className="text-amber-400 text-[8px] tracking-[0.25em] leading-none mt-1">
              COMMUNITY HUB
            </span>
          </div>
        </div>
      </div>

      {/* Center: Active Scene Telemetry */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-[11px] tracking-widest">
        <span>[ 01 / 07 // E-WORLD PROTOCOL ]</span>
        <span className="text-white/20">|</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {isConnected ? "UPLINK VERIFIED" : "DISCORD ONLINE"}
        </span>
      </div>

      {/* Right Controls: Mode Switcher & Audio */}
      <div className="flex items-center gap-4">
        {/* Mode Switcher: EXPLORE vs INDEX */}
        <div className="flex items-center p-0.5 rounded border border-white/20 bg-black/40">
          <button
            onClick={() => onToggleMode("explore")}
            data-interactive="true"
            className={`px-3 py-1 text-[11px] font-bold tracking-widest transition-all cursor-pointer ${
              currentMode === "explore"
                ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            EXPLORE
          </button>
          <button
            onClick={() => onToggleMode("index")}
            data-interactive="true"
            className={`px-3 py-1 text-[11px] font-bold tracking-widest transition-all cursor-pointer ${
              currentMode === "index"
                ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            INDEX
          </button>
        </div>

        {/* Discord Join Pill */}
        <a
          href="https://discord.gg/ewld"
          target="_blank"
          rel="noreferrer"
          data-interactive="true"
          className="hidden sm:inline-block"
        >
          <InteractiveHoverButton
            text="JOIN DISCORD"
            className="text-[10px] py-1.5 px-3.5 min-w-32 tracking-widest font-mono border-amber-400/50 text-amber-300"
          />
        </a>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsAudioActive(!isAudioActive)}
          data-interactive="true"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 text-[10px] tracking-wider cursor-pointer"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAudioActive ? "bg-amber-400 animate-ping" : "bg-white/30"
            }`}
          />
          <span>{isAudioActive ? "AUDIO: ON" : "AUDIO: OFF"}</span>
        </button>
      </div>
    </header>
  );
}
