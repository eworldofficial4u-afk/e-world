"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function DecodingText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#010101";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function GridPenalCode() {
  const [selectedStatute, setSelectedStatute] = useState<string>("PC-101");

  const statutes = [
    {
      code: "PC-101",
      name: "FAIL ROLEPLAY (FRP)",
      severity: "MANDATORY WARNING / 24H BAN",
      desc: "Refusal to engage in realistic human behavior or deliberately breaking character immersion in public corridors. All interactions must maintain narrative integrity.",
      examples: "Driving hypercars off skyscrapers without injury RP, unrealistic voice chat emotes during cuffs.",
    },
    {
      code: "PC-204",
      name: "RANDOM / VEHICULAR DEATHMATCH (RDM/VDM)",
      severity: "IMMEDIATE 3-DAY REMOVAL",
      desc: "Initiating lethal force or weapon discharges without verifiable roleplay narrative, prior verbal demand, or established conflict timeline.",
      examples: "Executing players on sight with zero conversation; using vehicles as battering rams during shootouts.",
    },
    {
      code: "PC-309",
      name: "NOT VALUING LIFE (NVL)",
      severity: "JUDICIAL PENALTY / CITIZEN STRIP",
      desc: "Failure to exhibit instinctual self-preservation when held at gunpoint by superior force or isolated without cover. Your character's life is their ultimate asset.",
      examples: "Drawing a firearm while looking directly down the barrel of an assailant's weapon; jumping off bridges to avoid custody.",
    },
    {
      code: "PC-402",
      name: "METAGAMING & EXPLOITATIVE LOGOFF",
      severity: "HARD PERMANENT REVOCATION",
      desc: "Weaponizing outside information sourced from Discord streams, third-party radios, or disconnecting mid-scenario to prevent inventory loss or arrest.",
      examples: "Routing friends to backup coordinates without in-game radio chatter; ALT+F4 during police search.",
    },
    {
      code: "PC-515",
      name: "NEW LIFE RULE (NLR)",
      severity: "SCENARIO VOID & REPRIMAND",
      desc: "Upon succumbing to fatal injuries and taking the hospital local respawn, total psychological memory of the preceding conflict is permanently suppressed.",
      examples: "Returning to an active raid perimeter within 30 minutes of respawning; seeking revenge on your assailant.",
    },
  ];

  return (
    <section id="penal-code" className="relative min-h-screen py-20 px-4 sm:px-8 md:px-16 z-10 font-mono text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-xs text-cyan-400">
            <span>SECTION 04</span>
            <span className="text-white/30">//////////////////</span>
            <span>JUDICIAL STATUTES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            <DecodingText text="SAN ANDREAS PENAL CODE" />
          </h2>
          <p className="text-xs text-white/50 tracking-widest">
            FIREWALL OVERRIDE GRANTED // ROOT ACCESS: /ETC/PENAL_CODE.SYS
          </p>
        </div>

        {/* Hacker Terminal Window */}
        <div className="bg-black/85 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-black/90 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="ml-2 text-white/60 text-[10px] sm:text-[11px] truncate">terminal@eworld-grid:~# cat penal_code.md</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-cyan-400 font-bold shrink-0 ml-2">SECURE_SHELL_V4</span>
          </div>

          {/* Terminal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Left Statute Navigator */}
            <div className="lg:col-span-4 p-3 sm:p-4 space-y-2">
              <div className="text-[10px] text-white/40 tracking-widest px-2 mb-2">
                INDEXED STATUTES:
              </div>
              {statutes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedStatute(s.code)}
                  data-interactive="true"
                  className={`w-full text-left p-2.5 sm:p-3 text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedStatute === s.code
                      ? "bg-cyan-500/20 border-l-4 border-l-cyan-400 text-white font-bold"
                      : "bg-white/[0.02] hover:bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  <span className="text-cyan-400 shrink-0 font-bold">{s.code}</span>
                  <span className="truncate text-[11px]">{s.name}</span>
                  <span className="text-white/30 text-[10px] shrink-0">→</span>
                </button>
              ))}
            </div>

            {/* Right Detailed Inspector */}
            <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-6">
              {(() => {
                const s = statutes.find((item) => item.code === selectedStatute) || statutes[0];
                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs text-cyan-400 tracking-widest uppercase">
                          STATUTE IDENTIFIER: {s.code}
                        </div>
                        <h3 className="text-2xl font-black tracking-wide text-white uppercase mt-1">
                          {s.name}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] font-bold tracking-widest self-start sm:self-center">
                        {s.severity}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-white/40 tracking-widest uppercase">
                        // OPERATIONAL DIRECTIVE
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed tracking-wide">
                        {s.desc}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 border-l-2 border-cyan-400 text-xs text-white/70 space-y-1">
                      <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest">
                        DOCUMENTED CITATIONS / EXAMPLES:
                      </div>
                      <p className="text-[11px] text-white/60">
                        {s.examples}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
