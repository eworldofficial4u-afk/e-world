"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  creators as initialCreators,
  Creator,
  ROLE_STAR_CREATORS_ID,
  ROLE_CONTENT_CREATOR_ID,
} from "../data/creators";

export default function CreatorGuildSection() {
  const [creatorsList, setCreatorsList] = useState<Creator[]>(initialCreators);
  const [activeCategory, setActiveCategory] = useState<"all" | "Star Creator" | "Content Creator">("all");
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  // Auto-fetch creators dynamically using Discord Role IDs
  useEffect(() => {
    let isMounted = true;

    const fetchRoleCreators = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://e-world-bot-production.up.railway.app";
        const res = await fetch(`${apiUrl}/api/creators`, { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const incoming: Creator[] = Array.isArray(data) ? data : data.creators;

        if (incoming && incoming.length > 0 && isMounted) {
          setCreatorsList((prev) => {
            // Authoritative live sync from Discord roles & presence
            const existingMap = new Map(prev.map((c) => [c.username.toLowerCase(), c]));
            return incoming.map((live) => {
              const existing = existingMap.get(live.username.toLowerCase());
              return {
                ...(existing || {}),
                ...live,
                // Only retain genuinely connected links - zero random or fake placeholders
                links: { ...(live.links || {}) },
                bioLink: live.bioLink || existing?.bioLink,
              };
            });
          });
          setIsLiveSynced(true);
        }
      } catch (err) {
        // Fallback safely to initial curated roster
        console.warn("[Creators Auto-Fetch] Using curated data:", err);
      }
    };

    fetchRoleCreators();
    const interval = setInterval(fetchRoleCreators, 30000); // 30s auto-refresh polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard?.writeText(tag);
    setCopiedHandle(tag);
    setTimeout(() => {
      setCopiedHandle(null);
    }, 2000);
  };

  const starCreators = creatorsList.filter((c) => c.category === "Star Creator");
  const contentCreators = creatorsList.filter((c) => c.category === "Content Creator");

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

          {/* Discord Role Auto-Fetch Telemetry Chip */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 bg-black/60 border border-amber-400/30 rounded-full text-[10px] text-amber-300 font-mono tracking-wider mt-6 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className={`w-2 h-2 rounded-full ${isLiveSynced ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className="font-bold uppercase">
              {isLiveSynced ? "DISCORD ROLE AUTO-SYNC: LIVE" : "DISCORD ROLE SYNC PROTOCOL"}
            </span>
            <span className="text-white/30">|</span>
            <span className="text-amber-400/90 font-mono">
              ★ STAR: <span className="text-white font-bold">{ROLE_STAR_CREATORS_ID}</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="text-cyan-400/90 font-mono">
              ⚡ CREATOR: <span className="text-white font-bold">{ROLE_CONTENT_CREATOR_ID}</span>
            </span>
          </div>

          {/* Discord Profile Connections Sync & /connect tip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <a
              href="https://e-world-bot-production.up.railway.app/api/auth/discord"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 font-mono text-[11px] font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
              title="Authenticate with Discord to auto-sync your connected profile accounts"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>SYNC DISCORD CONNECTIONS</span>
              <span className="text-[9px] opacity-70">↗</span>
            </a>
            <span className="text-[10px] text-white/50 font-mono">
              or use <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">/connect</code> in Discord
            </span>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 p-1.5 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              ALL CREATORS ({creatorsList.length})
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
                    Premier media icons & cinematic storytellers • Role ID: {ROLE_STAR_CREATORS_ID}
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
                    Competitive casters, roleplay leads & community variety streamers • Role ID: {ROLE_CONTENT_CREATOR_ID}
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
                Are you a streamer, YouTuber, or competitive caster? Receive the Star Creator ({ROLE_STAR_CREATORS_ID}) or Content Creator ({ROLE_CONTENT_CREATOR_ID}) role on Discord to automatically appear in the official E-World Creator network.
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
              {creator.avatarUrl ? (
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105 relative bg-zinc-900"
                  style={{
                    boxShadow: `0 0 25px ${creator.avatarGlow}`,
                  }}
                >
                  <Image
                    src={creator.avatarUrl}
                    alt={creator.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-extrabold text-base sm:text-lg text-black shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: creator.avatarGradient,
                    boxShadow: `0 0 25px ${creator.avatarGlow}`,
                  }}
                >
                  {creator.initials}
                </div>
              )}
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
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.specialties.map((spec, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-[10px] rounded-md tracking-wider transition-colors"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Bio Link Connection Badge */}
        {creator.bioLink && (
          <div className="mb-4">
            <a
              href={creator.bioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/80 border border-white/15 hover:border-amber-400/50 text-white/90 hover:text-white text-[11px] font-mono tracking-wider transition-all duration-200 group/bio shadow-sm"
              title={`Direct Profile / Bio Link: ${creator.bioLink}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-bold uppercase text-[10px]">CONNECTED BIO:</span>
              <span className="text-white/70 group-hover/bio:text-white truncate max-w-[170px] sm:max-w-[220px]">
                {creator.bioLink.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
              <span className="text-amber-400 text-xs">↗</span>
            </a>
          </div>
        )}

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

        {/* Social Media Link Buttons - Strictly Connected Links Only (All 21 Discord Connection Types) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Connected Bio Link */}
          {creator.bioLink && (
            <SocialButton
              href={creator.bioLink}
              label={`Creator Bio (${creator.bioLink})`}
              colorClass="hover:bg-amber-500/20 hover:border-amber-500/60 hover:text-amber-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </SocialButton>
          )}

          {/* YouTube */}
          {creator.links.youtube && (
            <SocialButton
              href={creator.links.youtube}
              label="YouTube"
              colorClass="hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
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

          {/* X / Twitter */}
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

          {/* Steam */}
          {creator.links.steam && (
            <SocialButton
              href={creator.links.steam}
              label="Steam"
              colorClass="hover:bg-slate-700/40 hover:border-slate-400/60 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.707L.426 15.02C1.706 20.28 6.388 24 11.98 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM8.366 17.585l-1.921-.795c.29-.441.777-.733 1.332-.733.24 0 .463.056.666.148l-.077 1.38zm7.574-8.675c0-1.654-1.346-3-3-3s-3 1.346-3 3 1.346 3 3 3 3-1.346 3-3zm-5.25 0c0-1.241 1.009-2.25 2.25-2.25s2.25 1.009 2.25 2.25-1.009 2.25-2.25 2.25-2.25-1.009-2.25-2.25z" />
              </svg>
            </SocialButton>
          )}

          {/* Spotify */}
          {creator.links.spotify && (
            <SocialButton
              href={creator.links.spotify}
              label="Spotify"
              colorClass="hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </SocialButton>
          )}

          {/* GitHub */}
          {creator.links.github && (
            <SocialButton
              href={creator.links.github}
              label="GitHub"
              colorClass="hover:bg-slate-800/40 hover:border-slate-300/60 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </SocialButton>
          )}

          {/* Reddit */}
          {creator.links.reddit && (
            <SocialButton
              href={creator.links.reddit}
              label="Reddit"
              colorClass="hover:bg-orange-500/20 hover:border-orange-500/60 hover:text-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </SocialButton>
          )}

          {/* Riot Games */}
          {creator.links.riotgames && (
            <SocialButton
              href={creator.links.riotgames}
              label="Riot Games"
              colorClass="hover:bg-red-600/20 hover:border-red-600/60 hover:text-red-500 hover:shadow-[0_0_15px_rgba(235,0,41,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M13.882 4.156l-8.625 4.027 1.637 8.358 2.05-1.493-.687-3.951 1.255-.584.73 4.218 3.639-2.651zm5.375 7.159l-1.399 7.027-3.766 2.744 1.488-7.478zM1.986 6.353l.794 4.053 2.39-1.115-.794-4.053zm2.593 13.234l-1.782-9.098 2.39-1.115 1.782 9.098z" />
              </svg>
            </SocialButton>
          )}

          {/* Battle.net */}
          {creator.links.battlenet && (
            <SocialButton
              href={creator.links.battlenet}
              label="Battle.net"
              colorClass="hover:bg-sky-500/20 hover:border-sky-500/60 hover:text-sky-400 hover:shadow-[0_0_15px_rgba(0,174,239,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M18.847 8.384l-4.577-2.645-1.854 2.87 3.376 1.95a3.953 3.953 0 0 1-1.332 5.372 3.95 3.95 0 0 1-5.385-1.328l-2.88 1.85a7.37 7.37 0 0 0 10.05 2.476 7.377 7.377 0 0 0 2.602-10.545zM9.73 15.39l-3.376-1.95a3.953 3.953 0 0 1 1.332-5.372 3.95 3.95 0 0 1 5.385 1.328l2.88-1.85A7.37 7.37 0 0 0 5.897 5.07a7.377 7.377 0 0 0-2.602 10.545l4.577 2.645 1.854-2.87z" />
              </svg>
            </SocialButton>
          )}

          {/* Xbox */}
          {creator.links.xbox && (
            <SocialButton
              href={creator.links.xbox}
              label="Xbox"
              colorClass="hover:bg-green-600/20 hover:border-green-600/60 hover:text-green-400 hover:shadow-[0_0_15px_rgba(16,124,16,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M6.02 2.693C8.04.996 10.528 0 12.012 0c1.472 0 3.96 1.008 5.968 2.693 2.197 1.848 3.9 4.38 4.704 6.78-1.14-1.332-2.736-2.544-4.644-3.504-2.124-1.068-4.224-1.632-6.028-1.632-1.8 0-3.9.564-6.024 1.632-1.908.96-3.504 2.172-4.644 3.504.792-2.4 2.496-4.932 4.676-6.78zM.444 14.772c-.288-.936-.444-1.836-.444-2.772 0-2.004.66-3.888 1.764-5.46 1.104 1.488 2.676 3.012 4.488 4.296 2.052 1.452 4.092 2.388 5.748 2.64-1.5.42-3.324.492-5.484.216-2.472-.312-4.524-1.344-6.072-2.92zm23.112 0c-1.548 1.572-3.6 2.604-6.072 2.92-2.16.276-3.984.204-5.484-.216 1.656-.252 3.696-1.188 5.748-2.64 1.812-1.284 3.384-2.808 4.488-4.296 1.104 1.572 1.764 3.456 1.764 5.46 0 .936-.156 1.836-.444 2.772zM12 17.58c-1.896 0-4.056-.408-6.192-1.188.756 1.392 1.956 2.64 3.492 3.6 2.472 1.548 5.064 1.668 5.4 1.668.336 0 2.928-.12 5.4-1.668 1.536-.96 2.736-2.208 3.492-3.6-2.136.78-4.296 1.188-6.192 1.188z" />
              </svg>
            </SocialButton>
          )}

          {/* PlayStation */}
          {creator.links.playstation && (
            <SocialButton
              href={creator.links.playstation}
              label="PlayStation Network"
              colorClass="hover:bg-blue-700/20 hover:border-blue-500/60 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(0,55,145,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M8.077 15.688c-.968.36-1.93.599-2.885.719v-2.905c.875-.125 1.776-.367 2.703-.728.847-.333 1.258-.876 1.258-1.578 0-.82-.58-1.428-1.742-1.782l-2.219-.675V3.816l1.838.643c2.614.912 3.969 2.213 3.969 4.103 0 1.664-.997 3.033-2.922 3.842zm9.953 2.502c-.524-.265-1.234-.407-2.129-.407-1.171 0-2.385.271-3.642.813v2.805c1.199-.444 2.264-.672 3.197-.672.637 0 1.092.102 1.365.305.273.203.41.517.41.94 0 .332-.1.62-.299.865l3.87 1.354c.483-.69.725-1.537.725-2.54 0-1.637-.999-2.793-2.997-3.463z" />
              </svg>
            </SocialButton>
          )}

          {/* Epic Games */}
          {creator.links.epicgames && (
            <SocialButton
              href={creator.links.epicgames}
              label="Epic Games"
              colorClass="hover:bg-zinc-700/40 hover:border-zinc-400/60 hover:text-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M4.542 0A4.542 4.542 0 0 0 0 4.542v14.916A4.542 4.542 0 0 0 4.542 24h14.916A4.542 4.542 0 0 0 24 19.458V4.542A4.542 4.542 0 0 0 19.458 0H4.542zm6.208 4.356h3.407l4.316 7.643-4.316 7.645H10.75l4.316-7.645-4.316-7.643zm-3.212 0h2.384l4.316 7.643-4.316 7.645H7.538l4.316-7.645-4.316-7.643z" />
              </svg>
            </SocialButton>
          )}

          {/* Roblox */}
          {creator.links.roblox && (
            <SocialButton
              href={creator.links.roblox}
              label="Roblox"
              colorClass="hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_15px_rgba(226,35,26,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M5.165 0L0 18.835 18.835 24 24 5.165 5.165 0zm10.79 14.73l-4.524 1.212-1.212-4.524 4.524-1.212 1.212 4.524z" />
              </svg>
            </SocialButton>
          )}

          {/* Bluesky */}
          {creator.links.bluesky && (
            <SocialButton
              href={creator.links.bluesky}
              label="Bluesky"
              colorClass="hover:bg-sky-500/20 hover:border-sky-500/60 hover:text-sky-300 hover:shadow-[0_0_15px_rgba(2,133,255,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1.2 1.8 1.2 3.84c0 3.328 1.8 8.64 4.8 11.04-3.6-1.2-6-3.6-6-7.2 0-3.6 2.4-7.2 6-7.2 3.12 0 5.4 3.84 6 5.52.6-1.68 2.88-5.52 6-5.52 3.6 0 6 3.6 6 7.2 0 3.6-2.4 6-6 7.2 3-2.4 4.8-7.712 4.8-11.04 0-2.04-1.366-2.83-4.002-1.035C16.046 4.747 13.087 8.686 12 10.8z" />
              </svg>
            </SocialButton>
          )}

          {/* PayPal */}
          {creator.links.paypal && (
            <SocialButton
              href={creator.links.paypal}
              label="PayPal"
              colorClass="hover:bg-blue-600/20 hover:border-blue-600/60 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(0,48,135,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.82.903 5.093-.727 4.103-3.21 6.551-7.18 6.551H9.98c-.469 0-.868.341-.941.805l-1.963 7.078zm13.62-13.882C20.61 5.674 19.34 4.5 16.94 4.5h-6.26c-.35 0-.648.256-.703.604L7.54 20.301l-.01.071a.48.48 0 0 0 .473.555h3.454c.35 0 .649-.256.704-.604l.794-5.026c.074-.464.473-.805.942-.805h1.89c2.977 0 4.84-1.836 5.385-4.914.404-2.287.05-3.87-1.47-5.034z" />
              </svg>
            </SocialButton>
          )}

          {/* eBay */}
          {creator.links.ebay && (
            <SocialButton
              href={creator.links.ebay}
              label="eBay"
              colorClass="hover:bg-amber-500/20 hover:border-amber-500/60 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(229,50,56,0.4)]"
            >
              <span className="text-[11px] font-extrabold tracking-tight">ebay</span>
            </SocialButton>
          )}

          {/* Crunchyroll */}
          {creator.links.crunchyroll && (
            <SocialButton
              href={creator.links.crunchyroll}
              label="Crunchyroll"
              colorClass="hover:bg-orange-500/20 hover:border-orange-500/60 hover:text-orange-400 hover:shadow-[0_0_15px_rgba(244,117,33,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M2.99 12a9.01 9.01 0 1 1 18.02 0 9.01 9.01 0 0 1-18.02 0zm14.398 0a5.388 5.388 0 1 0-10.776 0 5.388 5.388 0 0 0 10.776 0z" />
              </svg>
            </SocialButton>
          )}

          {/* Amazon Music */}
          {creator.links.amazonmusic && (
            <SocialButton
              href={creator.links.amazonmusic}
              label="Amazon Music"
              colorClass="hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(37,209,218,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" fill="currentColor" />
                <circle cx="18" cy="16" r="3" fill="currentColor" />
              </svg>
            </SocialButton>
          )}

          {/* Bungie */}
          {creator.links.bungie && (
            <SocialButton
              href={creator.links.bungie}
              label="Bungie.net"
              colorClass="hover:bg-white/15 hover:border-white/50 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v8l8 4 8-4v-8l-8 4z" />
              </svg>
            </SocialButton>
          )}

          {/* Domain / Website (The Exact Globe Icon from the screenshot!) */}
          {(creator.links.domain || creator.links.website) && (
            <SocialButton
              href={creator.links.domain || creator.links.website || "#"}
              label="Website / Domain"
              colorClass="hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </SocialButton>
          )}

          {/* Facebook */}
          {creator.links.facebook && (
            <SocialButton
              href={creator.links.facebook}
              label="Facebook"
              colorClass="hover:bg-blue-600/20 hover:border-blue-600/60 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

          {/* Discord */}
          {creator.links.discord && (
            <SocialButton
              href={creator.links.discord}
              label="Discord"
              colorClass="hover:bg-indigo-500/20 hover:border-indigo-500/60 hover:text-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </SocialButton>
          )}

          {/* Kick */}
          {creator.links.kick && (
            <SocialButton
              href={creator.links.kick}
              label="Kick"
              colorClass="hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(83,252,24,0.4)]"
            >
              <span className="text-[11px] font-black tracking-tight text-emerald-400">K</span>
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
