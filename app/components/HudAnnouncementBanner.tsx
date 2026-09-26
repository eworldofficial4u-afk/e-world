"use client";

import React, { useState } from "react";
import { AnnouncementBanner } from "../community/data/siteConfig";
import { Sparkles, AlertTriangle, Bell, CheckCircle2, ArrowRight, X } from "lucide-react";

interface HudAnnouncementBannerProps {
  announcement: AnnouncementBanner;
}

export default function HudAnnouncementBanner({ announcement }: HudAnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || dismissed) return null;

  const getTypeStyle = () => {
    switch (announcement.type) {
      case "urgent":
        return {
          barBg: "bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
          badge: "bg-rose-500/20 text-rose-400 border-rose-500/40",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />,
        };
      case "event":
        return {
          barBg: "bg-amber-950/80 border-amber-500/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />,
        };
      case "maintenance":
        return {
          barBg: "bg-yellow-950/80 border-yellow-500/40 text-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.2)]",
          badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
          icon: <Bell className="w-3.5 h-3.5 text-yellow-400 shrink-0" />,
        };
      default:
        return {
          barBg: "bg-cyan-950/80 border-cyan-500/40 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]",
          badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
        };
    }
  };

  const style = getTypeStyle();

  return (
    <aside
      aria-label="System Announcement"
      className="pointer-events-auto relative w-full z-40 px-4 py-1.5 sm:py-2 transition-all font-mono"
    >
      <div
        className={`max-w-4xl mx-auto px-3.5 py-1.5 rounded-full border backdrop-blur-xl flex items-center justify-between gap-3 text-xs ${style.barBg}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {style.icon}
          <span
            className={`text-[9px] tracking-widest font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}
          >
            {announcement.badgeText || "BROADCAST"}
          </span>
          <p className="text-[11px] sm:text-xs text-white/90 truncate font-sans">
            {announcement.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {announcement.actionText && announcement.actionUrl && (
            <a
              href={announcement.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-white tracking-wider uppercase transition-colors"
            >
              <span>{announcement.actionText}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </a>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss Announcement"
            className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
