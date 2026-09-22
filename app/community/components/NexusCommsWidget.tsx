"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mic, MicOff, Volume2, VolumeX, Radio, Users, ExternalLink, Sparkles } from "lucide-react";
import { VoiceChannel } from "@/hooks/useLiveStats";

export interface EWorldCommsWidgetProps {
  channels?: VoiceChannel[];
  discordInvite?: string;
  totalActiveVoice?: number;
}

export type NexusCommsWidgetProps = EWorldCommsWidgetProps;

export default function EWorldCommsWidget({
  channels = [],
  discordInvite = "https://discord.gg/ewld",
  totalActiveVoice = 0,
}: EWorldCommsWidgetProps) {
  const [activeChannelId, setActiveChannelId] = useState<string>(channels[0]?.id || "");

  const selectedChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  return (
    <div className="relative w-full rounded-2xl border border-cyan-500/30 bg-black/75 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Sci-fi corner brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-widest uppercase font-mono">
                E-WORLD // LIVE COMMS PODS
              </h3>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                DISCORD VOICE SYNC
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono mt-0.5">
              Live audio frequencies broadcasted directly from Discord server channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-[10px] text-white/40 block">BROADCAST TRAFFIC</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalActiveVoice} CITIZENS ACTIVE
            </span>
          </div>

          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold text-black rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all cursor-pointer"
          >
            <span>JOIN AUDIO</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: Channels Selector + Active Room Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Voice Channels List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            AVAILABLE AUDIO PODS ({channels.length})
          </span>

          <div className="flex flex-col gap-2">
            {channels.length === 0 ? (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center font-mono">
                <p className="text-xs text-white/50">Audio pods currently quiet.</p>
                <p className="text-[10px] text-cyan-400/80 mt-1">Join a voice channel on Discord to broadcast.</p>
              </div>
            ) : (
              channels.map((ch) => {
                const isSelected = (selectedChannel?.id || channels[0]?.id) === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {ch.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        <Users className="w-3 h-3" />
                        {ch.membersCount}
                      </span>
                    </div>

                    {/* Tiny waveform indicator */}
                    <div className="flex items-center gap-0.5 mt-2 h-2.5">
                      {[12, 24, 18, 28, 14, 22, 16, 26, 10, 20].map((h, idx) => (
                        <div
                          key={idx}
                          className={`w-1 rounded-full ${
                            isSelected ? "bg-cyan-400 animate-pulse" : "bg-white/20"
                          }`}
                          style={{
                            height: isSelected ? `${(h % 16) + 4}px` : "3px",
                            animationDelay: `${idx * 80}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Channel Active Speakers Pod */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-black/60 p-4 sm:p-5 relative">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                  ACTIVE FREQUENCY
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white font-mono uppercase">
                  {selectedChannel?.name || "E-World Audio Frequency"}
                </h4>
              </div>

              {/* Animated audio bar visualizer */}
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

            {/* Members in voice grid */}
            {!selectedChannel || !selectedChannel.users || selectedChannel.users.length === 0 ? (
              <div className="py-8 text-center font-mono">
                <Volume2 className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
                <p className="text-xs text-white/60">This audio pod is currently silent.</p>
                <p className="text-[10px] text-white/40 mt-1">Jump into Discord to be the first speaker in this channel.</p>
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
                        <span className="text-xs font-mono font-bold text-white block leading-none">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400/80 block mt-1">
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

          {/* Bottom quick actions */}
          <div className="mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-white/50">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Direct audio connection requires active Discord client
            </span>

            <a
              href={discordInvite}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
            >
              Connect to {selectedChannel?.name} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { EWorldCommsWidget as NexusCommsWidget };
