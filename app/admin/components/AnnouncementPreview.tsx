"use client";

import React from "react";
import { AnnouncementBanner } from "../../community/data/siteConfig";
import { Bell, ArrowRight, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

interface AnnouncementPreviewProps {
  announcement: AnnouncementBanner;
}

export default function AnnouncementPreview({ announcement }: AnnouncementPreviewProps) {
  if (!announcement.enabled) {
    return (
      <div className="p-4 bg-zinc-900/60 border border-white/10 rounded-xl text-center font-mono">
        <span className="text-white/40 text-xs">
          [ANNOUNCEMENT BANNER DISABLED - WILL NOT DISPLAY ON LIVE HUD]
        </span>
      </div>
    );
  }

  const getTypeStyle = () => {
    switch (announcement.type) {
      case "urgent":
        return {
          border: "border-rose-500/40",
          bg: "bg-rose-950/40",
          text: "text-rose-300",
          badgeBg: "bg-rose-500/20 text-rose-400 border-rose-500/40",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case "event":
        return {
          border: "border-amber-500/40",
          bg: "bg-amber-950/40",
          text: "text-amber-200",
          badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "maintenance":
        return {
          border: "border-yellow-500/40",
          bg: "bg-yellow-950/40",
          text: "text-yellow-200",
          badgeBg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
          icon: <Bell className="w-3.5 h-3.5 text-yellow-400" />,
        };
      default:
        return {
          border: "border-cyan-500/40",
          bg: "bg-cyan-950/40",
          text: "text-cyan-200",
          badgeBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />,
        };
    }
  };

  const style = getTypeStyle();

  return (
    <div
      className={`w-full p-3 sm:p-4 rounded-xl border backdrop-blur-md font-mono transition-all ${style.bg} ${style.border} ${style.text}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="shrink-0">{style.icon}</span>
          <span
            className={`text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${style.badgeBg}`}
          >
            {announcement.badgeText || "BROADCAST"}
          </span>
          <p className="text-xs font-sans text-white/90 leading-relaxed font-medium">
            {announcement.message || "Enter announcement message in the form below..."}
          </p>
        </div>

        {announcement.actionText && (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-[11px] font-bold text-white tracking-wider uppercase">
              {announcement.actionText} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
