"use client";

import React, { useState } from "react";
import { upcomingEvents, CommunityEvent } from "../data/events";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Trophy, Swords, ShieldCheck, Flame, Users, Calendar, ExternalLink } from "lucide-react";

export default function EventsTournamentHub() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const { siteConfig } = useSiteConfig();

  // Featured Event (COD S&D Inaugural Tournament)
  const featured = upcomingEvents.find((e) => e.featured) || upcomingEvents[0];
  const tournamentTitle = siteConfig.tournament?.title || featured.title;
  const prizePool = siteConfig.tournament?.prizePool || "₹2,500 INR";

  const filteredEvents =
    selectedFilter === "all"
      ? upcomingEvents
      : upcomingEvents.filter((e) => e.category === selectedFilter);

  return (
    <section id="events" className="relative w-full py-16 px-4 sm:px-6 font-mono z-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-amber-400 text-xs tracking-widest font-bold mb-2">
            // OFFICIAL TOURNAMENT ARCHIVE & LIVE STAGE
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-md">
            COD SEARCH & DESTROY // HUB
          </h2>
          <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-3">
            Official E-World Call of Duty Search & Destroy championship series, match brackets, and tournament records.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* FEATURED EVENT HERO BANNER: COD S&D CHAMPIONSHIP */}
        {/* ========================================================================= */}
        <div className="hologram-glass p-5 sm:p-10 rounded-xl border border-amber-400/40 shadow-[0_15px_60px_rgba(245,158,11,0.2)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[11px] tracking-widest uppercase rounded">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>OFFICIAL RESULT // {featured.status}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight">
                {tournamentTitle}
              </h3>

              <div className="flex items-center gap-2 text-xs text-amber-400/90 font-bold tracking-wider">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>FINALE: PAIN AND DAGGERS VS DEMON SLAYERS</span>
              </div>

              <p className="text-white/70 text-xs sm:text-sm font-sans leading-relaxed max-w-lg">
                {featured.description}
              </p>

              {/* Tournament Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white/5 rounded border border-amber-400/20">
                  <span className="text-white/40 text-[9px] tracking-widest block">
                    WINNING PRIZE
                  </span>
                  <span className="text-amber-400 font-bold tracking-wider text-sm">
                    {prizePool}
                  </span>
                  <span className="text-white/40 text-[9px] block">Whole Team Prize</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <span className="text-white/40 text-[9px] tracking-widest block">
                    NORMAL ROUNDS
                  </span>
                  <span className="text-cyan-400 font-bold tracking-wider text-sm">
                    7 ROUNDS
                  </span>
                  <span className="text-white/40 text-[9px] block">Standard Bracket</span>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-white/40 text-[9px] tracking-widest block">
                    FINALE ROUNDS
                  </span>
                  <span className="text-red-400 font-bold tracking-wider text-sm">
                    10 ROUNDS
                  </span>
                  <span className="text-white/40 text-[9px] block">Championship Decider</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => setSelectedEvent(featured)}
                  data-interactive="true"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-widest text-xs uppercase rounded transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  VIEW FULL MATCH RECORD →
                </button>
                {siteConfig.tournament?.registrationUrl && (
                  <a
                    href={siteConfig.tournament.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-interactive="true"
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-widest text-xs uppercase rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>REGISTER SQUAD</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href="https://discord.com/api/oauth2/authorize?client_id=1543275777146097755&permissions=274877991936&scope=bot%20applications.commands"
                  target="_blank"
                  rel="noreferrer"
                  data-interactive="true"
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold tracking-widest text-xs uppercase rounded transition-all cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JOIN COMMUNITY DISCORD</span>
                </a>
              </div>
            </div>

            {/* GRAND FINALE WINNER PODIUM CARD */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-black/70 rounded-xl border border-amber-400/30 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Trophy className="w-8 h-8" />
              </div>

              <span className="text-[10px] text-amber-400 tracking-[0.3em] font-bold uppercase mb-1">
                TOURNAMENT CHAMPIONS
              </span>

              <h4 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mb-1">
                DEMON SLAYERS
              </h4>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mb-4">
                <span>🏆 ₹2,500 INR CASH AWARDED</span>
              </div>

              {/* Head to Head Card */}
              <div className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white/50 text-[10px] border-b border-white/5 pb-1">
                  <span>GRAND FINALE MATCHUP</span>
                  <span className="text-amber-400 font-bold">10 ROUNDS MATCH</span>
                </div>

                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-300">DEMON SLAYERS</span>
                  </div>
                  <span className="text-emerald-400 uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                    CHAMPION
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-red-300">PAIN AND DAGGERS</span>
                  </div>
                  <span className="text-red-400 uppercase text-[10px] px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40">
                    FINALIST
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between w-full text-[10px] text-white/40 pt-3 mt-2 border-t border-white/5">
                <span>FORMAT: SEARCH & DESTROY</span>
                <span>VERIFIED RECORD</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ALL TOURNAMENTS GRID */}
        {/* ========================================================================= */}
        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "ALL TOURNAMENTS" },
              { id: "tournament", label: "COMPLETED" },
              { id: "upcoming", label: "UPCOMING SEASONS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                data-interactive="true"
                className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded border transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-black/40 border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/40 tracking-widest">
            {filteredEvents.length} TOURNAMENT RECORDS
          </span>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              data-interactive="true"
              className="hologram-glass p-6 rounded-xl border border-white/10 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border ${
                      ev.status === "COMPLETED"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    }`}
                  >
                    {ev.categoryLabel}
                  </span>
                  <span className="text-[10px] text-white/40 tracking-wider font-bold">
                    {ev.status}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white tracking-wider uppercase mb-1 group-hover:text-amber-300 transition-colors">
                  {ev.title}
                </h4>
                <p className="text-white/60 text-xs tracking-wider mb-4">
                  {ev.subtitle}
                </p>

                <p className="text-white/70 text-xs font-sans leading-relaxed line-clamp-2 mb-4">
                  {ev.description}
                </p>

                {ev.finaleDetails && (
                  <div className="mb-4 p-3 bg-white/[0.02] border border-white/10 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-white/50 text-[10px]">
                      <span>WINNER:</span>
                      <span className="text-emerald-400 font-bold">{ev.finaleDetails.winner} 🏆</span>
                    </div>
                    <div className="flex justify-between text-white/50 text-[10px]">
                      <span>PRIZE:</span>
                      <span className="text-amber-400 font-bold">{ev.finaleDetails.winningPrize}</span>
                    </div>
                    <div className="flex justify-between text-white/50 text-[10px]">
                      <span>FINALE ROUNDS:</span>
                      <span className="text-white font-bold">{ev.finaleDetails.finaleRounds} Rounds</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/40 text-[10px] tracking-wider">
                  {ev.prizePool}
                </span>
                <span className="text-amber-400 font-bold tracking-wider group-hover:translate-x-1 transition-transform">
                  DETAILS →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EVENT DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hologram-glass max-w-lg w-full max-h-[85dvh] overflow-y-auto p-5 sm:p-8 rounded-xl border border-white/20 shadow-2xl relative font-mono text-left animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] text-amber-400 tracking-widest font-bold block mb-1">
              SPECIFICATION // {selectedEvent.categoryLabel.toUpperCase()}
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wider uppercase mb-2">
              {selectedEvent.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed mb-6">
              {selectedEvent.description}
            </p>

            {/* Finale Breakdown if available */}
            {selectedEvent.finaleDetails && (
              <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-lg mb-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Grand Finale Result</span>
                </div>
                <div className="text-xs text-white/80 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">Winning Team:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedEvent.finaleDetails.winner} 🏆
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Runner-Up:</span>
                    <span className="text-red-400 font-bold">
                      {selectedEvent.finaleDetails.teamA}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Winning Prize:</span>
                    <span className="text-amber-400 font-bold">
                      {selectedEvent.finaleDetails.winningPrize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Standard Bracket:</span>
                    <span className="text-white font-bold">
                      {selectedEvent.finaleDetails.normalRounds} Rounds
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Finale Rounds:</span>
                    <span className="text-white font-bold">
                      {selectedEvent.finaleDetails.finaleRounds} Rounds
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rules list */}
            <div className="mb-6">
              <span className="text-[10px] text-white/40 tracking-widest uppercase block mb-2">
                TOURNAMENT PROTOCOLS:
              </span>
              <ul className="space-y-1.5 text-xs text-white/80 font-sans">
                {selectedEvent.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400">▹</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded border border-white/10 mb-6 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-white/40 text-[9px] tracking-widest block">
                  PRIZE POOL
                </span>
                <span className="text-amber-400 font-bold tracking-wider">
                  {selectedEvent.prizePool}
                </span>
              </div>
              <div>
                <span className="text-white/40 text-[9px] tracking-widest block">
                  STATUS
                </span>
                <span className="text-emerald-400 font-bold tracking-wider">
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              data-interactive="true"
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest text-xs uppercase rounded transition-all cursor-pointer"
            >
              CLOSE RECORD
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
