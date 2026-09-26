"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import HudAnnouncementBanner from "./HudAnnouncementBanner";
import PlayerPassportModal from "./PlayerPassportModal";
import LiveTelemetryTicker from "./LiveTelemetryTicker";
import { Shield } from "lucide-react";

interface CosmicHudOverlayProps {
  activeWorld: string | null;
  onSelectWorld: (id: string | null) => void;
  isConnected: boolean;
  stats: any;
}

export default function CosmicHudOverlay({
  activeWorld,
  onSelectWorld,
  isConnected,
  stats,
}: CosmicHudOverlayProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const { isPlaying: isAudioActive, toggleAmbience: toggleAudio } = useAudioEngine();
  const { siteConfig } = useSiteConfig();

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden font-sans">
      {/* Dynamic Broadcast Announcement Banner */}
      {siteConfig.announcement?.enabled && (
        <div className="absolute top-16 sm:top-20 left-0 right-0 z-40 px-4 pointer-events-auto">
          <HudAnnouncementBanner announcement={siteConfig.announcement} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav
        className="absolute top-0 left-0 right-0 px-4 sm:px-6 md:px-12 py-4 sm:py-6 flex items-center justify-between pointer-events-auto z-50"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-400 shadow-[0_0_12px_#38bdf8] rotate-45 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-white font-display font-black text-xs sm:text-sm tracking-[0.2em] uppercase leading-none group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                {siteConfig.identity.siteName || "E-WORLD"}
              </span>
              <span className="text-white/40 font-mono text-[7px] sm:text-[8px] tracking-[0.25em] uppercase mt-0.5 sm:mt-1">
                {siteConfig.identity.brandTagline || "A UNIVERSE TOGETHER"}
              </span>
            </div>
          </Link>

          {/* Slashes / World Tags */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-white/10 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
            <Link
              href="/community"
              className="hover:text-amber-400 cursor-pointer transition-colors"
            >
              COMMUNITY
            </Link>
            <span className="text-white/20">×</span>
            <Link
              href="/smp"
              className="hover:text-emerald-400 cursor-pointer transition-colors"
            >
              SMP
            </Link>
            <span className="text-white/20">×</span>
            <Link
              href="/grid"
              className="hover:text-cyan-400 cursor-pointer transition-colors"
            >
              FIVEM
            </Link>
          </div>
        </div>

        {/* Right: Nav Links, CTA & Equalizer */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-6 font-mono text-xs tracking-widest text-white/70">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <Link href="/smp" className="hover:text-emerald-400 transition-colors">
              SMP
            </Link>
            <Link href="/grid" className="hover:text-cyan-400 transition-colors">
              FIVEM
            </Link>
            <Link
              href="/community"
              className="hover:text-amber-400 transition-colors"
            >
              COMMUNITY
            </Link>
            <Link
              href="/admin"
              className="text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-1 ml-1"
              title="Admin Matrix Control"
            >
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>ADMIN</span>
            </Link>
          </div>

          {/* Citizen Passport Button */}
          <button
            onClick={() => setIsPassportOpen(true)}
            data-interactive="true"
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 text-[10px] tracking-widest font-mono uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>PASSPORT // ID</span>
          </button>

          {/* Join Universe Pill Button */}
          <Link href="/smp" data-interactive="true" className="hidden sm:inline-block">
            <InteractiveHoverButton
              text="JOIN UNIVERSE"
              className="text-[10px] sm:text-[11px] py-1.5 px-4 min-w-36 uppercase tracking-wider font-mono"
            />
          </Link>

          {/* Audio Equalizer Bars Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioActive ? "Mute Sonic Ambience" : "Enable Sonic Ambience"}
            data-interactive="true"
            className="flex items-end gap-[2px] sm:gap-[3px] h-5 px-1 py-0.5 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
          >
            <span
              className={`w-[2px] sm:w-[2.5px] bg-white rounded-full transition-all duration-300 ${
                isAudioActive ? "h-4 animate-pulse" : "h-2"
              }`}
            />
            <span
              className={`w-[2px] sm:w-[2.5px] bg-white rounded-full transition-all duration-300 ${
                isAudioActive ? "h-5 animate-pulse" : "h-3.5"
              }`}
            />
            <span
              className={`w-[2px] sm:w-[2.5px] bg-white rounded-full transition-all duration-300 ${
                isAudioActive ? "h-3 animate-pulse" : "h-1.5"
              }`}
            />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            data-interactive="true"
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md text-white cursor-pointer hover:border-white transition-all gap-1 p-1.5"
          >
            <span
              className={`w-4 h-[1.5px] bg-white transition-transform duration-300 ${
                isMobileNavOpen ? "rotate-45 translate-y-[4px]" : ""
              }`}
            />
            <span
              className={`w-4 h-[1.5px] bg-white transition-opacity duration-300 ${
                isMobileNavOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-4 h-[1.5px] bg-white transition-transform duration-300 ${
                isMobileNavOpen ? "-rotate-45 -translate-y-[4px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex flex-col justify-between p-6 pointer-events-auto md:hidden font-mono animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 via-emerald-400 to-cyan-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-white font-bold tracking-widest text-xs uppercase">
                E-WORLD NAVIGATION
              </span>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="text-white/60 hover:text-white text-lg p-2 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-3 my-auto py-4 text-xs tracking-widest">
            <Link
              href="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3.5 rounded border border-white/10 hover:border-white/30 bg-white/5"
            >
              <span className="text-white/40">// 00</span>
              <span className="font-bold text-white">HOME HUB</span>
              <span className="text-white/50">→</span>
            </Link>
            <Link
              href="/community"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3.5 rounded border border-amber-500/20 hover:border-amber-500/50 bg-amber-500/5"
            >
              <span className="text-amber-400">// 01</span>
              <span className="font-bold text-amber-300">E-WORLD COMMUNITY</span>
              <span className="text-amber-400">→</span>
            </Link>
            <Link
              href="/smp"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3.5 rounded border border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5"
            >
              <span className="text-emerald-400">// 02</span>
              <span className="font-bold text-emerald-300">MINECRAFT SMP</span>
              <span className="text-emerald-400">→</span>
            </Link>
            <Link
              href="/grid"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3.5 rounded border border-cyan-500/20 hover:border-cyan-500/50 bg-cyan-500/5"
            >
              <span className="text-cyan-400">// 03</span>
              <span className="font-bold text-cyan-300">E-WORLD FIVEM RP</span>
              <span className="text-cyan-400">→</span>
            </Link>
            <a
              href="https://discord.gg/ewld"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold"
            >
              <span>DISCORD COLLECTIVE</span>
              <span>↗</span>
            </a>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[9px] text-white/50">
            <span>LIVE STATUS: {isConnected ? "CONNECTED" : "OFFLINE"}</span>
            <Link href="/admin" onClick={() => setIsMobileNavOpen(false)} className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> ADMIN
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Announcement Banner from Admin Matrix */}
      {siteConfig.announcement?.enabled && (
        <div className="absolute top-[68px] sm:top-[76px] left-0 right-0 z-40 pointer-events-auto">
          <HudAnnouncementBanner announcement={siteConfig.announcement} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CENTER HERO TITLE & ELECTRIC NEON BRANDING */}
      {/* ========================================================================= */}
      <div className="absolute bottom-[max(5vh,35px)] sm:bottom-[7vh] md:bottom-[9vh] left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-auto z-20 w-full max-w-4xl px-4">
        {/* Top Kicker */}
        <div className="text-cyan-300/80 font-mono text-[9px] sm:text-[11px] md:text-xs tracking-[0.35em] uppercase mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
          <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-400" />
          <span>THREE WORLDS // ONE UNIVERSE</span>
          <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-400" />
        </div>

        {/* Luminous Electric Cyber-Neon E-WORLD Logo with Deep Ambient Shadow */}
        <h1 className="neon-eworld text-[clamp(2.8rem,9.5vw,7.2rem)] font-black tracking-[0.14em] sm:tracking-[0.18em] uppercase leading-none select-none font-display">
          E-WORLD
        </h1>

        {/* Balanced Minimalist Tagline */}
        <div className="text-white/80 font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.45em] uppercase font-medium mt-3 sm:mt-4 mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span>EXPLORE</span>
          <span className="text-cyan-400/80">·</span>
          <span>PLAY</span>
          <span className="text-cyan-400/80">·</span>
          <span>BELONG</span>
        </div>

        {/* Premium Interactive Hover CTA Button */}
        <Link href="/smp" data-interactive="true">
          <InteractiveHoverButton
            text="ENTER THE UNIVERSE"
            className="min-w-56 px-8 py-3.5 text-xs sm:text-sm tracking-[0.22em] uppercase font-mono font-bold shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:shadow-[0_0_50px_rgba(56,189,248,0.7)] border-cyan-400/40"
          />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 7. MODAL POPUP DRAWER WHEN AN ORB IS CLICKED */}
      {/* ========================================================================= */}
      {activeWorld && (
        <div
          onClick={() => onSelectWorld(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50 pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hologram-glass max-w-md w-full max-h-[85dvh] overflow-y-auto p-5 sm:p-8 rounded-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative font-mono text-left animate-in fade-in zoom-in-95 duration-300"
          >
            {/* Close Cross */}
            <button
              onClick={() => onSelectWorld(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-lg cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Content for Community */}
            {activeWorld === "community" && (
              <div className="space-y-4">
                <span className="text-amber-400 text-xs tracking-widest font-bold">
                  // 01 E-WORLD COMMUNITY
                </span>
                <h2 className="text-2xl font-bold text-white tracking-wider">
                  E-WORLD COMMUNITY
                </h2>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  The heart of E-World. Connect with creators, voice chat with
                  players across all sectors, participate in weekly community
                  tournaments, and shape the lore.
                </p>
                <div className="p-3 bg-white/5 rounded border border-white/10 space-y-1 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">ONLINE MEMBERS:</span>
                    <span className="text-amber-400 font-bold">1,420</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">DISCORD STATUS:</span>
                    <span className="text-emerald-400">VERIFIED HUB</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/community">
                    <InteractiveHoverButton
                      text="E-WORLD HUB"
                      className="w-full text-xs py-3 tracking-widest font-mono"
                    />
                  </Link>
                  <a
                    href="https://discord.gg/ewld"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <InteractiveHoverButton
                      text="DISCORD"
                      className="w-full text-xs py-3 tracking-widest font-mono"
                    />
                  </a>
                </div>
              </div>
            )}

            {/* Content for SMP */}
            {activeWorld === "smp" && (
              <div className="space-y-4">
                <span className="text-emerald-400 text-xs tracking-widest font-bold">
                  02 // E-WORLD SMP
                </span>
                <h2 className="text-2xl font-bold text-white tracking-wider">
                  THE VOXEL REALM
                </h2>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  Survive, build kingdoms, and conquer dungeons across a custom
                  procedural Minecraft landscape. No pay-to-win, realistic
                  economy, and live bluemap radar.
                </p>
                <div className="p-3 bg-white/5 rounded border border-white/10 space-y-1 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">SERVER IP:</span>
                    <span className="text-emerald-400 font-bold">
                      {siteConfig.realms.smp.serverIp || "play.eworld.net"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">ACTIVE PLAYERS:</span>
                    <span className="text-white font-bold">
                      {stats.block?.players ?? 42} / {stats.block?.max ?? 100}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">TPS:</span>
                    <span className="text-emerald-400 font-bold">20.0</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/smp">
                    <InteractiveHoverButton
                      text="ENTER E-WORLD SMP"
                      className="w-full text-xs py-3 tracking-widest font-mono"
                    />
                  </Link>
                </div>
              </div>
            )}

            {/* Content for RP */}
            {activeWorld === "rp" && (
              <div className="space-y-4">
                <span className="text-cyan-400 text-xs tracking-widest font-bold">
                  // 03 E-WORLD RP
                </span>
                <h2 className="text-2xl font-bold text-white tracking-wider">
                  E-WORLD (FIVEM RP)
                </h2>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  High-stakes urban roleplay in a reactive metropolis. Enforce
                  the law, manipulate underground syndicates, run businesses, or
                  own the streets.
                </p>
                <div className="p-3 bg-white/5 rounded border border-white/10 space-y-1 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">FIVEM DIRECT:</span>
                    <span className="text-cyan-400 font-bold">
                      {siteConfig.realms.rp.directJoinUrl || "cfx.re/join/eworld"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">ACTIVE CITIZENS:</span>
                    <span className="text-white font-bold">
                      {stats.grid?.players ?? 124} / {stats.grid?.max ?? 128}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">THREAT LEVEL:</span>
                    <span className="text-rose-400 font-bold">ELEVATED</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/grid">
                    <InteractiveHoverButton
                      text="ENTER E-WORLD"
                      className="w-full text-xs py-3 tracking-widest font-mono"
                    />
                  </Link>
                </div>
              </div>
            )}

            {/* Content for Locked Sectors (Arena / Labs) */}
            {(activeWorld === "arena" || activeWorld === "labs") && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  🔒
                </div>
                <span className="text-red-400 text-xs tracking-widest font-bold block">
                  // {activeWorld === "arena" ? "04 E-WORLD" : "05 E-WORLD"}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-wider">
                  CLASSIFIED SECTOR
                </h2>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  This sector is currently undergoing orbital construction and encryption protocols.
                  Public civilian access is locked. Stay tuned in Discord for launch drops.
                </p>
                <div className="p-3 bg-red-950/30 rounded border border-red-500/20 space-y-1 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/40">SECTOR STATUS:</span>
                    <span className="text-amber-400 font-bold">COMING SOON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">CLEARANCE:</span>
                    <span className="text-red-400 font-bold">LOCKED // RESTRICTED</span>
                  </div>
                </div>
                <div className="pt-2">
                  <a href="https://discord.gg/ewld" target="_blank" rel="noreferrer">
                    <InteractiveHoverButton
                      text="JOIN DISCORD FOR LAUNCH NOTICES"
                      className="w-full text-xs py-3 tracking-widest font-mono border-red-500/40 text-red-300"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Bottom Left: GPU Performance FX Toggle */}
      <div className="fixed bottom-9 left-4 sm:left-6 z-20 pointer-events-auto hidden sm:block">
        <button
          onClick={() => setIsPerformanceMode(!isPerformanceMode)}
          data-interactive="true"
          className="px-2.5 py-1 rounded border border-white/15 bg-black/60 hover:bg-white/10 text-white/60 hover:text-white text-[9px] font-mono tracking-widest transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          title="Toggle GPU Shader Performance Mode"
        >
          [ FX: {isPerformanceMode ? "60FPS PERF" : "ULTRA"} ]
        </button>
      </div>

      {/* Bottom Telemetry Ticker */}
      <LiveTelemetryTicker stats={stats} />

      {/* Citizen Passport Modal */}
      <PlayerPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />
    </div>
  );
}
