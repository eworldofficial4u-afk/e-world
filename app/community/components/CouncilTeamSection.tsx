"use client";

import React from "react";
import Image from "next/image";
import { teamMembers } from "../data/team";

export default function CouncilTeamSection() {
  return (
    <section id="council" className="relative w-full py-16 px-4 sm:px-6 font-mono z-20">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-cyan-400 text-xs tracking-widest font-bold mb-2">
            // 07 ECOSYSTEM ARCHITECTS & COUNCIL
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-md font-display">
            E-WORLD COUNCIL
          </h2>
          <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-3">
            Executive leadership and vision guiding system reliability, community governance,
            and continuous universe expansion.
          </p>
        </div>

        {/* Featured Council Owner Card */}
        <div className="max-w-2xl mx-auto">
          {teamMembers.map((m) => (
            <div
              key={m.id}
              className="relative hologram-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.85)] hover:border-cyan-400/50 transition-all duration-300"
            >
              {/* Futuristic Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg pointer-events-none" />

              {/* Top Status Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black font-extrabold uppercase px-3 py-1 rounded bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                    ★ {m.badge}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-950/40">
                    LEVEL 00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/50 tracking-widest uppercase">
                    VERIFIED EXECUTIVE
                  </span>
                </div>
              </div>

              {/* Main Content: Portrait & Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Portrait Photo */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(0,245,255,0.25)] bg-zinc-900 group">
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 128px, 160px"
                      priority
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-2xl text-black"
                      style={{ background: m.avatarColor }}
                    >
                      {m.name.slice(0, 2)}
                    </div>
                  )}
                  {/* Subtle vignette gradient over photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Identity & Bio */}
                <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                  <div className="mb-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase font-display drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {m.name}
                    </h3>
                    <div className="text-sm font-bold tracking-widest uppercase text-cyan-400 mt-0.5">
                      {m.role}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed my-3">
                    {m.bio}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-[10px] text-white/50">
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 tracking-wider">
                      CROSS-REALM DIRECTIVE
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 tracking-wider">
                      SMP & FIVEM GOVERNANCE
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px] tracking-wider">DISCORD CONTACT:</span>
                  <span className="text-cyan-400 font-bold tracking-wider font-mono">
                    @{m.discordTag}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <span>CLEARANCE:</span>
                  <span className="text-emerald-400 font-bold">UNRESTRICTED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
