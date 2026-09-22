"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CityStatusTerminalProps {
  policeCount?: number;
  emsCount?: number;
  mechanicsCount?: number;
}

interface DispatchCall {
  id: string;
  time: string;
  code: string;
  location: string;
  priority: "HIGH" | "CRITICAL" | "ROUTINE";
  desc: string;
}

export default function CityStatusTerminal({
  policeCount = 14,
  emsCount = 6,
  mechanicsCount = 9,
}: CityStatusTerminalProps) {
  const [activeRobberies, setActiveRobberies] = useState([
    { name: "FLEECA BANK // VINEWOOD", status: "SECURED", icon: "✓" },
    { name: "PACIFIC STANDARD MAIN VAULT", status: "LOCKDOWN", icon: "⚠" },
    { name: "VANGELICO JEWELRY", status: "ROBBERY IN PROGRESS", icon: "🚨" },
    { name: "PALETO BAY DEPOSITORY", status: "SECURED", icon: "✓" },
  ]);

  const [dispatchCalls, setDispatchCalls] = useState<DispatchCall[]>([
    { id: "call-1", time: "13:52:10", code: "10-90", location: "Rockford Hills", priority: "CRITICAL", desc: "Silent alarm triggered at Vangelico Jewelry. 4 suspects armed with automatic rifles." },
    { id: "call-2", time: "13:51:30", code: "10-80", location: "Great Ocean Highway", priority: "HIGH", desc: "Black Pfister 911 evading state troopers at 160 MPH. Air support requested." },
    { id: "call-3", time: "13:50:05", code: "10-47", location: "Pillbox Hill", priority: "ROUTINE", desc: "Multi-vehicle collision near Legion Square. Paramedics en route." },
    { id: "call-4", time: "13:48:40", code: "10-71", location: "Strawberry / Carson", priority: "HIGH", desc: "Shots fired from vehicle. Multiple 911 calls from local residents." },
  ]);

  return (
    <section id="terminal" className="relative min-h-screen py-16 sm:py-24 px-4 sm:px-8 md:px-16 z-10 font-mono text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/15 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-cyan-400">
              <span>SECTION 02</span>
              <span className="text-white/30">//////////////////</span>
              <span>MUNICIPAL DISPATCH</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
              CITY STATUS TERMINAL
            </h2>
            <p className="text-[10px] sm:text-xs text-white/50 tracking-widest">
              DIRECT CAD / MDT INTEGRATION // ACTIVE SERVICES TELEMETRY
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest animate-pulse">
              THREAT LEVEL: ELEVATED
            </span>
          </div>
        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* LSPD On Duty */}
          <div className="p-6 bg-black/75 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
              <span className="tracking-widest">LSPD ENFORCEMENT</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              {policeCount} <span className="text-xs text-white/40 font-normal">UNITS ON DUTY</span>
            </div>
            <div className="text-[11px] text-white/50 flex justify-between border-t border-white/10 pt-2">
              <span>PRIMARY FREQ: 91.1 MHz</span>
              <span className="text-blue-400 font-bold">10-8 ACTIVE</span>
            </div>
          </div>

          {/* EMS / Pillbox Medical */}
          <div className="p-6 bg-black/75 backdrop-blur-xl border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-rose-400 mb-2">
              <span className="tracking-widest">PILLBOX MEDICAL (EMS)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              {emsCount} <span className="text-xs text-white/40 font-normal">PARAMEDICS</span>
            </div>
            <div className="text-[11px] text-white/50 flex justify-between border-t border-white/10 pt-2">
              <span>MED-EVAC HELI: READY</span>
              <span className="text-rose-400 font-bold">RESPONSE: 45s</span>
            </div>
          </div>

          {/* Mechanics / Customs */}
          <div className="p-6 bg-black/75 backdrop-blur-xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
              <span className="tracking-widest">LICENSED MECHANICS</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              {mechanicsCount} <span className="text-xs text-white/40 font-normal">BENNY&apos;S CREW</span>
            </div>
            <div className="text-[11px] text-white/50 flex justify-between border-t border-white/10 pt-2">
              <span>TOW DISPATCH: 10-8</span>
              <span className="text-amber-400 font-bold">TUNERS OPEN</span>
            </div>
          </div>
        </div>

        {/* Split Section: Robbery Alarm Board + Live 911 Dispatch Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Robbery / Vault Security Matrix */}
          <div className="lg:col-span-5 bg-black/80 backdrop-blur-xl border border-white/15 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-cyan-400 font-bold tracking-widest uppercase">
                VAULT & HEIST ALARM MATRIX
              </span>
              <span className="text-[10px] text-white/40">POLL: REAL-TIME</span>
            </div>

            <div className="space-y-3">
              {activeRobberies.map((robbery, i) => (
                <div
                  key={i}
                  className={`p-3 border flex items-center justify-between transition-all ${
                    robbery.status.includes("PROGRESS")
                      ? "bg-red-500/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                      : robbery.status === "LOCKDOWN"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{robbery.icon}</span>
                    <span className="text-xs font-bold tracking-wider">{robbery.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${
                      robbery.status.includes("PROGRESS")
                        ? "text-red-400 bg-red-950/60 animate-pulse"
                        : robbery.status === "LOCKDOWN"
                        ? "text-amber-400 bg-amber-950/60"
                        : "text-emerald-400 bg-emerald-950/60"
                    }`}
                  >
                    {robbery.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 911 Live Dispatch Console Feed */}
          <div className="lg:col-span-7 bg-black/80 backdrop-blur-xl border border-white/15 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>911 DISPATCH AUDIO & MDT STREAM</span>
              </div>
              <span className="text-[10px] text-white/40">RADIO: CH 01</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {dispatchCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{call.time}</span>
                      <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold">
                        {call.code}
                      </span>
                      <span className="text-white/80 font-semibold">{call.location}</span>
                    </div>
                    <span
                      className={`font-bold tracking-widest ${
                        call.priority === "CRITICAL"
                          ? "text-red-400"
                          : call.priority === "HIGH"
                          ? "text-amber-400"
                          : "text-blue-400"
                      }`}
                    >
                      [{call.priority}]
                    </span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    {call.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
