"use client";

import React, { useState } from "react";
import { ShieldAlert, KeyRound, ArrowRight, Lock } from "lucide-react";

interface AdminAuthModalProps {
  onAuthenticated: () => void;
  savedPasscode: string;
}

export default function AdminAuthModal({
  onAuthenticated,
  savedPasscode,
}: AdminAuthModalProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === savedPasscode.trim()) {
      sessionStorage.setItem("eworld_admin_auth", "true");
      setError(false);
      onAuthenticated();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl font-mono">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md p-8 bg-zinc-950/90 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl">
        {/* Corner tech accents */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-[0.3em] text-cyan-400 uppercase font-bold">
            // E-WORLD COMMAND MATRIX
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white uppercase tracking-wider mt-1">
            ADMIN TERMINAL ACCESS
          </h1>
          <p className="text-xs text-white/50 font-sans mt-2">
            Restricted access. Enter your administrative security key to configure website details and creator social links.
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-widest text-white/60 uppercase flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              SECURITY KEY / PASSCODE
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter access passcode..."
                autoFocus
                className={`w-full px-4 py-3 bg-black/60 border rounded-lg text-white font-mono text-sm tracking-wider focus:outline-none transition-all placeholder:text-white/20 ${
                  error
                    ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-shake"
                    : "border-white/20 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                }`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-mono">
                <ShieldAlert className="w-3.5 h-3.5" /> Invalid authentication key. Access denied.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-[0.2em] uppercase rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>AUTHENTICATE MATRIX</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Hint / Info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-[10px] text-white/40 hover:text-cyan-400 transition-colors tracking-widest uppercase cursor-pointer"
          >
            {showHint ? "Hide default key hint" : "Forgot key? View default"}
          </button>
          {showHint && (
            <div className="mt-2 p-2.5 bg-cyan-950/30 border border-cyan-500/20 rounded text-[11px] text-cyan-300">
              Default factory key: <code className="font-bold text-white bg-black/60 px-2 py-0.5 rounded">eworld2026</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
