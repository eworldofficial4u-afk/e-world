"use client";

import React, { useState } from "react";
import { creators, Creator } from "../data/creators";

export default function CreatorGuildSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "Star Creator" | "Content Creator">("all");
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard?.writeText(tag);
    setCopiedHandle(tag);
    setTimeout(() => {
      setCopiedHandle(null);
    }, 2000);
  };

  const starCreators = creators.filter((c) => c.category === "Star Creator");
  const contentCreators = creators.filter((c) => c.category === "Content Creator");

  return (
    <section id="creators" className="relative w-full py-16 px-4 sm:px-6 font-mono z-20">
      <div className="max-w-6xl mx-auto">
        {/* ================================================================ */}
        {/* 1. SECTION HEADER: E-WORLD CREATORS */}
        {/* ================================================================ */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs tracking-widest font-bold uppercase">
              // 06 TALENT & MEDIA NETWORK
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            E-WORLD CREATORS
          </h2>

          <p className="text-white/70 text-xs sm:text-sm tracking-wider max-w-2xl mt-4 font-sans leading-relaxed">
            Partnered filmmakers, machinima directors, and variety streamers broadcasting the stories, SMP megabuilds, and competitive showdowns of E-World across global platforms.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 p-1.5 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              ALL CREATORS ({creators.length})
            </button>
            <button
              onClick={() => setActiveCategory("Star Creator")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeCategory === "Star Creator"
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/10"
              }`}
            >
              <span>★</span> STAR CREATORS ({starCreators.length})
            </button>
            <button
              onClick={() => setActiveCategory("Content Creator")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeCategory === "Content Creator"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-400/10"
              }`}
            >
              <span>⚡</span> CONTENT CREATORS ({contentCreators.length})
            </button>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedHandle && (
          <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-black px-4 py-2.5 rounded-lg font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
            <span>✓</span>
            <span>Copied {copiedHandle} to clipboard!</span>
          </div>
        )}

        {/* ================================================================ */}
        {/* 2. CATEGORY 1: STAR CREATORS */}
        {/* ================================================================ */}
        {(activeCategory === "all" || activeCategory === "Star Creator") && (
          <div className="mb-14">
            {/* Category Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-400/30 pb-3 mb-8">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded text-sm">
                  ★
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase">
                    STAR CREATORS
                  </h3>
                  <span className="text-white/40 text-[11px] tracking-widest block font-sans">
                    Premier media icons & cinematic storytellers
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded self-start sm:self-center">
                TIER 01 SHOWCASE
              </span>
            </div>

            {/* Star Creators Grid: Large Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {starCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  isStar
                  copiedHandle={copiedHandle}
                  onCopyTag={handleCopyTag}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 3. CATEGORY 2: CONTENT CREATORS */}
        {/* ================================================================ */}
        {(activeCategory === "all" || activeCategory === "Content Creator") && (
          <div className="mb-14">
            {/* Category Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-400/30 pb-3 mb-8">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded text-sm">
                  ⚡
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider uppercase">
                    CONTENT CREATORS
                  </h3>
                  <span className="text-white/40 text-[11px] tracking-widest block font-sans">
                    Competitive casters, roleplay leads & community variety streamers
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase px-3 py-1 bg-cyan-400/10 border border-cyan-400/30 rounded self-start sm:self-center">
                COMMUNITY GUILD
              </span>
            </div>

            {/* Content Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  isStar={false}
                  copiedHandle={copiedHandle}
                  onCopyTag={handleCopyTag}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 4. BECOME A CREATOR CALLOUT BANNER */}
        {/* ================================================================ */}
        <div className="relative hologram-glass p-8 sm:p-10 rounded-2xl border border-white/15 overflow-hidden shadow-2xl mt-12 bg-gradient-to-r from-purple-950/20 via-black/60 to-cyan-950/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-[10px] text-amber-400 tracking-widest font-bold uppercase block mb-1">
                // AMBASSADOR INITIATIVE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                CREATE WITH E-WORLD
              </h3>
              <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-2 font-sans">
                Are you a streamer, YouTuber, or competitive caster? Join the official E-World Creator Guild on Discord to unlock whitelists, priority queues, and channel spotlights.
              </p>
            </div>
            <a
              href="https://discord.gg/ewld"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black font-extrabold tracking-widest text-xs uppercase rounded-xl transition-all duration-200 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              APPLY FOR CREATOR STATUS →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// INDIVIDUAL CREATOR CARD COMPONENT
// ============================================================================
interface CreatorCardProps {
  creator: Creator;
  isStar: boolean;
  copiedHandle: string | null;
  onCopyTag: (tag: string) => void;
}

function CreatorCard({ creator, isStar, copiedHandle, onCopyTag }: CreatorCardProps) {
  return (
    <div
      className={`relative hologram-glass rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group shadow-xl ${
        isStar
          ? "border border-amber-400/35 hover:border-amber-400/80 bg-gradient-to-b from-amber-950/20 via-black/70 to-black/90 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]"
          : "border border-cyan-500/25 hover:border-cyan-400/60 bg-gradient-to-b from-cyan-950/15 via-black/70 to-black/90 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
      }`}
    >
      {/* Sci-Fi Corner Brackets */}
      <div
        className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-lg pointer-events-none ${
          isStar ? "border-amber-400/70" : "border-cyan-400/60"
        }`}
      />
      <div
        className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-lg pointer-events-none ${
          isStar ? "border-amber-400/70" : "border-cyan-400/60"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-lg pointer-events-none ${
          isStar ? "border-amber-400/70" : "border-cyan-400/60"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-lg pointer-events-none ${
          isStar ? "border-amber-400/70" : "border-cyan-400/60"
        }`}
      />

      <div>
        {/* Card Header: Avatar, Name, Handle, Badge */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Holographic Avatar Box */}
            <div className="relative shrink-0">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-extrabold text-base sm:text-lg text-black shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: creator.avatarGradient,
                  boxShadow: `0 0 25px ${creator.avatarGlow}`,
                }}
              >
                {creator.initials}
              </div>
              {/* Live/Verified Indicator Dot */}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* Name & Handle */}
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                  {creator.name}
                </h4>
                {creator.verified && (
                  <span
                    title="Verified E-World Creator"
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold border border-amber-400/40"
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* Tag / Copy Button */}
              <button
                onClick={() => onCopyTag(creator.tag)}
                title="Click to copy handle"
                className="flex items-center gap-1 text-white/50 hover:text-amber-300 text-xs tracking-wider transition-colors cursor-pointer group/tag"
              >
                <span>{creator.tag}</span>
                <span className="text-[10px] opacity-60 group-hover/tag:opacity-100">
                  {copiedHandle === creator.tag ? "✓ copied" : "⎘"}
                </span>
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-extrabold tracking-widest uppercase border ${
              isStar
                ? "bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            }`}
          >
            {isStar ? "★ STAR" : "⚡ CREATOR"}
          </span>
        </div>

        {/* Role Tagline */}
        <p className="text-white/80 text-xs font-medium tracking-wide mb-3 font-sans">
          {creator.role}
        </p>

        {/* Specialties Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {creator.specialties.map((spec, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-[10px] rounded-md tracking-wider transition-colors"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* In-Universe Lore Quote */}
        <blockquote
          className={`text-xs text-white/80 font-sans italic leading-relaxed pl-3 border-l-2 mb-6 ${
            isStar ? "border-amber-400/70" : "border-cyan-400/60"
          }`}
        >
          {creator.featuredQuote}
        </blockquote>
      </div>

      {/* Card Footer: Metrics & Social Media Hub */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Reach Metric */}
        <div>
          <span className="text-white/40 text-[9px] tracking-widest block uppercase font-mono">
            ESTIMATED REACH
          </span>
          <span
            className={`font-extrabold text-xs tracking-wider font-mono ${
              isStar ? "text-amber-400" : "text-cyan-300"
            }`}
          >
            {creator.subscribers} CITIZENS
          </span>
        </div>

        {/* Social Media Link Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* YouTube */}
          {creator.links.youtube && (
            <SocialButton
              href={creator.links.youtube}
              label="YouTube"
              colorClass="hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </SocialButton>
          )}

          {/* Twitch */}
          {creator.links.twitch && (
            <SocialButton
              href={creator.links.twitch}
              label="Twitch"
              colorClass="hover:bg-purple-500/20 hover:border-purple-500/60 hover:text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
            </SocialButton>
          )}

          {/* Instagram */}
          {creator.links.instagram && (
            <SocialButton
              href={creator.links.instagram}
              label="Instagram"
              colorClass="hover:bg-pink-500/20 hover:border-pink-500/60 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </SocialButton>
          )}

          {/* X (Twitter) */}
          {creator.links.twitter && (
            <SocialButton
              href={creator.links.twitter}
              label="X / Twitter"
              colorClass="hover:bg-white/15 hover:border-white/50 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLEEK SOCIAL BUTTON
// ============================================================================
interface SocialButtonProps {
  href: string;
  label: string;
  colorClass: string;
  children: React.ReactNode;
}

function SocialButton({ href, label, colorClass, children }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg bg-white/5 border border-white/15 text-white/70 flex items-center justify-center transition-all duration-200 cursor-pointer ${colorClass}`}
    >
      {children}
    </a>
  );
}
