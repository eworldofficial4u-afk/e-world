"use client";

import React, { useState, useMemo } from "react";
import { universeScenes } from "../data/realms";
import { upcomingEvents } from "../data/events";
import { creators } from "../data/creators";
import { teamMembers } from "../data/team";

interface MatrixEntry {
  type: "realms" | "esports" | "creators" | "council";
  index: string;
  title: string;
  category: string;
  status: string;
  metrics: string;
  details: string;
  raw: any;
}

export default function IndexMatrixTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<MatrixEntry | null>(null);

  // Build unified directory matrix list
  const allEntries: MatrixEntry[] = useMemo(() => {
    return [
      ...universeScenes.map((s) => ({
        type: "realms" as const,
        index: s.index,
        title: s.title.replace(/<br>/g, " "),
        category: s.category,
        status: "ONLINE / ACTIVE",
        metrics: s.tagline,
        details: s.description,
        raw: s,
      })),
      ...upcomingEvents.map((e, idx) => ({
        type: "esports" as const,
        index: `E0${idx + 1}`,
        title: e.title,
        category: e.categoryLabel,
        status: e.status,
        metrics: `${e.date} • ${e.prizePool}`,
        details: e.description,
        raw: e,
      })),
      ...creators.map((c, idx) => ({
        type: "creators" as const,
        index: `C0${idx + 1}`,
        title: c.name,
        category: c.category,
        status: "ACTIVE DISCORD ROLE",
        metrics: `${c.tag} • ${c.role}`,
        details: `${c.category} holding active verified permissions in the E-World community.`,
        raw: c,
      })),
      ...teamMembers.map((m, idx) => ({
        type: "council" as const,
        index: `T0${idx + 1}`,
        title: m.name,
        category: m.role,
        status: "LEADERSHIP",
        metrics: `@${m.discordTag} • Executive`,
        details: m.bio,
        raw: m,
      })),
    ];
  }, []);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((item) => {
      const matchCat = category === "all" || item.type === category;
      const q = search.toLowerCase();
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.metrics.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allEntries, category, search]);

  return (
    <section id="matrix" className="relative w-full py-16 px-4 sm:px-6 font-mono z-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-amber-400 text-xs tracking-widest font-bold mb-2">
            // ACTIVE THEORY DIRECTORY MATRIX
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-md">
            THE E-WORLD DIRECTORY
          </h2>
          <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-3">
            Search, filter, and inspect verified servers, sanctioned tournaments,
            partnered creators, and council leadership.
          </p>
        </div>

        {/* Toolbar: Search Input + Category Filter Chips */}
        <div className="hologram-glass p-4 sm:p-6 rounded-xl border border-white/15 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search world, creator, event..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/20 rounded text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "ALL ENTRIES" },
              { id: "realms", label: "REALMS" },
              { id: "esports", label: "TOURNAMENTS" },
              { id: "creators", label: "CREATORS" },
              { id: "council", label: "COUNCIL" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setCategory(chip.id)}
                data-interactive="true"
                className={`px-3 py-1.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase rounded border transition-all cursor-pointer ${
                  category === chip.id
                    ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "bg-black/40 border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex justify-between items-center text-xs text-white/50 mb-4 px-2">
          <span>
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "entry found" : "entries found"}
          </span>
          {(category !== "all" || search !== "") && (
            <button
              onClick={() => {
                setCategory("all");
                setSearch("");
              }}
              className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Reset filters ↗
            </button>
          )}
        </div>

        {/* Matrix Table */}
        <div className="hologram-glass rounded-xl border border-white/15 overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-white/15 bg-white/5 text-white/40 text-[10px] tracking-widest uppercase">
                <th className="py-4 px-6 w-20">IDX</th>
                <th className="py-4 px-6">REALM / ENTITY</th>
                <th className="py-4 px-6 w-56">CATEGORY</th>
                <th className="py-4 px-6 w-44">STATUS</th>
                <th className="py-4 px-6 w-32 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((row) => (
                <tr
                  key={`${row.type}-${row.index}`}
                  onClick={() => setSelectedEntry(row)}
                  data-interactive="true"
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 text-white/40 font-mono">
                    {row.index}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                      {row.title}
                    </div>
                    <div className="text-[10px] text-white/40 tracking-wider">
                      {row.metrics}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${
                        row.type === "realms"
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                          : row.type === "esports"
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : row.type === "creators"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-amber-400 group-hover:text-white font-bold tracking-widest text-[11px] transition-colors">
                      INSPECT →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          onClick={() => setSelectedEntry(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hologram-glass max-w-lg w-full max-h-[85dvh] overflow-y-auto p-5 sm:p-8 rounded-xl border border-white/20 shadow-2xl relative font-mono text-left animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] text-amber-400 tracking-widest font-bold block mb-1">
              DIRECTORY TRANSMISSION // {selectedEntry.index}
            </span>

            <h3 className="text-2xl font-bold text-white tracking-wider uppercase mb-2">
              {selectedEntry.title}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/80">
                {selectedEntry.category}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                {selectedEntry.status}
              </span>
            </div>

            <p className="text-sm text-white/70 font-sans leading-relaxed mb-6">
              {selectedEntry.details}
            </p>

            <div className="p-3 bg-white/5 rounded border border-white/10 mb-6 text-xs text-white/80">
              <span className="text-white/40 text-[10px] tracking-widest block mb-1">
                SYSTEM TELEMETRY
              </span>
              <span>{selectedEntry.metrics}</span>
            </div>

            <a
              href="https://discord.gg/ewld"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-widest text-xs uppercase rounded transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              ACCESS ENTRY ON DISCORD →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
