"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface RankTier {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  gradient: string;
  accent: string;
  perks: string[];
}

export default function BlockArmory() {
  const [selectedRank, setSelectedRank] = useState<RankTier | null>(null);
  const [purchased, setPurchased] = useState(false);

  const tiers: RankTier[] = [
    {
      id: "void_walker",
      name: "VOID WALKER",
      price: "$14.99",
      subtitle: "TIER 01 // ENTRY SPEC",
      gradient: "from-emerald-400 via-teal-500 to-emerald-600",
      accent: "#00ffaa",
      perks: [
        "Priority login slot (bypasses queues)",
        "3x Sethomes across wilderness",
        "Void particle trail effect",
        "[VOID] Discord role & in-game tag",
        "10,000 Starting Crypto Creds",
      ],
    },
    {
      id: "quantum_core",
      name: "QUANTUM CORE",
      price: "$29.99",
      subtitle: "TIER 02 // ADVANCED OPERATIVE",
      gradient: "from-cyan-400 via-sky-500 to-blue-600",
      accent: "#00aaff",
      perks: [
        "All Void Walker protocol privileges",
        "7x Sethomes + Portable Ender Chest (/ec)",
        "Quantum electromagnetic aura cosmetic",
        "Access to daily quantum resource crate",
        "25,000 Starting Crypto Creds",
      ],
    },
    {
      id: "celestial",
      name: "CELESTIAL",
      price: "$49.99",
      subtitle: "TIER 03 // SUPREME ARCHITECT",
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      accent: "#ffaa00",
      perks: [
        "Unlimited queue priority clearance",
        "15x Sethomes + Auto-Smelt Toggle",
        "Solar bioluminescent crown cosmetic",
        "Private vault storage (+6 double chests)",
        "75,000 Starting Crypto Creds",
      ],
    },
  ];

  const handleBuy = (tier: RankTier) => {
    setSelectedRank(tier);
    setPurchased(false);
  };

  return (
    <section id="armory" className="relative min-h-[100dvh] py-16 sm:py-24 px-4 sm:px-8 md:px-16 z-10 font-mono">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="space-y-2 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-xs text-emerald-400">
            <span>SECTION 05</span>
            <span className="text-white/30">//////////////////</span>
            <span>MUNITIONS & PERKS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white">
            THE ARMORY
          </h2>
          <p className="text-[10px] sm:text-xs text-white/50 tracking-widest">
            PERMANENT PROTOCOL ACCESS // BIOLUMINESCENT COSMETICS & UTILITY
          </p>
        </div>

        {/* Tier Cards Grid with Iridescent Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -6 }}
              className="relative p-[1px] rounded-none group"
            >
              {/* Animated Iridescent Gradient Border */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${tier.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}
                style={{
                  filter: "blur(1px)",
                }}
              />

              {/* Glassmorphism Inner Card */}
              <div className="relative h-full flex flex-col justify-between p-5 sm:p-8 bg-black/85 backdrop-blur-xl border border-white/10 group-hover:border-transparent transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase">
                      {tier.subtitle}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shadow-[0_0_8px]"
                      style={{ backgroundColor: tier.accent, color: tier.accent }}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-white">
                      {tier.name}
                    </h3>
                    <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {tier.price}
                    </div>
                  </div>

                  {/* Perks List */}
                  <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-white/70">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span style={{ color: tier.accent }} className="font-bold">
                          +
                        </span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleBuy(tier)}
                    data-interactive="true"
                    className="w-full py-3 sm:py-3.5 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-mono text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer text-center group-hover:border-emerald-400 group-hover:text-emerald-300"
                  >
                    [ ACQUIRE CLEARANCE ]
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Purchase Confirmation Modal */}
        {selectedRank && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50">
            <div className="max-w-md w-full max-h-[85dvh] overflow-y-auto p-5 sm:p-6 bg-black/95 border border-emerald-400/50 shadow-[0_0_40px_rgba(0,255,170,0.3)] space-y-4">
              <div className="flex justify-between items-center border-b border-white/15 pb-2">
                <span className="text-xs text-emerald-400 font-bold uppercase">
                  TRANSACTION DISPATCH // {selectedRank.name}
                </span>
                <button
                  onClick={() => setSelectedRank(null)}
                  className="text-white/50 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!purchased ? (
                <>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Confirm protocol unlock for <strong>{selectedRank.name}</strong> ({selectedRank.price}).
                    Enter your Minecraft IGN to bind credentials:
                  </p>
                  <input
                    type="text"
                    placeholder="Enter Minecraft IGN..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white text-xs font-mono rounded focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setPurchased(true)}
                      className="flex-1 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      PROCEED TO CLEARANCE
                    </button>
                    <button
                      onClick={() => setSelectedRank(null)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs cursor-pointer"
                    >
                      ABORT
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-sm">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    TRANSACTION INITIALIZED
                  </h4>
                  <p className="text-xs text-white/60">
                    Order routed to server queue. Connect to <strong>mc.eworld.net</strong> to claim.
                  </p>
                  <button
                    onClick={() => setSelectedRank(null)}
                    className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
