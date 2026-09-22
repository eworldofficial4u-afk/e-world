"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Radio,
  Users,
  Activity,
  Volume2,
  Lock,
  ExternalLink,
  Mic,
  MicOff,
  VolumeX,
  Sparkles,
  Server,
  Zap,
} from "lucide-react";
import { ServerStats } from "@/hooks/useLiveStats";

interface GuildAnalyticsDashboardProps {
  stats: ServerStats;
  isConnected: boolean;
  discordInvite?: string;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  tag: string;
  category: string;
  badge: string;
  avatarUrl?: string;
  avatarGradient?: string;
  avatarGlow?: string;
  role: string;
  specialties?: string[];
  verified: boolean;
  bioLink?: string;
  links?: {
    youtube?: string;
    twitch?: string;
    twitter?: string;
    instagram?: string;
    discord?: string;
    kick?: string;
    bio?: string;
    website?: string;
  };
}

export default function GuildAnalyticsDashboard({
  stats,
  isConnected,
  discordInvite = "https://discord.gg/ewld",
}: GuildAnalyticsDashboardProps) {
  const [activeChannelId, setActiveChannelId] = useState<string>("");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);

  const voiceChannels = stats.nexus.voiceChannels || [];
  const selectedChannel =
    voiceChannels.find((c) => c.id === activeChannelId) || voiceChannels[0];

  // Fetch verified creators dynamically from live server
  useEffect(() => {
    let isMounted = true;
    async function fetchCreators() {
      try {
        const res = await fetch("https://e-world-bot-production.up.railway.app/api/creators");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.creators) {
            setCreators(data.creators);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live creators:", err);
      } finally {
        if (isMounted) setIsLoadingCreators(false);
      }
    }
    fetchCreators();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalVoiceMembers = stats.nexus.voiceActive || 0;
  const totalGuildMembers = stats.nexus.online || 0;
  const botPing = stats.nexus.botStats?.ping || 24;
  const botUptime = stats.nexus.botStats?.uptime || "99.9%";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-mono pb-12">
      {/* Top Banner: Guild Security & Live Identity */}
      <div className="relative rounded-2xl border border-cyan-500/30 bg-black/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(0,245,255,0.12)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,245,255,0.3)]">
              <Radio className="w-7 h-7 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  ● TELEMETRY ONLINE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PRIVATE BOT ENFORCED
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  GUILD ID: 1539496402890133574
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                {stats.nexus.guildName || "E-World Community"} // GUILD OPERATIONS
              </h2>
              <p className="text-xs text-white/50 tracking-wide mt-1">
                Real-time voice traffic, guild occupancy, and verified creator telemetry direct from Discord gateway.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <a
              href={discordInvite}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all cursor-pointer"
            >
              <span>CONNECT VOICE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Hologram Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] uppercase tracking-wider">GUILD CITIZENS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {totalGuildMembers > 0 ? totalGuildMembers.toLocaleString() : "Syncing..."}
          </div>
          <span className="text-[10px] text-cyan-400/80 mt-1 block">
            ● Total Server Members
          </span>
        </div>

        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-xl relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.1)]">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400">VOICE ACTIVE</span>
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {totalVoiceMembers}
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">
            ● Citizens in Voice Rooms
          </span>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] uppercase tracking-wider">ACTIVE AUDIO PODS</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {voiceChannels.length}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">
            ● Live Transmitting Pods
          </span>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-white/40 mb-2">
            <span className="text-[11px] uppercase tracking-wider">BOT HEALTH</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {botPing}ms
          </div>
          <span className="text-[10px] text-white/50 mt-1 block">
            Gateway Ping • {botUptime} Up
          </span>
        </div>
      </div>

      {/* Voice Comms Telemetry Widget */}
      <div className="rounded-2xl border border-cyan-500/25 bg-black/70 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                LIVE DISCORD AUDIO PODS
              </h3>
              <p className="text-[11px] text-white/50">
                Direct audio channel transmission feeds. Active microphones and headsets updated in real time.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/40 block">BROADCAST TRAFFIC</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalVoiceMembers} TRANSMITTING NOW
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Channel Selector */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <span className="text-[11px] text-white/40 uppercase tracking-wider">
              SELECT FREQUENCY ({voiceChannels.length})
            </span>

            <div className="flex flex-col gap-2">
              {voiceChannels.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                  <p className="text-xs text-white/50">Audio pods currently quiet.</p>
                  <p className="text-[10px] text-cyan-400/80 mt-1">Join any voice channel on Discord to broadcast.</p>
                </div>
              ) : (
                voiceChannels.map((ch) => {
                  const isSelected = (selectedChannel?.id || voiceChannels[0]?.id) === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannelId(ch.id)}
                      className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {ch.name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                          <Users className="w-3 h-3" />
                          {ch.membersCount}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Speakers In Channel */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-black/60 p-5 relative">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <span className="text-[10px] text-cyan-400 tracking-wider">
                    BROADCASTING ON
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white uppercase">
                    {selectedChannel?.name || "E-World Frequency"}
                  </h4>
                </div>

                <div className="flex items-end gap-1 h-6 px-3 py-1 rounded bg-black/60 border border-white/10">
                  {[14, 22, 8, 26, 18, 28, 12, 24, 16].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDuration: `${500 + i * 120}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {!selectedChannel || !selectedChannel.users || selectedChannel.users.length === 0 ? (
                <div className="py-10 text-center">
                  <Volume2 className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
                  <p className="text-xs text-white/60">No citizens currently transmitting in this pod.</p>
                  <p className="text-[10px] text-white/40 mt-1">Jump into Discord to be the first in this voice channel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedChannel.users.map((user, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="w-full h-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-black">
                              {user.name.slice(0, 2)}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                        </div>

                        <div>
                          <span className="text-xs font-bold text-white block leading-none">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-cyan-400/80 block mt-1">
                            Transmitting
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-white/50">
                        {user.isMute ? (
                          <MicOff className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {user.isDeaf && <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Discord audio connection
              </span>
              <a
                href={discordInvite}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-bold underline"
              >
                Join {selectedChannel?.name || "Voice"} on Discord ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Role Creators Roster (Active Discord Role Members) */}
      <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                VERIFIED ROLE CREATORS ({creators.length})
              </h3>
              <p className="text-[11px] text-white/50">
                Members verified directly via Discord server roles: Star Creator (1550017295789588523) & Content Creator (1550016791428730960).
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/20 font-bold">
            ● 100% AUTHENTIC DISCORD ROLES
          </span>
        </div>

        {isLoadingCreators ? (
          <div className="py-8 text-center text-xs text-white/50">Loading verified creator roster...</div>
        ) : creators.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/50">No verified creator roles detected.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/40 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-cyan-400/40 shrink-0">
                    {c.avatarUrl ? (
                      <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full bg-cyan-800 flex items-center justify-center font-bold text-white">
                        {c.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          c.category === "Star Creator"
                            ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                            : "bg-cyan-950/80 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {c.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/50 block truncate">{c.tag}</span>
                    <span className="text-[10px] text-cyan-400/80 block mt-0.5 truncate">{c.role}</span>
                  </div>
                </div>

                {/* Connected Links & Direct Bio Link */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                  {c.bioLink ? (
                    <a
                      href={c.bioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[10px] font-mono tracking-wider truncate max-w-[170px]"
                      title={c.bioLink}
                    >
                      <span>🔗</span>
                      <span className="truncate">{c.bioLink.replace(/^https?:\/\/(www\.)?/, "")}</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-white/30 text-[10px]">Discord Role Verified</span>
                  )}

                  <div className="flex items-center gap-2">
                    {c.links?.youtube && (
                      <a
                        href={c.links.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-red-400 text-xs transition-colors"
                        title="YouTube"
                      >
                        ▶
                      </a>
                    )}
                    {c.links?.instagram && (
                      <a
                        href={c.links.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-pink-400 text-xs transition-colors"
                        title="Instagram"
                      >
                        📷
                      </a>
                    )}
                    {c.links?.twitch && (
                      <a
                        href={c.links.twitch}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-purple-400 text-xs transition-colors"
                        title="Twitch"
                      >
                        👾
                      </a>
                    )}
                    {c.links?.twitter && (
                      <a
                        href={c.links.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-white text-xs transition-colors"
                        title="X / Twitter"
                      >
                        𝕏
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 text-amber-300/80 text-xs flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block mb-0.5">Private Containment Protocol Active</strong>
          This bot operates exclusively on E-World Guild (<span className="font-bold text-white">1539496402890133574</span>). Automated single-guild lockdown is enforced at the gateway layer. Any unauthorized third-party invite attempt will trigger an instant server leave.
        </div>
      </div>
    </div>
  );
}
