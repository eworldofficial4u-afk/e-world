"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FactionDossier {
  id: string;
  name: string;
  category: "GOVERNMENT" | "CRIMINAL" | "CIVILIAN";
  badgeCode: string;
  clearance: string;
  themeColor: string;
  gradient: string;
  motto: string;
  perks: string[];
}

export default function GridFactions() {
  const [activeFaction, setActiveFaction] = useState<FactionDossier | null>(null);

  const factions: FactionDossier[] = [
    {
      id: "lspd",
      name: "LOS SANTOS POLICE DEPT",
      category: "GOVERNMENT",
      badgeCode: "UNIT // 91-LSPD",
      clearance: "LEVEL 4 ENFORCEMENT",
      themeColor: "#00aaff",
      gradient: "from-blue-600 via-cyan-400 to-sky-600",
      motto: "TO PROTECT AND MAINTAIN ORDER IN SAN ANDREAS",
      perks: [
        "Fleet Access: Vapid Interceptor & Air One",
        "MDT / Automated License Plate Readers",
        "Full Lethal & Non-Lethal Armory Authorization",
        "Tactical SWAT Deployment Protocol",
      ],
    },
    {
      id: "ems",
      name: "SAN ANDREAS MEDICAL (EMS)",
      category: "GOVERNMENT",
      badgeCode: "MED // 04-SAMS",
      clearance: "LEVEL 3 MEDICAL",
      themeColor: "#ff0055",
      gradient: "from-rose-500 via-pink-400 to-red-600",
      motto: "PRESERVING LIFE ACROSS ALL EMERGENCY ZONES",
      perks: [
        "Rapid Med-Evac Helicopter Access",
        "Field Trauma Surgery Stabilization",
        "Subsidized Healthcare & Insurance Dispenser",
        "Neutral Immunity under Geneva RP Convention",
      ],
    },
    {
      id: "cartel",
      name: "UNDERGROUND SYNDICATE",
      category: "CRIMINAL",
      badgeCode: "CLASSIFIED // SYN-X",
      clearance: "UNREGISTERED ENTITY",
      themeColor: "#a855f7",
      gradient: "from-purple-600 via-fuchsia-400 to-indigo-600",
      motto: "TERRITORY DICTATED BY FORCE AND PRECISION",
      perks: [
        "Black Market Firearms & Class-3 Weapons",
        "Decentralized Money Laundering Terminals",
        "Controlled Chop Shops & VIN Scratching",
        "Coordinated Vault Robbery Blueprints",
      ],
    },
    {
      id: "mechanic",
      name: "BENNY'S MOTORWORKS",
      category: "CIVILIAN",
      badgeCode: "CIV // 77-CUSTOMS",
      clearance: "LICENSED CONTRACTOR",
      themeColor: "#f59e0b",
      gradient: "from-amber-500 via-yellow-400 to-orange-600",
      motto: "EXCELLENCE IN AUTOMOTIVE TUNING & REPAIR",
      perks: [
        "Custom Engine Swaps & Turbo Tuning",
        "Vehicle Armor & Performance Dyno Testing",
        "24/7 Heavy Towing & Roadside Recovery",
        "Bespoke Paint Schemes & Underglow Kits",
      ],
    },
  ];

  return (
    <section id="factions" className="relative min-h-screen py-20 px-4 sm:px-8 md:px-16 z-10 font-mono text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-2 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-xs text-cyan-400">
            <span>SECTION 03</span>
            <span className="text-white/30">//////////////////</span>
            <span>FACTIONS & EMPLOYMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            CITY DOSSIERS & JOBS
          </h2>
          <p className="text-xs text-white/50 tracking-widest">
            HOVER CREDENTIAL TO ENGAGE HOLOGRAPHIC FILTER
          </p>
        </div>

        {/* Faction ID Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {factions.map((f) => (
            <motion.div
              key={f.id}
              whileHover={{ y: -6 }}
              onMouseEnter={() => setActiveFaction(f)}
              data-interactive="true"
              className="relative p-[1px] group cursor-pointer"
            >
              {/* Animated Glow Border */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]`}
              />

              {/* Frosted Glass Credential Body */}
              <div className="relative h-full flex flex-col justify-between p-6 bg-black/85 backdrop-blur-xl border border-white/10 group-hover:border-transparent transition-all space-y-6">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-white/40 mb-3">
                    <span>{f.badgeCode}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: f.themeColor, boxShadow: `0 0 8px ${f.themeColor}` }}
                    />
                  </div>

                  <h3 className="text-lg font-black tracking-wide text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-300 transition-all">
                    {f.name}
                  </h3>

                  <div className="mt-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: f.themeColor }}>
                    [{f.clearance}]
                  </div>

                  <p className="mt-4 text-[11px] text-white/60 leading-relaxed border-t border-white/10 pt-3">
                    {f.motto}
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4 text-[10px] text-white/70">
                  <div className="text-[9px] text-white/30 uppercase tracking-widest">FACILITY SPEC:</div>
                  {f.perks.slice(0, 3).map((perk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: f.themeColor }} className="font-bold">+</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <span className="block w-full py-2 bg-white/5 group-hover:bg-white/15 border border-white/15 text-center text-[10px] font-bold tracking-widest uppercase transition-colors">
                    [ VIEW RECRUITMENT ]
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
