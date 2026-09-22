"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { soundEngine } from "@/hooks/useAudioEngine";

interface PlayerPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerPassportModal({
  isOpen,
  onClose,
}: PlayerPassportModalProps) {
  const [activeTab, setActiveTab] = useState<"id" | "smp" | "grid">("id");
  const [mcUsername, setMcUsername] = useState("Alex");
  const [isLinked, setIsLinked] = useState(true);
  const [coins, setCoins] = useState(1250);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [streakDays, setStreakDays] = useState(4);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    if (hasClaimedToday) return;
    soundEngine.playSuccessChime();
    setCoins((prev) => prev + 250);
    setHasClaimedToday(true);
    setStreakDays((prev) => Math.min(7, prev + 1));
  };

  const handleToggleLink = () => {
    soundEngine.playClickPunch();
    setIsLinked(!isLinked);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 font-mono select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-white animate-in zoom-in-95 duration-300"
      >
        {/* Holographic Border Flare */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
              ID
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white">
                  E-WORLD CITIZEN PASSPORT
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SEC-01
                </span>
              </div>
              <p className="text-[10px] text-white/50 tracking-widest uppercase">
                DECENTRALIZED GAMING DOSSIER // CFX & MOJANG LINKED
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-5 pb-4 border-b border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("id")}
            className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "id"
                ? "bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            PASSPORT OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("smp")}
            className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "smp"
                ? "bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            SMP DOSSIER
          </button>
          <button
            onClick={() => setActiveTab("grid")}
            className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === "grid"
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            E-WORLD (FIVEM)
          </button>
        </div>

        {/* TAB 1: Passport Overview */}
        {activeTab === "id" && (
          <div className="pt-6 space-y-6">
            {/* Identity Badge Card */}
            <div className="p-5 rounded-xl border border-white/15 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full border-2 border-cyan-400 overflow-hidden bg-black/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Image
                    src="/assets/e-world-logo.webp"
                    alt="Citizen Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {isLinked ? "Stark Citizen" : "Anonymous Guest"}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {isLinked ? "VERIFIED" : "UNLINKED"}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 tracking-wider">
                    DISCORD: {isLinked ? "stark#0001" : "Not connected"}
                  </p>
                  <p className="text-[10px] text-cyan-400/80 mt-0.5">
                    CITIZEN TOKEN BALANCE: {coins.toLocaleString()} E-COINS
                  </p>
                </div>
              </div>

              <InteractiveHoverButton
                onClick={handleToggleLink}
                text={isLinked ? "DISCONNECT" : "CONNECT DISCORD"}
                className="text-xs py-2 px-4 min-w-36"
              />
            </div>

            {/* Daily Reward Streak Widget */}
            <div className="p-5 rounded-xl border border-white/15 bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-bold tracking-wider">
                    ★ DAILY CITIZEN CHECK-IN
                  </span>
                  <p className="text-[11px] text-white/60">
                    Claim tokens each day to unlock server perks and cosmetics.
                  </p>
                </div>
                <span className="text-xs font-bold text-white/80">
                  STREAK: {streakDays}/7 DAYS
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isPast = day <= streakDays;
                  const isCurrent = day === streakDays && !hasClaimedToday;
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded text-center border transition-all ${
                        isPast
                          ? "bg-amber-500/20 border-amber-400/40 text-amber-300 font-bold"
                          : isCurrent
                          ? "bg-white/10 border-white/40 text-white animate-pulse"
                          : "bg-white/5 border-white/10 text-white/30"
                      }`}
                    >
                      <div className="text-[9px]">D{day}</div>
                      <div className="text-[10px] mt-0.5">
                        +{day * 50}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <InteractiveHoverButton
                  onClick={handleClaimReward}
                  text={hasClaimedToday ? "CLAIMED TODAY" : "CLAIM +250 TOKENS"}
                  disabled={hasClaimedToday}
                  className={`text-xs py-2 px-5 min-w-44 ${
                    hasClaimedToday ? "opacity-50 cursor-not-allowed" : "border-amber-400/50 text-amber-300"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Minecraft SMP Dossier */}
        {activeTab === "smp" && (
          <div className="pt-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              {/* Live Minecraft 3D/2D Avatar */}
              <div className="relative w-28 h-36 rounded-lg bg-black/60 border border-emerald-500/40 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <img
                  src={`https://mc-heads.net/body/${mcUsername}/right`}
                  alt={`${mcUsername}'s Minecraft Skin`}
                  className="max-h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="flex-1 space-y-3 text-left w-full">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                    MINECRAFT USERNAME
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mcUsername}
                      onChange={(e) => setMcUsername(e.target.value.trim() || "Alex")}
                      placeholder="Enter ign..."
                      className="bg-black/60 border border-emerald-500/40 rounded px-3 py-1.5 text-xs text-emerald-300 font-bold tracking-wider outline-none focus:border-emerald-400 w-full max-w-[200px]"
                    />
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      [SYNCED]
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded bg-white/5 border border-white/10">
                    <span className="text-white/40 text-[9px] block">RANK</span>
                    <span className="text-emerald-400 font-bold">VANGUARD</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/5 border border-white/10">
                    <span className="text-white/40 text-[9px] block">PLAYTIME</span>
                    <span className="text-white font-bold">142.5 HRS</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/5 border border-white/10">
                    <span className="text-white/40 text-[9px] block">BALANCE</span>
                    <span className="text-amber-400 font-bold">14,850 💎</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FiveM Citizen Dossier */}
        {activeTab === "grid" && (
          <div className="pt-6 space-y-5">
            <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div>
                  <span className="text-cyan-400 font-bold text-sm tracking-widest">
                    LOS SANTOS MUNICIPAL DOSSIER
                  </span>
                  <p className="text-[10px] text-white/50">STATE ID: #8492-X</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  STATUS: ACTIVE CITIZEN
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded bg-black/40 border border-white/10">
                  <span className="text-white/40 text-[9px] block">OCCUPATION</span>
                  <span className="text-white font-bold">LSPD SERGEANT</span>
                </div>
                <div className="p-3 rounded bg-black/40 border border-white/10">
                  <span className="text-white/40 text-[9px] block">CLEARED PERMITS</span>
                  <span className="text-cyan-400 font-bold">CLASS 3 WEAPONS</span>
                </div>
                <div className="p-3 rounded bg-black/40 border border-white/10">
                  <span className="text-white/40 text-[9px] block">REGISTERED VEHICLES</span>
                  <span className="text-white font-bold">3 VEHICLES</span>
                </div>
              </div>

              <div className="p-3 rounded bg-black/60 border border-white/10 text-xs">
                <span className="text-white/40 text-[9px] block mb-1">GARAGE ASSETS:</span>
                <p className="text-white/80">
                  • 2024 Vapid Dominator GT [PLATE: EWORLD]
                  <br />
                  • Karin Sultan RS Custom [PLATE: CYBER9]
                  <br />
                  • LSPD Scout Interceptor [FLEET #204]
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Close */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40">
          <span>SECURE SYSTEM KEY // ENCRYPTED SHA-256</span>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer"
          >
            [ CLOSE ESC ]
          </button>
        </div>
      </div>
    </div>
  );
}
