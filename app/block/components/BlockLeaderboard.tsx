"use client";

import React, { useState } from "react";
import SkinPreviewModal from "./SkinPreviewModal";

interface PlayerEntry {
  rank: string;
  username: string;
  clan: string;
  balance: string;
  kills: number;
  playtime: string;
}

export default function BlockLeaderboard() {
  const [activeCategory, setActiveCategory] = useState<"balance" | "kills" | "playtime">("balance");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerEntry>({
    rank: "01",
    username: "Suyash",
    clan: "[E-WORLD]",
    balance: "$2,450,800",
    kills: 1420,
    playtime: "642h 18m",
  });

  const players: PlayerEntry[] = [
    {
      rank: "01",
      username: "Suyash",
      clan: "[E-WORLD]",
      balance: "$2,450,800",
      kills: 1420,
      playtime: "642h 18m",
    },
    {
      rank: "02",
      username: "Cipher_X",
      clan: "[SECURITY]",
      balance: "$1,890,200",
      kills: 912,
      playtime: "812h 45m",
    },
    {
      rank: "03",
      username: "VoxelGhost",
      clan: "[MINERS]",
      balance: "$1,450,000",
      kills: 540,
      playtime: "720h 10m",
    },
    {
      rank: "04",
      username: "NeonRider",
      clan: "[ANARCHY]",
      balance: "$980,500",
      kills: 1190,
      playtime: "510h 30m",
    },
    {
      rank: "05",
      username: "ObsidianKnight",
      clan: "[HEAVY]",
      balance: "$840,100",
      kills: 620,
      playtime: "480h 05m",
    },
    {
      rank: "06",
      username: "Astra_Pilot",
      clan: "[ORBIT]",
      balance: "$720,000",
      kills: 490,
      playtime: "920h 50m",
    },
  ];

  return (
    <section id="leaderboard" className="relative min-h-[100dvh] py-16 sm:py-24 px-4 sm:px-8 md:px-16 z-10 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-emerald-400">
              <span>SECTION 04</span>
              <span className="text-white/30">//////////////////</span>
              <span>COMPETITIVE HIERARCHY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
              LEADERBOARD & ECONOMY
            </h2>
            <p className="text-[10px] sm:text-xs text-white/50 tracking-widest">
              LIVE TELEMETRY // HOVER ROW TO SCAN 3D PLAYER MODEL
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(["balance", "kills", "playtime"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-interactive="true"
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(0,255,170,0.3)]"
                    : "bg-black/50 border-white/10 text-white/50 hover:text-white hover:border-white/30"
                }`}
              >
                [ {cat} ]
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Data Grid + 3D Skin Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Technical Data Grid with Responsive Scroll */}
          <div className="lg:col-span-2 bg-black/60 backdrop-blur-xl border border-white/15 overflow-x-auto">
            <div className="min-w-[460px]">
              <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-white/5 border-b border-white/15 text-[10px] text-white/40 tracking-widest uppercase">
              <span className="col-span-2">RANK</span>
              <span className="col-span-4">OPERATIVE</span>
              <span className="col-span-3">CLAN</span>
              <span className="col-span-3 text-right">
                {activeCategory === "balance" && "BALANCE"}
                {activeCategory === "kills" && "PVP KILLS"}
                {activeCategory === "playtime" && "PLAYTIME"}
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {players.map((p) => {
                const isSelected = selectedPlayer.username === p.username;
                return (
                  <div
                    key={p.username}
                    onMouseEnter={() => setSelectedPlayer(p)}
                    onClick={() => setSelectedPlayer(p)}
                    data-interactive="true"
                    className={`grid grid-cols-12 items-center px-6 py-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-500/15 border-l-4 border-l-emerald-400 text-white"
                        : "hover:bg-white/5 text-white/70"
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <span className={`text-xs font-bold ${p.rank === "01" ? "text-amber-400" : p.rank === "02" ? "text-slate-300" : p.rank === "03" ? "text-amber-600" : "text-white/40"}`}>
                        #{p.rank}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wider">
                        {p.username}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>

                    <div className="col-span-3">
                      <span className="text-[11px] text-emerald-400/80 font-mono tracking-wider">
                        {p.clan}
                      </span>
                    </div>

                    <div className="col-span-3 text-right font-mono font-bold text-xs text-white">
                      {activeCategory === "balance" && (
                        <span className="text-emerald-400">{p.balance}</span>
                      )}
                      {activeCategory === "kills" && (
                        <span className="text-rose-400">{p.kills}</span>
                      )}
                      {activeCategory === "playtime" && (
                        <span className="text-cyan-400">{p.playtime}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Sticky 3D Skin Preview Column */}
          <div className="sticky top-24">
            <SkinPreviewModal
              username={selectedPlayer.username}
              stats={{
                balance: selectedPlayer.balance,
                kills: selectedPlayer.kills,
                playtime: selectedPlayer.playtime,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
