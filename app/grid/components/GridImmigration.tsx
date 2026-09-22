"use client";

import React, { useState } from "react";

export default function GridImmigration() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [receiptHash, setReceiptHash] = useState("");

  const [formData, setFormData] = useState({
    characterName: "",
    dob: "",
    occupation: "Civilian",
    backstory: "",
    scenarioResponse: "",
    discordTag: "",
    steamHex: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Generate simulated cryptographic application hash
      const hash = "SEC-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-PASS";
      setReceiptHash(hash);
      setSubmitted(true);
    }
  };

  return (
    <section id="apply" className="relative min-h-screen py-20 px-4 sm:px-8 md:px-16 z-10 font-mono text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2 border-b border-white/15 pb-6">
          <div className="flex items-center gap-3 text-xs text-cyan-400">
            <span>SECTION 05</span>
            <span className="text-white/30">//////////////////</span>
            <span>MIGRATION CLEARANCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span>IMMIGRATION APPLICATION</span>
            <span className="text-cyan-400 animate-pulse">_</span>
          </h2>
          <p className="text-xs text-white/50 tracking-widest">
            STRICT WHITELIST AUDIT // ASSIGNED BY MUNICIPAL IMMIGRATION BOARD
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
          <div className={`p-2 sm:p-3 border text-center transition-all ${step >= 1 ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" : "bg-white/5 border-white/10 text-white/40"}`}>
            01 // DOSSIER
          </div>
          <div className={`p-2 sm:p-3 border text-center transition-all ${step >= 2 ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" : "bg-white/5 border-white/10 text-white/40"}`}>
            02 // SCENARIO
          </div>
          <div className={`p-2 sm:p-3 border text-center transition-all ${step >= 3 ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" : "bg-white/5 border-white/10 text-white/40"}`}>
            03 // AUTH
          </div>
        </div>

        {/* Form Terminal Body */}
        <div className="bg-black/90 backdrop-blur-2xl border border-cyan-500/30 p-4 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.12)]">
          {!submitted ? (
            <form onSubmit={handleNext} className="space-y-6">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-xs text-cyan-400 tracking-widest uppercase border-b border-white/10 pb-2">
                    PHASE 1: CHARACTER BIOMETRICS & INTENDED PATHWAY
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 uppercase tracking-wider">
                        FULL CHARACTER NAME:
                      </label>
                      <input
                        required
                        type="text"
                        name="characterName"
                        value={formData.characterName}
                        onChange={handleChange}
                        placeholder="e.g. Victor Vance"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 uppercase tracking-wider">
                        DATE OF BIRTH (DD/MM/YYYY):
                      </label>
                      <input
                        required
                        type="text"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        placeholder="14/09/1998"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 uppercase tracking-wider">
                      PRIMARY INTENDED PATHWAY:
                    </label>
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Civilian">Civilian / Entrepreneur</option>
                      <option value="LSPD">Law Enforcement (LSPD Cadet)</option>
                      <option value="EMS">Medical Emergency Services (EMS)</option>
                      <option value="Mechanic">Mechanic / Automotive Tuner</option>
                      <option value="Criminal">Underground Syndicate / Criminal Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 uppercase tracking-wider">
                      CHARACTER BACKGROUND & MOTIVATIONS (MIN 50 WORDS):
                    </label>
                    <textarea
                      required
                      rows={4}
                      name="backstory"
                      value={formData.backstory}
                      onChange={handleChange}
                      placeholder="Detail who your character is, their past history before arriving in Los Santos, and their psychological flaws..."
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-xs text-cyan-400 tracking-widest uppercase border-b border-white/10 pb-2">
                    PHASE 2: ROLEPLAY SCENARIO SIMULATION
                  </div>

                  <div className="p-4 bg-white/5 border-l-2 border-cyan-400 text-xs text-white/80 leading-relaxed space-y-1">
                    <div className="text-cyan-300 font-bold uppercase tracking-widest text-[10px]">
                      // SCENARIO PROMPT
                    </div>
                    <p>
                      You are refueling your vehicle at a remote gas station in Sandy Shores.
                      Two masked individuals exit an unplated SUV and point submachine guns at you,
                      demanding your vehicle keys and communication radio. You have an unregistered firearm concealed in your glovebox.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 uppercase tracking-wider">
                      DETAILED IN-CHARACTER RESPONSE (DEMONSTRATE NVL & FEAR RP):
                    </label>
                    <textarea
                      required
                      rows={5}
                      name="scenarioResponse"
                      value={formData.scenarioResponse}
                      onChange={handleChange}
                      placeholder="Explain your character's exact actions, verbal dialogue, and psychological demeanor under gunpoint..."
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-xs text-cyan-400 tracking-widest uppercase border-b border-white/10 pb-2">
                    PHASE 3: DISCORD IDENTITY & STEAM AUTHENTICATION
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 uppercase tracking-wider">
                        DISCORD USERNAME:
                      </label>
                      <input
                        required
                        type="text"
                        name="discordTag"
                        value={formData.discordTag}
                        onChange={handleChange}
                        placeholder="username"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 uppercase tracking-wider">
                        STEAM HEX ID (STEAM:11000...):
                      </label>
                      <input
                        required
                        type="text"
                        name="steamHex"
                        value={formData.steamHex}
                        onChange={handleChange}
                        placeholder="steam:1100001xxxxxxxx"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-white/40 tracking-wider">
                    * By submitting this clearance request, you certify that you have reviewed the Penal Code and agree to adhere to all municipal roleplay standards.
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-white/10">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 hover:text-white text-xs uppercase tracking-widest cursor-pointer text-center"
                  >
                    [ ← PREVIOUS ]
                  </button>
                ) : <div className="hidden sm:block" />}

                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)] cursor-pointer text-center"
                >
                  {step === 3 ? "[ TRANSMIT CLEARANCE ]" : "[ ADVANCE PROTOCOL → ]"}
                </button>
              </div>
            </form>
          ) : (
            /* Submission Success State */
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-400/20 border border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto text-xl shadow-[0_0_20px_#00f0ff]">
                ✓
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                CLEARANCE REQUEST RECORDED
              </h3>
              <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                Your character dossier has been routed to the Municipal Immigration Board for review.
                Check your direct messages in Discord for status updates.
              </p>
              <div className="p-3 bg-white/5 border border-white/10 inline-block font-mono text-xs text-cyan-400">
                RECEIPT CODE: {receiptHash}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
