"use client";

import React from "react";
import {
  X,
  ExternalLink,
  Activity,
  Zap,
  Server,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { BotStats } from "@/hooks/useLiveStats";

interface BotCommandsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  botStats?: BotStats;
  discordInvite?: string;
}

export default function BotCommandsDrawer({
  isOpen,
  onClose,
  botStats = { ping: 24, uptime: "99.98%", version: "v2.5.0-stats-only" },
  discordInvite = "https://discord.gg/ewld",
}: BotCommandsDrawerProps) {
  if (!isOpen) return null;

  const telemetryEndpoints = [
    {
      realm: "E-World // Discord Hub",
      type: "Live Guild & Voice Telemetry",
      description: "Streams real-time member counts and active voice channel frequencies directly to the website.",
      status: "STREAMING LIVE",
      indicatorColor: "text-emerald-400",
      bgColor: "bg-emerald-950/40 border-emerald-500/30",
      details: `Ping: ${botStats.ping}ms • Uptime: ${botStats.uptime}`,
    },
    {
      realm: "E-World // Minecraft SMP",
      type: "TCP Ping Protocol (Port 25565)",
      description: "Direct status queries via Server List Ping for online player counts and TPS.",
      status: "MONITORED",
      indicatorColor: "text-cyan-400",
      bgColor: "bg-cyan-950/40 border-cyan-500/30",
      details: "Auto-polled every 5 seconds",
    },
    {
      realm: "E-World // FiveM RP Server",
      type: "FXServer JSON Endpoint (Port 30120)",
      description: "Polls live player list and server slots from the FiveM backend server.",
      status: "MONITORED",
      indicatorColor: "text-amber-400",
      bgColor: "bg-amber-950/40 border-amber-500/30",
      details: "Auto-polled every 5 seconds",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,245,255,0.3)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-widest uppercase">
                LIVE SERVER TELEMETRY // STATS HUB
              </h2>
              <p className="text-xs text-white/50 font-mono">
                E-World Dedicated Stats Relay {botStats.version}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">{botStats.ping}ms</span>
            <span className="text-white/40">|</span>
            <span className="text-white/60">{botStats.uptime} UP</span>
          </div>
        </div>

        {/* Telemetry Overview */}
        <div className="space-y-3 font-mono">
          {telemetryEndpoints.map((item) => (
            <div
              key={item.realm}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/40 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white font-mono">
                    {item.realm}
                  </span>
                </div>

                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${item.bgColor} ${item.indicatorColor}`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-white/70 font-sans leading-relaxed mb-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.type}</span>
                </span>
                <span className="text-cyan-400/80 font-bold">{item.details}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>WebSocket broadcast active on port 8080</span>
          </div>

          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold font-mono tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all cursor-pointer"
          >
            <span>JOIN DISCORD VOICE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
