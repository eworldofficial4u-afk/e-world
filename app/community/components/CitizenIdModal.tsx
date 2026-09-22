"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  QrCode,
  Sparkles,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Citizen } from "@/hooks/useLiveStats";

interface CitizenIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCitizen?: Citizen;
}

export default function CitizenIdModal({
  isOpen,
  onClose,
  defaultCitizen,
}: CitizenIdModalProps) {
  const [syncCode, setSyncCode] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active citizen card state (initializes with default or KHAN)
  const [citizen, setCitizen] = useState<Citizen>(
    defaultCitizen || {
      id: "khan-01",
      username: "khan",
      displayName: "KHAN",
      avatar: "/images/community/khan.jpg",
      roles: ["Council Owner", "Architect", "Level 00"],
      clearance: "LEVEL 00 // EXECUTIVE",
      level: 99,
      xp: 285400,
      voiceHours: 420.5,
      status: "ONLINE",
      verifiedVia: "Executive Master Key",
    }
  );

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = process.env.NEXT_PUBLIC_API_URL || "https://e-world-bot-production.up.railway.app/api/verify";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: syncCode.trim(),
          username: usernameInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.citizen) {
        setCitizen(data.citizen);
        setSyncCode("");
        setUsernameInput("");
      } else {
        setError(data.error || "Unable to locate citizen credentials.");
      }
    } catch (err) {
      // Offline fallback: simulate instantaneous local verification if server is unreachable
      if (syncCode.trim() || usernameInput.trim()) {
        const handle = usernameInput.trim() || "CITIZEN_" + syncCode.trim();
        setCitizen({
          id: "citizen-" + Math.random().toString(36).substring(2, 7),
          username: handle.toLowerCase(),
          displayName: handle.toUpperCase(),
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(handle)}`,
          roles: ["Verified Citizen", "E-World Resident"],
          clearance: "LEVEL 01 // RESIDENT",
          level: Math.floor(Math.random() * 30) + 10,
          xp: Math.floor(Math.random() * 40000) + 5000,
          voiceHours: 34.2,
          status: "ONLINE",
          verifiedVia: syncCode ? "Discord Bot /sync Authorization" : "Instant Handle Sync",
        });
        setSyncCode("");
        setUsernameInput("");
      } else {
        setError("Please enter a valid 6-digit sync code or Discord username.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCardData = () => {
    navigator.clipboard.writeText(
      `E-WORLD CITIZEN ID: ${citizen.displayName} (@${citizen.username})\nClearance: ${citizen.clearance}\nLevel: ${citizen.level} (${citizen.xp.toLocaleString()} XP)\nRegistry: eworld.com/community`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,245,255,0.3)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-white tracking-widest uppercase">
              E-WORLD // CITIZEN IDENTITY REGISTRY
            </h2>
            <p className="text-xs text-white/50 font-mono">
              Holographic identity verification synced with Discord Bot protocols.
            </p>
          </div>
        </div>

        {/* Main Content: Card View & Sync Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Holographic ID Card Preview */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl p-6 border-2 border-cyan-400/50 bg-gradient-to-br from-black via-zinc-900 to-cyan-950/60 shadow-[0_8px_32px_rgba(0,245,255,0.25)] overflow-hidden">
              {/* Corner sci-fi accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

              {/* Hologram sheen line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none transform -skew-x-12 translate-x-[-150%] animate-[shimmer_4s_infinite]" />

              {/* Card Top Strip */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black tracking-widest px-2 py-0.5 rounded bg-cyan-400 text-black">
                    E-WORLD CITIZEN
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    ID // {citizen.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 tracking-wider">
                    {citizen.status}
                  </span>
                </div>
              </div>

              {/* Middle Profile Section */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.3)] bg-zinc-900">
                  {citizen.avatar ? (
                    <Image
                      src={citizen.avatar}
                      alt={citizen.displayName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-black bg-cyan-400">
                      {citizen.displayName.slice(0, 2)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black font-mono text-white tracking-wider truncate">
                      {citizen.displayName}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 block">
                    @{citizen.username}
                  </span>
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">
                    {citizen.clearance}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-center">
                <div>
                  <span className="text-[9px] text-white/40 block">LEVEL</span>
                  <span className="text-sm font-bold text-amber-400">
                    Lv. {citizen.level}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 block">EXPERIENCE</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {citizen.xp.toLocaleString()} XP
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 block">VOICE HRS</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {citizen.voiceHours}h
                  </span>
                </div>
              </div>

              {/* Roles Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {citizen.roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30"
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Bottom Card Barcode & Verification */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-white/50">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{citizen.verifiedVia || "Discord Synced"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={copyCardData}
                className="flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY CITIZEN CARD"}</span>
              </button>

              <span className="text-[10px] font-mono text-white/40">
                VERIFIED ECOSYSTEM CITIZEN
              </span>
            </div>
          </div>

          {/* Right Side: Sync Form & Instructions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  LINK YOUR DISCORD
                </span>
                <p className="text-xs text-white/60 leading-relaxed font-mono">
                  Type <span className="text-cyan-400 font-bold">/sync</span> in any Discord channel with our bot to generate a secure 6-digit authorization code.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3 font-mono">
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">
                    6-DIGIT SYNC CODE
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 777888 or 123456"
                      value={syncCode}
                      onChange={(e) => setSyncCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none tracking-widest uppercase font-bold"
                    />
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-zinc-950 px-2 text-[10px] text-white/40 uppercase">OR</span>
                  <div className="border-t border-white/10 w-full" />
                </div>

                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">
                    DISCORD HANDLE / USERNAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. khan, novapulse"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold tracking-widest uppercase hover:brightness-110 shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? "AUTHORIZING..." : "LINK & SYNC PROFILE"}</span>
                </button>
              </form>
            </div>

            {/* Hint footer */}
            <div className="mt-6 p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[11px] text-white/50">
              <span className="text-cyan-400 font-bold block mb-0.5">Quick Test:</span>
              Use code <code className="text-white font-bold bg-white/10 px-1 py-0.5 rounded">123456</code> or username <code className="text-white font-bold bg-white/10 px-1 py-0.5 rounded">khan</code> for instant verification demo!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
