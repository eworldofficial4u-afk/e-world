"use client";

import React, { useEffect, useRef } from "react";
import { SkinViewer, WalkingAnimation } from "skinview3d";

interface SkinPreviewModalProps {
  username: string;
  stats?: {
    playtime: string;
    kills: number;
    balance: string;
  };
}

export default function SkinPreviewModal({
  username,
  stats,
}: SkinPreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: 200,
        height: 260,
        skin: `https://mineskin.eu/skin/${username}`,
      });

      viewer.camera.position.set(0, 15, 38);
      viewer.zoom = 0.9;
      viewer.animation = new WalkingAnimation();
      viewerRef.current = viewer;
    } catch (err) {
      console.warn("skinview3d init error:", err);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, [username]);

  return (
    <div className="flex flex-col items-center p-4 bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-lg shadow-[0_0_30px_rgba(0,255,170,0.15)] font-mono">
      <div className="flex items-center justify-between w-full border-b border-emerald-500/20 pb-2 mb-3">
        <span className="text-[10px] text-emerald-400/70 tracking-widest uppercase">
          OPERATIVE SCAN
        </span>
        <span className="text-xs font-bold text-white tracking-widest uppercase">
          {username}
        </span>
      </div>

      <div className="relative w-[200px] h-[260px] bg-black/40 rounded border border-white/10 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* Subtle scanline line */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-40" />
      </div>

      {stats && (
        <div className="w-full mt-3 pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-white/70">
          <div className="flex justify-between">
            <span className="text-white/40">BALANCE:</span>
            <span className="text-emerald-400 font-bold">{stats.balance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">KILLS:</span>
            <span className="text-white font-semibold">{stats.kills}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">PLAYTIME:</span>
            <span className="text-white/80">{stats.playtime}</span>
          </div>
        </div>
      )}
    </div>
  );
}
