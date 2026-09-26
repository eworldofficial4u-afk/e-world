"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Creator } from "../../community/data/creators";
import { ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

interface CreatorCardPreviewProps {
  creator: Creator;
}

export default function CreatorCardPreview({ creator }: CreatorCardPreviewProps) {
  const [imgError, setImgError] = useState(false);
  const isStarCreator = creator.category === "Star Creator";
  const links = creator.links || {};

  return (
    <div className="relative w-full max-w-md mx-auto font-mono select-none">
      {/* Glow aura */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-40 blur-xl transition-all duration-500"
        style={{ background: creator.avatarGlow || "rgba(6, 182, 212, 0.45)" }}
      />

      <div className="relative bg-zinc-950/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Subtle top indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: isStarCreator ? "#f59e0b" : "#06b6d4",
              }}
            />
            <span
              className="text-[10px] tracking-widest font-bold uppercase"
              style={{ color: isStarCreator ? "#f59e0b" : "#06b6d4" }}
            >
              // {creator.category}
            </span>
          </div>
          {creator.verified && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="w-3 h-3" /> VERIFIED
            </span>
          )}
        </div>

        {/* Avatar and Basic Identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
            {creator.avatarUrl && !imgError ? (
              <Image
                src={creator.avatarUrl}
                alt={creator.name}
                fill
                sizes="64px"
                className="object-cover"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-extrabold text-lg"
                style={{ background: creator.avatarGradient || "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
              >
                {creator.initials || creator.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-display font-black text-lg tracking-wide truncate">
                {creator.name || "UNNAMED CREATOR"}
              </h3>
              {isStarCreator && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            </div>
            <p className="text-white/40 text-xs truncate">{creator.tag || `@${creator.username}`}</p>
            <p className="text-white/60 text-[11px] truncate mt-0.5 font-sans">
              {creator.role || "E-World Creator"}
            </p>
          </div>
        </div>

        {/* Featured Quote / Bio */}
        {creator.featuredQuote && (
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70 italic mb-4 font-sans leading-relaxed">
            &ldquo;{creator.featuredQuote}&rdquo;
          </div>
        )}

        {/* Specialties / Tags */}
        {Array.isArray(creator.specialties) && creator.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {creator.specialties.map((spec, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70 font-mono"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Active Connected Social Links */}
        <div className="pt-3 border-t border-white/10">
          <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-2 font-bold">
            CONNECTED MEDIA CHANNELS:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* YouTube */}
            {links.youtube && (
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-500/30 hover:border-red-400 text-red-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-red-400 shrink-0">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Twitch */}
            {links.twitch && (
              <a
                href={links.twitch}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-purple-950/20 border border-purple-500/30 hover:border-purple-400 text-purple-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-purple-400 shrink-0">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                  Twitch
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Twitter */}
            {links.twitter && (
              <a
                href={links.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-sky-950/20 border border-sky-500/30 hover:border-sky-400 text-sky-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-sky-400 shrink-0">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter/X
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Instagram */}
            {links.instagram && (
              <a
                href={links.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-pink-950/20 border border-pink-500/30 hover:border-pink-400 text-pink-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-pink-400 shrink-0">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Kick */}
            {links.kick && (
              <a
                href={links.kick}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Kick
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Spotify */}
            {links.spotify && (
              <a
                href={links.spotify}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-emerald-400 shrink-0">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Spotify
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Steam */}
            {links.steam && (
              <a
                href={links.steam}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-blue-950/20 border border-blue-500/30 hover:border-blue-400 text-blue-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-blue-400 shrink-0">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                  </svg>
                  Steam
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* GitHub */}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-600/30 hover:border-zinc-400 text-zinc-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-zinc-400 shrink-0">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {/* Website / Bio */}
            {(links.website || (links as any).bio || creator.bioLink) && (
              <a
                href={links.website || (links as any).bio || creator.bioLink}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 flex items-center justify-between p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Website / Bio Link
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>

          {/* Fallback if no links configured */}
          {Object.keys(links).filter((k) => k !== "bio").length === 0 && (
            <p className="text-[11px] text-white/30 italic text-center py-2">
              No social links configured yet for this creator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
