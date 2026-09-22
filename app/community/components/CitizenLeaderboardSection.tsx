"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Flame, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { Citizen } from "@/hooks/useLiveStats";

interface CitizenLeaderboardSectionProps {
  leaderboard?: Citizen[];
  onOpenCitizenCard?: (citizen: Citizen) => void;
}

export default function CitizenLeaderboardSection({
  leaderboard = [],
  onOpenCitizenCard,
}: CitizenLeaderboardSectionProps) {
  return (
    <section className="relative w-full py-12 px-4 sm:px-6 font-mono z-20">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-cyan-400 text-xs tracking-widest font-bold mb-2">
            // 08 CITIZEN ACTIVITY MATRIX & REPUTATION
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-md font-display">
            E-WORLD LEADERBOARD
          </h2>
          <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-3">
            Real-time citizen rankings driven by Discord voice participation, community contributions, and cross-realm engagement.
          </p>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-4 border-b border-white/10 text-[11px] font-bold text-white/50 uppercase tracking-wider bg-white/[0.02]">
            <div className="col-span-2 sm:col-span-1 text-center">RANK</div>
            <div className="col-span-6 sm:col-span-4">CITIZEN</div>
            <div className="hidden sm:block sm:col-span-3">CLEARANCE / ROLES</div>
            <div className="col-span-4 sm:col-span-2 text-right">EXPERIENCE</div>
            <div className="hidden sm:block sm:col-span-2 text-right">VOICE HOURS</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {leaderboard.map((citizen, idx) => {
              const isTop3 = idx < 3;
              const rankColor =
                idx === 0
                  ? "text-amber-400 border-amber-400/40 bg-amber-400/10"
                  : idx === 1
                  ? "text-cyan-300 border-cyan-400/40 bg-cyan-400/10"
                  : idx === 2
                  ? "text-orange-400 border-orange-400/40 bg-orange-400/10"
                  : "text-white/40 border-white/10 bg-white/5";

              return (
                <div
                  key={citizen.id}
                  onClick={() => onOpenCitizenCard && onOpenCitizenCard(citizen)}
                  className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    <span
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono ${rankColor}`}
                    >
                      {idx === 0 ? <Trophy className="w-3.5 h-3.5" /> : `0${idx + 1}`}
                    </span>
                  </div>

                  {/* Citizen Profile */}
                  <div className="col-span-6 sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400 transition-all">
                      {citizen.avatar ? (
                        <Image
                          src={citizen.avatar}
                          alt={citizen.displayName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                          {citizen.displayName.slice(0, 2)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {citizen.displayName}
                        </span>
                        {isTop3 && <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-cyan-400/80 block truncate">
                        @{citizen.username}
                      </span>
                    </div>
                  </div>

                  {/* Clearance & Roles */}
                  <div className="hidden sm:flex sm:col-span-3 flex-col gap-1">
                    <span className="text-[10px] font-bold text-cyan-300 tracking-wider">
                      {citizen.clearance}
                    </span>
                    <div className="flex items-center gap-1">
                      {citizen.roles.slice(0, 2).map((r, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Level & XP */}
                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-cyan-400 block font-mono">
                      Lv. {citizen.level}
                    </span>
                    <span className="text-[10px] text-white/40 block">
                      {citizen.xp.toLocaleString()} XP
                    </span>
                  </div>

                  {/* Voice Hours */}
                  <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-1 text-right text-xs font-bold text-emerald-400">
                    <Mic className="w-3.5 h-3.5" />
                    <span>{citizen.voiceHours}h</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50 bg-black/40">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Click any citizen to inspect their Holographic ID Card
            </span>
            <span className="text-cyan-400">Live Discord Sync Active</span>
          </div>
        </div>
      </div>
    </section>
  );
}
