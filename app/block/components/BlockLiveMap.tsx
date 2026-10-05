"use client";

import React, { useState } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function BlockLiveMap() {
  const { siteConfig } = useSiteConfig();
  const [activeDimension, setActiveDimension] = useState<"overworld" | "nether" | "end">("overworld");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [useIframe, setUseIframe] = useState(true);

  const rawMapUrl = siteConfig.realms?.smp?.externalMapUrl?.trim() || "";
  const serverIp = siteConfig.realms?.smp?.serverIp || "151.243.226.61:25565";

  return (
    <section id="map" className="relative min-h-[100dvh] py-16 sm:py-24 px-4 sm:px-8 md:px-16 z-10 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-emerald-400">
              <span>SECTION 03</span>
              <span className="text-white/30">//////////////////</span>
              <span>ORBITAL RECON</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
              LIVE SATELLITE MAP
            </h2>
            <p className="text-[10px] sm:text-xs text-white/50 tracking-widest">
              CONTINUOUS RADAR SCAN // HIGH-ALTITUDE DYNMAP TELEMETRY
            </p>
          </div>

          {/* Dimension Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(["overworld", "nether", "end"] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => setActiveDimension(dim)}
                data-interactive="true"
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest border transition-all cursor-pointer ${
                  activeDimension === dim
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(0,255,170,0.3)]"
                    : "bg-black/50 border-white/10 text-white/50 hover:text-white hover:border-white/30"
                }`}
              >
                [ {dim} ]
              </button>
            ))}
          </div>
        </div>

        {/* The Cyberpunk CRT Map Frame */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[540px] bg-black/90 border border-white/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {/* Top HUD bar of the map */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-black/80 backdrop-blur-md border-b border-white/15 text-[11px] text-white/70">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ORBITAL SCANNER: ONLINE
              </span>
              <span className="text-white/20">|</span>
              <span>HOST: {serverIp}</span>
            </div>

            <div className="flex items-center gap-3">
              {rawMapUrl && (
                <button
                  onClick={() => setUseIframe(!useIframe)}
                  className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/40 text-[10px] cursor-pointer"
                >
                  {useIframe ? "RADAR VIEW" : "LIVE MAP VIEW"}
                </button>
              )}

              <button
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 cursor-pointer"
              >
                +
              </button>
              <span className="text-[10px] text-white/50">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 cursor-pointer"
              >
                -
              </button>
            </div>
          </div>

          {/* Interactive Live Web Map or Simulated Radar Viewport */}
          {rawMapUrl && useIframe ? (
            <div className="w-full h-full pt-10">
              <iframe
                src={rawMapUrl}
                title="Minecraft Live World Map"
                className="w-full h-full border-0 pointer-events-auto"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-300 relative bg-[#060b09]"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Topographic radar grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#092317_1px,transparent_1px),linear-gradient(to_bottom,#092317_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

              {/* Simulated biome map radar */}
              <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md">
                <div className="w-28 h-28 rounded-full border border-emerald-500/40 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,255,170,0.2)]">
                  <div className="w-16 h-16 rounded-full border border-emerald-400/60 animate-ping" />
                  <div className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#00ffaa]" />
                  <div className="absolute top-1 text-[8px] text-emerald-400">SPAWN [0,0]</div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-white/80 font-bold tracking-widest uppercase">
                    ACTIVE REALM: {activeDimension}
                  </p>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Live telemetry link established with <span className="text-emerald-400">{serverIp}</span>.
                    Install Dynmap, BlueMap, or Pl3xMap on your Purpur server to stream real-time 3D voxel tiles here.
                  </p>
                </div>

                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[11px] text-emerald-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SECTORS SYNCED // PURPUR 1.21.11</span>
                </div>
              </div>
            </div>
          )}

          {/* CRT scanlines and vignette over the map */}
          <div className="absolute inset-0 pointer-events-none scanlines opacity-50 z-30" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/60 z-30" />
        </div>
      </div>
    </section>
  );
}
