"use client";

import React from "react";

export default function DiscordCitizenCTA() {
  return (
    <section className="relative w-full py-24 px-6 font-mono z-20">
      <div className="max-w-5xl mx-auto hologram-glass p-8 sm:p-14 rounded-2xl border border-amber-400/40 shadow-[0_20px_60px_rgba(245,158,11,0.2)] text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] tracking-widest uppercase rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>DISCORD GATEWAY // 12,300+ CITIZENS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight">
            CLAIM YOUR CITIZEN PASS<span className="text-amber-400">.</span>
          </h2>

          <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
            Your passport to the E-World digital universe. Verify your Discord
            account, claim roleplay visas, register your tournament roster, and
            unlock member-exclusive events.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs text-white/80">
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <span className="text-amber-400 block mb-1">01</span>
              <span>24/7 Voice Lounges</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <span className="text-emerald-400 block mb-1">02</span>
              <span>SMP Whitelist</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <span className="text-cyan-400 block mb-1">03</span>
              <span>FiveM Visas</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <span className="text-purple-400 block mb-1">04</span>
              <span>Cash Tourneys</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <a
              href="https://discord.gg/ewld"
              target="_blank"
              rel="noreferrer"
              data-interactive="true"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-[0.2em] uppercase rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer group"
            >
              <span>ENTER E-WORLD ON DISCORD</span>
              <span className="transition-transform group-hover:translate-x-1.5">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
