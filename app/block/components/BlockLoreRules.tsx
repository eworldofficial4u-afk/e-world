"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function GlitchText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";

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
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function BlockLoreRules() {
  const rules = [
    {
      num: "01",
      title: "HARDENED INTEGRITY",
      desc: "Zero modified clients, automated macros, or radar hacks. All infractions trigger immediate biometric ban.",
    },
    {
      num: "02",
      title: "UNREGULATED EXTRACTION",
      desc: "Wilderness zones are lawless. Open PVP, territory claims, and strategic raids are sanctioned.",
    },
    {
      num: "03",
      title: "DECENTRALIZED TRADE",
      desc: "All physical goods must flow through certified player market terminals. Counterfeiting results in hard forfeiture.",
    },
    {
      num: "04",
      title: "TERRAIN PERMANENCE",
      desc: "Griefing protected spawn perimeters is prevented via cryptographic claim wardens.",
    },
  ];

  return (
    <section id="lore" className="relative min-h-[100dvh] py-16 sm:py-24 px-4 sm:px-8 md:px-16 z-10 font-mono">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="space-y-2 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-xs text-emerald-400">
            <span>SECTION 02</span>
            <span className="text-white/30">//////////////////</span>
            <span>DIRECTIVE ARCHIVE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            <GlitchText text="LORE & SURVIVAL PROTOCOLS" />
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[9px] sm:text-[10px] text-white/50 tracking-wider">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
              <span className="w-1.5 h-1.5 bg-[#68a033] border border-emerald-400/80" />
              MATRIX CORE: MINECRAFT SPECIMEN [GRASS_CARRIED]
            </span>
            <span className="text-white/20">|</span>
            <span className="text-white/40">16×16 PIXEL-PERFECT VOXEL SUBSTRATE</span>
          </div>
          <p className="text-[10px] sm:text-xs text-white/50 tracking-widest pt-1">
            OPERATING UNDER EMERALD CIPHER // REVISION 4.19
          </p>
        </div>

        {/* Lore Manifesto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8 bg-black/60 backdrop-blur-xl border border-white/15 rounded-none">
          <div className="space-y-4">
            <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase">
              // ARCHIVAL RECORD 001
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              THE COLLAPSED HORIZON
            </h3>
            <p className="text-xs text-white/70 leading-relaxed tracking-wider">
              Following the rupture of the central E-World core, the voxel continuum fractured into
              isolated gravity wells. Only the resilient survived the descent into the core.
              Here, raw resources dictate hierarchy, and alliances are forged in obsidian.
            </p>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
            <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase">
              // WHITELIST ADMISSION
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              SECURITY CLEARANCE
            </h3>
            <ul className="text-xs text-white/70 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">01.</span> Link Discord ID in the E-WORLD terminal.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">02.</span> Pass mechanical audit & protocol review.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">03.</span> Receive assigned cryptographic seed coordinates.
              </li>
            </ul>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4">
          <div className="text-xs text-white/40 tracking-widest flex items-center gap-2">
            <span>OPERATIONAL MANDATES</span>
            <span>//////////////////</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <motion.div
                key={rule.num}
                whileHover={{ scale: 1.01, borderColor: "rgba(0,255,170,0.5)" }}
                className="p-6 bg-black/50 backdrop-blur-md border border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-400">{rule.num} //</span>
                  <span className="text-[10px] text-white/30 tracking-widest">MANDATE</span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-wider mb-2">
                  {rule.title}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  {rule.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
