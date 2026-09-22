"use client";

import React, { useState, useEffect } from "react";
import { soundEngine } from "@/hooks/useAudioEngine";

interface LiveTelemetryTickerProps {
  stats: any;
}

const mockEvents = [
  { id: 1, tag: "SMP", color: "#10b981", text: "Alex99 uncovered 4x Ancient Debris in Sector Gamma" },
  { id: 2, tag: "FIVEM", color: "#38bdf8", text: "10-80 Pursuit active on Vinewood Blvd // Unit 204 in pursuit" },
  { id: 3, tag: "COMMUNITY", color: "#f59e0b", text: "Weekly Bedwars Tournament Finals commence in 35 minutes" },
  { id: 4, tag: "SMP", color: "#10b981", text: "Faction [Aetheria] established outpost at X: 1420, Z: -890" },
  { id: 5, tag: "FIVEM", color: "#38bdf8", text: "Mayor announced 2x Tax Incentives for South LS Mechanics" },
  { id: 6, tag: "RADAR", color: "#a855f7", text: "Network Sync: 100% | 0 packet loss across all gateway nodes" },
];

export default function LiveTelemetryTicker({ stats }: LiveTelemetryTickerProps) {
  const [eventIndex, setEventIndex] = useState(0);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % mockEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentEvent = mockEvents[eventIndex];

  const handleOpenRadar = () => {
    soundEngine.playClickPunch();
    setIsRadarOpen(true);
  };

  return (
    <>
      {/* Live Ticker Bar */}
      <div
        onClick={handleOpenRadar}
        className="fixed bottom-0 left-0 right-0 z-20 h-7 bg-black/85 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-3 sm:px-6 font-mono text-[10px] tracking-wider text-white select-none cursor-pointer hover:bg-black/95 transition-colors group"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white/40 font-bold hidden xs:inline">
            LIVE UPLINK //
          </span>

          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span
              className="px-1.5 py-0.2 rounded text-[9px] font-bold"
              style={{
                backgroundColor: `${currentEvent.color}25`,
                color: currentEvent.color,
                border: `1px solid ${currentEvent.color}40`,
              }}
            >
              [{currentEvent.tag}]
            </span>
            <span className="text-white/80 group-hover:text-white transition-colors truncate max-w-[280px] sm:max-w-md md:max-w-xl">
              {currentEvent.text}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-3 text-white/40 text-[9px] hidden sm:flex">
          <span>TPS: 20.0</span>
          <span>·</span>
          <span>RADAR: ACTIVE</span>
          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
            [VIEW RADAR ↑]
          </span>
        </div>
      </div>

      {/* Global Radar Modal */}
      {isRadarOpen && (
        <div
          onClick={() => setIsRadarOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-lg animate-in fade-in duration-200 font-mono select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-black/90 border border-cyan-500/40 rounded-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-sm tracking-wider uppercase">
                  GLOBAL NETWORK RADAR
                </span>
              </div>
              <button
                onClick={() => setIsRadarOpen(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold block">
                    MINECRAFT SMP REALM
                  </span>
                  <span className="text-[10px] text-white/50">
                    HOST: mc.eworld.net | BLUEMAP: LIVE
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {stats.block?.players ?? 42} / {stats.block?.max ?? 100}
                  </span>
                  <span className="text-[9px] text-emerald-400 block">
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-cyan-400 font-bold block">
                    E-WORLD (FIVEM RP)
                  </span>
                  <span className="text-[10px] text-white/50">
                    DIRECT: cfx.re/join/eworld | CAD: ACTIVE
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {stats.grid?.players ?? 124} / {stats.grid?.max ?? 128}
                  </span>
                  <span className="text-[9px] text-cyan-400 block">
                    STABLE
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-amber-400 font-bold block">
                    E-WORLD DISCORD COMMUNITY
                  </span>
                  <span className="text-[10px] text-white/50">
                    VERIFIED VOICE STAGES & GUILDS
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">
                    {stats.nexus?.online ?? 1420} ONLINE
                  </span>
                  <span className="text-[9px] text-amber-400 block">
                    PULSING
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[10px] text-white/40 border-t border-white/10">
              <span>REFRESH INTERVAL: 1000MS</span>
              <button
                onClick={() => setIsRadarOpen(false)}
                className="hover:text-white cursor-pointer"
              >
                [ CLOSE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
