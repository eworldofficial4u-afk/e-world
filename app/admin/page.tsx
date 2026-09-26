"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  creators as initialCreators,
  Creator,
  CreatorSocials,
  ROLE_STAR_CREATORS_ID,
  ROLE_CONTENT_CREATOR_ID,
} from "../community/data/creators";
import {
  defaultSiteConfig,
  SiteConfig,
  RealmConfig,
  TournamentConfig,
} from "../community/data/siteConfig";
import AdminAuthModal from "./components/AdminAuthModal";
import CreatorCardPreview from "./components/CreatorCardPreview";
import AnnouncementPreview from "./components/AnnouncementPreview";
import LinkManagerTab from "./components/LinkManagerTab";
import {
  Shield,
  LogOut,
  Globe,
  Users,
  Server,
  Radio,
  Save,
  Download,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  Lock,
  Layers,
  RefreshCw,
  Sliders,
  Send,
  Link2,
} from "lucide-react";

const PLATFORMS_CONFIG: Array<{
  id: keyof CreatorSocials;
  label: string;
  prefix: string;
  placeholder: string;
  color: string;
}> = [
  { id: "youtube", label: "YouTube", prefix: "https://youtube.com/@", placeholder: "@username or channel URL", color: "#ef4444" },
  { id: "twitch", label: "Twitch", prefix: "https://twitch.tv/", placeholder: "username", color: "#a855f7" },
  { id: "twitter", label: "Twitter / X", prefix: "https://x.com/", placeholder: "@handle or username", color: "#38bdf8" },
  { id: "instagram", label: "Instagram", prefix: "https://instagram.com/", placeholder: "username", color: "#ec4899" },
  { id: "discord", label: "Discord Invite / Profile", prefix: "https://discord.gg/", placeholder: "invite-code or profile URL", color: "#6366f1" },
  { id: "kick", label: "Kick", prefix: "https://kick.com/", placeholder: "username", color: "#10b981" },
  { id: "spotify", label: "Spotify Artist/User", prefix: "https://open.spotify.com/user/", placeholder: "user ID or playlist URL", color: "#22c55e" },
  { id: "steam", label: "Steam Profile", prefix: "https://steamcommunity.com/id/", placeholder: "custom URL or ID", color: "#3b82f6" },
  { id: "github", label: "GitHub", prefix: "https://github.com/", placeholder: "username", color: "#9ca3af" },
  { id: "reddit", label: "Reddit", prefix: "https://reddit.com/u/", placeholder: "u/username", color: "#f97316" },
  { id: "bluesky", label: "Bluesky", prefix: "https://bsky.app/profile/", placeholder: "handle.bsky.social", color: "#0284c7" },
  { id: "roblox", label: "Roblox", prefix: "https://roblox.com/users/", placeholder: "userId/profile", color: "#ef4444" },
  { id: "epicgames", label: "Epic Games", prefix: "", placeholder: "Epic Display Name", color: "#ffffff" },
  { id: "playstation", label: "PlayStation Network", prefix: "", placeholder: "PSN Online ID", color: "#3b82f6" },
  { id: "xbox", label: "Xbox Live", prefix: "", placeholder: "Xbox Gamertag", color: "#22c55e" },
  { id: "battlenet", label: "Battle.net", prefix: "", placeholder: "Battletag#0000", color: "#0284c7" },
  { id: "riotgames", label: "Riot Games", prefix: "", placeholder: "RiotID#TAG", color: "#f43f5e" },
  { id: "paypal", label: "PayPal.me", prefix: "https://paypal.me/", placeholder: "username", color: "#0284c7" },
  { id: "website", label: "Personal Website / Linktree", prefix: "https://", placeholder: "https://example.com", color: "#06b6d4" },
];

// Broadcast changes across tabs and within the current page
const broadcastAdminUpdate = (type: "SITE_CONFIG_UPDATED" | "CREATORS_UPDATED", payload: any) => {
  if (typeof window === "undefined") return;
  if (type === "SITE_CONFIG_UPDATED") {
    window.dispatchEvent(new CustomEvent("eworld:siteconfig-updated", { detail: payload }));
  } else if (type === "CREATORS_UPDATED") {
    window.dispatchEvent(new CustomEvent("eworld:creators-updated", { detail: payload }));
  }
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("eworld_admin_channel");
      channel.postMessage({ type, payload });
      channel.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel error:", err);
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("eworld2026");
  const [activeTab, setActiveTab] = useState<"overview" | "website" | "creators" | "links" | "realms" | "sync">("overview");

  // State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(initialCreators);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(initialCreators[0]?.id || "");
  const [creatorSearch, setCreatorSearch] = useState<string>("");
  const [creatorFilterCategory, setCreatorFilterCategory] = useState<"all" | "Star Creator" | "Content Creator">("all");

  // Telemetry & Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("ALL EDITS SYNCED LIVE");
  const isInitialLoaded = React.useRef(false);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: Check Auth & LocalStorage
  useEffect(() => {
    const isAuth = sessionStorage.getItem("eworld_admin_auth") === "true";
    if (isAuth) setIsAuthenticated(true);

    const savedKey = localStorage.getItem("eworld_admin_passcode");
    if (savedKey) setPasscode(savedKey);

    const savedConfig = localStorage.getItem("eworld_site_config");
    if (savedConfig) {
      try {
        setSiteConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse local site config", e);
      }
    }

    const savedCreators = localStorage.getItem("eworld_creators_list");
    if (savedCreators) {
      try {
        setCreatorsList(JSON.parse(savedCreators));
      } catch (e) {
        console.error("Failed to parse local creators list", e);
      }
    }

    // Try pinging WebSocket / REST server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://e-world-bot-production.up.railway.app";
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (res.ok) setApiConnected(true);
      })
      .catch(() => setApiConnected(false));

    // Enable auto-save after initial state is populated
    setTimeout(() => {
      isInitialLoaded.current = true;
    }, 150);
  }, []);

  // 2. Real-Time Auto-Save for Site Config
  useEffect(() => {
    if (!isInitialLoaded.current) return;
    setAutoSaveStatus("SAVING CHANGES...");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("eworld_site_config", JSON.stringify(siteConfig));
        broadcastAdminUpdate("SITE_CONFIG_UPDATED", siteConfig);
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setAutoSaveStatus(`AUTO-SAVED LIVE (${timeStr})`);
      } catch (err) {
        console.error("Auto-save siteConfig error:", err);
        setAutoSaveStatus("AUTO-SAVE ERROR");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [siteConfig]);

  // 3. Real-Time Auto-Save for Creators List
  useEffect(() => {
    if (!isInitialLoaded.current) return;
    setAutoSaveStatus("SAVING CHANGES...");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("eworld_creators_list", JSON.stringify(creatorsList));
        broadcastAdminUpdate("CREATORS_UPDATED", creatorsList);
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setAutoSaveStatus(`AUTO-SAVED LIVE (${timeStr})`);
      } catch (err) {
        console.error("Auto-save creatorsList error:", err);
        setAutoSaveStatus("AUTO-SAVE ERROR");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [creatorsList]);

  const handleLogout = () => {
    sessionStorage.removeItem("eworld_admin_auth");
    setIsAuthenticated(false);
  };

  const selectedCreator = creatorsList.find((c) => c.id === selectedCreatorId) || creatorsList[0];

  // Helper to format/normalize URLs for creator socials
  const formatSocialUrl = (platformId: keyof CreatorSocials, value: string): string => {
    const val = value.trim();
    if (!val) return "";
    if (val.startsWith("http://") || val.startsWith("https://")) return val;

    const conf = PLATFORMS_CONFIG.find((p) => p.id === platformId);
    if (!conf || !conf.prefix) return val;

    // Remove leading @ or /
    const clean = val.replace(/^[@/]+/, "");
    return `${conf.prefix}${clean}`;
  };

  const handleUpdateCreatorField = (field: keyof Creator, value: any) => {
    if (!selectedCreator) return;
    setCreatorsList((prev) =>
      prev.map((c) => (c.id === selectedCreator.id ? { ...c, [field]: value } : c))
    );
  };

  const handleUpdateSocialLink = (platform: keyof CreatorSocials, rawValue: string) => {
    if (!selectedCreator) return;
    const formatted = formatSocialUrl(platform, rawValue);
    setCreatorsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCreator.id) return c;
        const newLinks: CreatorSocials = { ...c.links };
        if (!formatted) {
          delete newLinks[platform];
        } else {
          newLinks[platform] = formatted;
        }
        return { ...c, links: newLinks };
      })
    );
  };

  // Dedicated helper to remove a single link key or bioLink
  const handleRemoveCreatorLink = (platformKey: string, isBioLink: boolean = false) => {
    if (!selectedCreator) return;
    setCreatorsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCreator.id) return c;
        if (isBioLink) {
          const { bioLink, ...rest } = c;
          return { ...rest, bioLink: "" };
        }
        const newLinks: CreatorSocials = { ...c.links };
        delete newLinks[platformKey as keyof CreatorSocials];
        return { ...c, links: newLinks };
      })
    );
    showToast(`Removed link "${platformKey}" from ${selectedCreator.name}!`);
  };

  // Dedicated helper to remove all links for the selected creator
  const handleClearAllCreatorLinks = () => {
    if (!selectedCreator) return;
    setCreatorsList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCreator.id) return c;
        return { ...c, links: {}, bioLink: "" };
      })
    );
    showToast(`Cleared all social and bio links for ${selectedCreator.name}!`);
  };

  const handleAddNewCreator = () => {
    const newId = `creator_${Date.now()}`;
    const newCreator: Creator = {
      id: newId,
      name: "New Creator",
      username: `creator_${creatorsList.length + 1}`,
      tag: `@creator_${creatorsList.length + 1}`,
      category: "Content Creator",
      badge: "Content Creator",
      avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #2563eb 100%)",
      avatarGlow: "rgba(6, 182, 212, 0.45)",
      initials: "NEW",
      role: "E-World Content Creator",
      subscribers: "Discord Role Verified",
      platform: "YouTube & Twitch",
      specialties: ["Gaming", "Live Streaming"],
      featuredQuote: "Broadcasting adventures across E-World.",
      verified: true,
      discordRoleId: ROLE_CONTENT_CREATOR_ID,
      links: {},
    };
    setCreatorsList([newCreator, ...creatorsList]);
    setSelectedCreatorId(newId);
    showToast("Added new creator draft profile!");
  };

  const handleDeleteCreator = (id: string) => {
    if (creatorsList.length <= 1) {
      showToast("Cannot delete the only creator in the list.", "error");
      return;
    }
    const filtered = creatorsList.filter((c) => c.id !== id);
    setCreatorsList(filtered);
    setSelectedCreatorId(filtered[0]?.id || "");
    try {
      const existing = JSON.parse(localStorage.getItem("eworld_creators_deleted") || "[]");
      if (!existing.includes(id)) {
        existing.push(id);
        localStorage.setItem("eworld_creators_deleted", JSON.stringify(existing));
      }
    } catch (_) {}
    showToast("Creator removed from directory.");
  };

  // Save to LocalStorage
  const handleSaveLocally = () => {
    try {
      localStorage.setItem("eworld_site_config", JSON.stringify(siteConfig));
      localStorage.setItem("eworld_creators_list", JSON.stringify(creatorsList));
      localStorage.setItem("eworld_admin_passcode", passcode);

      broadcastAdminUpdate("SITE_CONFIG_UPDATED", siteConfig);
      broadcastAdminUpdate("CREATORS_UPDATED", creatorsList);

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setAutoSaveStatus(`FORCE-SAVED LIVE (${timeStr})`);
      showToast("All website details and creator links saved and propagated live!");
    } catch (e: any) {
      showToast(`Save error: ${e.message}`, "error");
    }
  };

  // Sync to Backend Server
  const handleSyncWithBackend = async () => {
    setIsSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://e-world-bot-production.up.railway.app";
    try {
      // 1. Sync site config
      const resConfig = await fetch(`${apiUrl}/api/site-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig),
      });

      // 2. Sync creators
      const resCreators = await fetch(`${apiUrl}/api/creators/batch-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creators: creatorsList }),
      });

      // Also persist locally
      handleSaveLocally();

      if (resConfig.ok || resCreators.ok) {
        showToast("Successfully synchronized with Live E-World Backend Server!");
        setApiConnected(true);
      } else {
        showToast("Backend returned non-200. Saved locally to browser.", "info");
      }
    } catch (err: any) {
      handleSaveLocally();
      showToast("Backend server offline. Saved changes locally in browser.", "info");
    } finally {
      setIsSaving(false);
    }
  };

  // Export clean TypeScript creators.ts file
  const handleDownloadCreatorsTS = () => {
    const tsCode = `export type CreatorCategory = "Star Creator" | "Content Creator";

export interface CreatorSocials {
  youtube?: string;
  twitch?: string;
  twitter?: string;
  steam?: string;
  spotify?: string;
  github?: string;
  reddit?: string;
  riotgames?: string;
  battlenet?: string;
  xbox?: string;
  playstation?: string;
  epicgames?: string;
  roblox?: string;
  bluesky?: string;
  paypal?: string;
  ebay?: string;
  crunchyroll?: string;
  amazonmusic?: string;
  bungie?: string;
  facebook?: string;
  domain?: string;
  website?: string;
  instagram?: string;
  discord?: string;
  kick?: string;
  bio?: string;
}

export const ROLE_STAR_CREATORS_ID = "${ROLE_STAR_CREATORS_ID}";
export const ROLE_CONTENT_CREATOR_ID = "${ROLE_CONTENT_CREATOR_ID}";

export interface Creator {
  id: string;
  name: string;
  username: string;
  tag: string;
  category: CreatorCategory;
  badge: string;
  avatarGradient: string;
  avatarGlow: string;
  avatarUrl?: string;
  initials: string;
  role: string;
  subscribers: string;
  platform: string;
  specialties: string[];
  featuredQuote: string;
  verified: boolean;
  discordRoleId?: string;
  bioLink?: string;
  bio?: string;
  memberSince?: string;
  links: CreatorSocials;
}

export const creators: Creator[] = ${JSON.stringify(creatorsList, null, 2)};
`;

    const blob = new Blob([tsCode], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creators.ts";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded creators.ts file!");
  };

  // Download siteConfig.json
  const handleDownloadConfigJSON = () => {
    const blob = new Blob([JSON.stringify(siteConfig, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteConfig.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded siteConfig.json file!");
  };

  // Filtered Creators list
  const filteredCreators = creatorsList.filter((c) => {
    const matchesCategory = creatorFilterCategory === "all" || c.category === creatorFilterCategory;
    const q = creatorSearch.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <AdminAuthModal
        savedPasscode={passcode}
        onAuthenticated={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-cyan-500 selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-radial from-cyan-950/15 via-black to-black pointer-events-none z-0" />
      <div className="fixed inset-0 bg-noise opacity-15 pointer-events-none z-0" />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all font-mono text-xs ${
            toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500 text-rose-200"
              : toastMessage.type === "info"
              ? "bg-amber-950/90 border-amber-500 text-amber-200"
              : "bg-emerald-950/90 border-emerald-500 text-emerald-200"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 border-b border-white/10 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-cyan-400 shadow-[0_0_10px_#38bdf8] rotate-45" />
            <span className="font-display font-black text-sm tracking-[0.2em] uppercase text-white group-hover:text-cyan-300">
              E-WORLD // ADMIN MATRIX
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{apiConnected ? "BACKEND API: LIVE" : "LOCAL STORAGE MODE"}</span>
          </div>

          {/* Live Auto-Save Real-Time Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] sm:text-xs font-mono text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">{autoSaveStatus}</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSaveLocally}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            title="Force immediate save and propagate across all tabs"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">SAVE NOW</span>
          </button>

          <button
            onClick={handleSyncWithBackend}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black tracking-wider uppercase rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? "SYNCING..." : "SYNC SERVER"}</span>
          </button>

          <Link
            href="/community"
            target="_blank"
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">COMMUNITY</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Lock Admin Matrix"
            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 rounded-lg text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/10 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-4 h-4" /> SYSTEM OVERVIEW
          </button>

          <button
            onClick={() => setActiveTab("website")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "website"
                ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Globe className="w-4 h-4" /> WEBSITE & BROADCAST
          </button>

          <button
            onClick={() => setActiveTab("creators")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "creators"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" /> CREATORS & SOCIAL LINKS ({creatorsList.length})
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "links"
                ? "bg-rose-500/20 border border-rose-400/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Link2 className="w-4 h-4 text-rose-400" /> LINK CLEANER & AUDIT
          </button>

          <button
            onClick={() => setActiveTab("realms")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "realms"
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Server className="w-4 h-4" /> GAME REALMS (SMP / RP)
          </button>

          <button
            onClick={() => setActiveTab("sync")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sync"
                ? "bg-purple-500/20 border border-purple-400/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Download className="w-4 h-4" /> EXPORT & SYNC
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SYSTEM OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
                <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
                  TOTAL CREATORS REGISTERED
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-amber-400">
                    {creatorsList.length}
                  </span>
                  <span className="text-xs text-white/50">
                    ({creatorsList.filter((c) => c.category === "Star Creator").length} Stars)
                  </span>
                </div>
              </div>

              <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
                <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
                  SMP SERVER STATUS
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      siteConfig.realms.smp.status === "ONLINE"
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="text-lg font-bold text-white uppercase">
                    {siteConfig.realms.smp.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 font-sans mt-1">
                  IP: {siteConfig.realms.smp.serverIp}
                </p>
              </div>

              <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
                <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
                  FIVEM RP DIRECT CONNECT
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-lg font-bold text-white uppercase">
                    {siteConfig.realms.rp.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 font-sans mt-1">
                  Link: {siteConfig.realms.rp.directJoinUrl}
                </p>
              </div>

              <div className="p-5 bg-zinc-950/80 border border-white/10 rounded-2xl">
                <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
                  ACTIVE TOURNAMENT
                </span>
                <div className="text-base font-bold text-white truncate">
                  {siteConfig.tournament.title}
                </div>
                <p className="text-xs text-amber-400 font-sans mt-1 font-bold">
                  Prize: {siteConfig.tournament.prizePool}
                </p>
              </div>
            </div>

            {/* Live Announcement Banner Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-widest text-white/60 uppercase font-bold flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" /> LIVE HUD BROADCAST BANNER PREVIEW
                </span>
                <button
                  onClick={() => setActiveTab("website")}
                  className="text-xs text-cyan-400 hover:underline uppercase"
                >
                  Edit Banner Settings →
                </button>
              </div>
              <AnnouncementPreview announcement={siteConfig.announcement} />
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 bg-zinc-950/90 border border-white/10 rounded-2xl space-y-4">
              <h2 className="text-sm tracking-widest text-white uppercase font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> MISSION CONTROL SHORTCUTS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("creators")}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all cursor-pointer group"
                >
                  <span className="text-amber-400 font-bold text-xs group-hover:text-amber-300">
                    MANAGE CREATOR SOCIAL LINKS →
                  </span>
                  <p className="text-xs text-white/50 font-sans">
                    Configure YouTube, Twitch, Twitter, Kick, Discord, and 20+ platform URLs.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("links")}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all cursor-pointer group"
                >
                  <span className="text-rose-400 font-bold text-xs group-hover:text-rose-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> REMOVE OLD & UNWANTED LINKS →
                  </span>
                  <p className="text-xs text-white/50 font-sans">
                    Audit and purge obsolete URLs, expired invites, or legacy link keys across the site.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("website")}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all cursor-pointer group"
                >
                  <span className="text-cyan-400 font-bold text-xs group-hover:text-cyan-300">
                    EDIT WEBSITE DETAILS & BANNER →
                  </span>
                  <p className="text-xs text-white/50 font-sans">
                    Update branding, announcement ticker, Discord invite, and official socials.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("realms")}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left space-y-1 transition-all cursor-pointer group"
                >
                  <span className="text-emerald-400 font-bold text-xs group-hover:text-emerald-300">
                    UPDATE REALM SERVERS (SMP / RP) →
                  </span>
                  <p className="text-xs text-white/50 font-sans">
                    Change Minecraft server IP, FiveM direct join code, and tournament brackets.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEBSITE DETAILS & BROADCAST */}
        {/* ========================================================================= */}
        {activeTab === "website" && (
          <div className="space-y-8">
            {/* Live Banner Preview */}
            <div className="space-y-2">
              <span className="text-xs tracking-widest text-white/60 uppercase font-bold">
                LIVE HUD BANNER PREVIEW:
              </span>
              <AnnouncementPreview announcement={siteConfig.announcement} />
            </div>

            {/* Announcement Banner Form */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" /> ANNOUNCEMENT BANNER & HUD BROADCAST
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteConfig.announcement.enabled}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: { ...siteConfig.announcement, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white uppercase">ENABLE BANNER</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    BANNER TYPE / SEVERITY
                  </label>
                  <select
                    value={siteConfig.announcement.type}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: {
                          ...siteConfig.announcement,
                          type: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="info">Info / General (Cyan)</option>
                    <option value="event">Special Event / Drops (Amber)</option>
                    <option value="urgent">Urgent Alert (Crimson)</option>
                    <option value="maintenance">Maintenance Notice (Yellow)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    BADGE TAG TEXT
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcement.badgeText}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: { ...siteConfig.announcement, badgeText: e.target.value },
                      })
                    }
                    placeholder="e.g. PROTOCOL ALERT"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    ACTION BUTTON TEXT (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcement.actionText || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: { ...siteConfig.announcement, actionText: e.target.value },
                      })
                    }
                    placeholder="e.g. JOIN DISCORD"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    BROADCAST MESSAGE
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcement.message}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: { ...siteConfig.announcement, message: e.target.value },
                      })
                    }
                    placeholder="Enter broadcast message here..."
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    ACTION DESTINATION URL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcement.actionUrl || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcement: { ...siteConfig.announcement, actionUrl: e.target.value },
                      })
                    }
                    placeholder="https://discord.gg/ewld"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* General Site Branding Form */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Globe className="w-4 h-4 text-cyan-400" /> SITE IDENTITY & BRAND METADATA
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    BRAND NAME
                  </label>
                  <input
                    type="text"
                    value={siteConfig.identity.siteName}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        identity: { ...siteConfig.identity, siteName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    TAGLINE
                  </label>
                  <input
                    type="text"
                    value={siteConfig.identity.brandTagline}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        identity: { ...siteConfig.identity, brandTagline: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    META TITLE
                  </label>
                  <input
                    type="text"
                    value={siteConfig.identity.metaTitle}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        identity: { ...siteConfig.identity, metaTitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    DISCORD GUILD ID
                  </label>
                  <input
                    type="text"
                    value={siteConfig.identity.discordGuildId}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        identity: { ...siteConfig.identity, discordGuildId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    MISSION STATEMENT / DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfig.identity.missionStatement}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        identity: { ...siteConfig.identity, missionStatement: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Official Community Social Channels */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <ExternalLink className="w-4 h-4 text-cyan-400" /> OFFICIAL E-WORLD COMMUNITY CHANNELS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      PRIMARY DISCORD INVITE
                    </label>
                    {siteConfig.socials.discord && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, discord: "" },
                          });
                          showToast("Removed Discord invite from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Discord Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.discord}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, discord: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      OFFICIAL YOUTUBE
                    </label>
                    {siteConfig.socials.youtube && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, youtube: "" },
                          });
                          showToast("Removed YouTube from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove YouTube Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.youtube || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, youtube: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      OFFICIAL TWITTER / X
                    </label>
                    {siteConfig.socials.twitter && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, twitter: "" },
                          });
                          showToast("Removed Twitter/X from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Twitter Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.twitter || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, twitter: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      OFFICIAL TWITCH
                    </label>
                    {siteConfig.socials.twitch && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, twitch: "" },
                          });
                          showToast("Removed Twitch from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Twitch Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.twitch || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, twitch: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      OFFICIAL INSTAGRAM
                    </label>
                    {siteConfig.socials.instagram && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, instagram: "" },
                          });
                          showToast("Removed Instagram from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Instagram Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.instagram || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] tracking-widest text-white/50 uppercase">
                      STORE / MERCH LINK
                    </label>
                    {siteConfig.socials.store && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig({
                            ...siteConfig,
                            socials: { ...siteConfig.socials, store: "" },
                          });
                          showToast("Removed Store link from official channels!");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Store Link"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={siteConfig.socials.store || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        socials: { ...siteConfig.socials, store: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CREATORS & SOCIAL LINKS COMMAND */}
        {/* ========================================================================= */}
        {activeTab === "creators" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Creator Directory Selector (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Creator Search & Actions */}
              <div className="p-4 bg-zinc-950/90 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    CREATORS DIRECTORY ({filteredCreators.length})
                  </span>
                  <button
                    onClick={handleAddNewCreator}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD CREATOR
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={creatorSearch}
                    onChange={(e) => setCreatorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCreatorFilterCategory("all")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      creatorFilterCategory === "all"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setCreatorFilterCategory("Star Creator")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      creatorFilterCategory === "Star Creator"
                        ? "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    STARS
                  </button>
                  <button
                    onClick={() => setCreatorFilterCategory("Content Creator")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      creatorFilterCategory === "Content Creator"
                        ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    CONTENT
                  </button>
                </div>
              </div>

              {/* Scrollable Creator List */}
              <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
                {filteredCreators.map((creator) => {
                  const isSelected = creator.id === selectedCreator?.id;
                  const linkCount = Object.keys(creator.links || {}).filter(
                    (k) => k !== "bio" && Boolean(creator.links[k as keyof CreatorSocials])
                  ).length;

                  return (
                    <div
                      key={creator.id}
                      onClick={() => setSelectedCreatorId(creator.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                          : "bg-zinc-950/70 border-white/10 hover:border-white/30 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white border border-white/20 overflow-hidden"
                          style={{ background: creator.avatarGradient }}
                        >
                          {creator.initials || creator.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">
                              {creator.name}
                            </span>
                            {creator.category === "Star Creator" && (
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-white/40 block truncate">
                            {creator.tag || `@${creator.username}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            creator.category === "Star Creator"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                              : "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
                          }`}
                        >
                          {linkCount} Links
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Creator Card Live Preview Widget */}
              {selectedCreator && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-[10px] tracking-widest text-white/40 uppercase font-bold block mb-3">
                    LIVE CARD PREVIEW:
                  </span>
                  <CreatorCardPreview creator={selectedCreator} />
                </div>
              )}
            </div>

            {/* Right Column: Detailed Creator Profile & Social Links Editor (8 cols) */}
            {selectedCreator ? (
              <div className="lg:col-span-8 space-y-6">
                {/* Creator Header Actions */}
                <div className="p-6 bg-zinc-950/90 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] text-amber-400 uppercase font-bold">
                      // EDITING CREATOR TELEMETRY
                    </span>
                    <h2 className="text-xl font-display font-extrabold text-white uppercase mt-0.5">
                      {selectedCreator.name}
                    </h2>
                    <p className="text-xs text-white/50">{selectedCreator.tag}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCreator(selectedCreator.id)}
                      className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> DELETE
                    </button>
                    <button
                      onClick={handleSaveLocally}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> SAVE PROFILE
                    </button>
                  </div>
                </div>

                {/* Primary Profile Details */}
                <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                    <Users className="w-4 h-4 text-amber-400" /> CREATOR IDENTITY & BADGES
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        DISPLAY NAME
                      </label>
                      <input
                        type="text"
                        value={selectedCreator.name}
                        onChange={(e) => handleUpdateCreatorField("name", e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        USERNAME (DISCORD/SYSTEM)
                      </label>
                      <input
                        type="text"
                        value={selectedCreator.username}
                        onChange={(e) => {
                          handleUpdateCreatorField("username", e.target.value);
                          handleUpdateCreatorField("tag", `@${e.target.value}`);
                        }}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        CATEGORY ROLE
                      </label>
                      <select
                        value={selectedCreator.category}
                        onChange={(e) => {
                          const cat = e.target.value as "Star Creator" | "Content Creator";
                          handleUpdateCreatorField("category", cat);
                          handleUpdateCreatorField("badge", cat);
                          handleUpdateCreatorField(
                            "discordRoleId",
                            cat === "Star Creator"
                              ? ROLE_STAR_CREATORS_ID
                              : ROLE_CONTENT_CREATOR_ID
                          );
                        }}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Star Creator">Star Creator (Gold Badge)</option>
                        <option value="Content Creator">Content Creator (Cyan Badge)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        ROLE TITLE
                      </label>
                      <input
                        type="text"
                        value={selectedCreator.role}
                        onChange={(e) => handleUpdateCreatorField("role", e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        AVATAR IMAGE URL (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={selectedCreator.avatarUrl || ""}
                        onChange={(e) => handleUpdateCreatorField("avatarUrl", e.target.value)}
                        placeholder="https://cdn.discordapp.com/avatars/..."
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        INITIALS / BADGE TEXT
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={selectedCreator.initials}
                        onChange={(e) => handleUpdateCreatorField("initials", e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        FEATURED QUOTE / BIO
                      </label>
                      <input
                        type="text"
                        value={selectedCreator.featuredQuote || ""}
                        onChange={(e) => handleUpdateCreatorField("featuredQuote", e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                        VERIFICATION BADGE
                      </label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCreator.verified}
                          onChange={(e) => handleUpdateCreatorField("verified", e.target.checked)}
                          className="w-4 h-4 accent-emerald-400"
                        />
                        <span className="text-xs text-emerald-400 font-bold uppercase">
                          VERIFIED CITIZEN
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SOCIAL MEDIA LINKS MATRIX & UNWANTED LINK PURGE */}
                <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
                        <Radio className="w-4 h-4 text-amber-400" /> CREATOR SOCIAL MEDIA & STREAMING
                        LINKS
                      </h3>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Setup, review, or remove any social channel. Use the active directory below to delete old or unwanted links.
                      </p>
                    </div>

                    <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                      {Object.keys(selectedCreator.links || {}).filter((k) => Boolean((selectedCreator.links as any)[k]?.trim())).length + (selectedCreator.bioLink?.trim() ? 1 : 0)}{" "}
                      Active Channels
                    </span>
                  </div>

                  {/* ACTIVE LINKS DIRECTORY & QUICK PURGE PANEL */}
                  {(() => {
                    const activeKeys = Object.keys(selectedCreator.links || {}).filter(
                      (k) => Boolean((selectedCreator.links as any)[k]?.trim())
                    );
                    const legacyKeys = activeKeys.filter(
                      (k) => !PLATFORMS_CONFIG.some((p) => p.id === k)
                    );
                    const hasBioLink = Boolean(selectedCreator.bioLink?.trim());
                    const totalLinks = activeKeys.length + (hasBioLink ? 1 : 0);

                    return (
                      <div className="space-y-4">
                        {/* Active Links Summary Bar */}
                        <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                              <Link2 className="w-3.5 h-3.5 text-amber-400" />
                              ACTIVE CONNECTED CHANNELS ({totalLinks})
                            </span>

                            {totalLinks > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Remove ALL ${totalLinks} social and bio links from ${selectedCreator.name}?`
                                    )
                                  ) {
                                    handleClearAllCreatorLinks();
                                  }
                                }}
                                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3 text-rose-400" /> CLEAR ALL LINKS
                              </button>
                            )}
                          </div>

                          {/* Chips of Active Links */}
                          {totalLinks === 0 ? (
                            <p className="text-xs text-white/40 italic font-sans">
                              No active links configured for this creator. Add handles below or audit all links in Link Cleaner.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {/* Standard active platform links */}
                              {activeKeys.map((key) => {
                                const conf = PLATFORMS_CONFIG.find((p) => p.id === key);
                                const label = conf ? conf.label : key.toUpperCase();
                                const color = conf ? conf.color : "#f59e0b";
                                const url = (selectedCreator.links as any)[key];
                                const isLegacy = !conf;

                                return (
                                  <div
                                    key={key}
                                    className="p-2.5 bg-black/70 border border-white/10 rounded-lg flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-white">
                                            {label}
                                          </span>
                                          {isLegacy && (
                                            <span className="text-[9px] px-1 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded font-mono">
                                              Legacy
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-white/40 truncate font-mono max-w-[200px]">
                                          {url}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 hover:bg-white/10 rounded text-cyan-400"
                                        title="Test URL"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveCreatorLink(key)}
                                        className="p-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-400 rounded text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                                        title={`Remove ${label} link`}
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-400" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Bio link if configured */}
                              {hasBioLink && (
                                <div className="p-2.5 bg-black/70 border border-cyan-500/20 rounded-lg flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                    <div className="min-w-0">
                                      <span className="font-bold text-xs text-cyan-300">
                                        Card Bio Link
                                      </span>
                                      <p className="text-[10px] text-white/40 truncate font-mono max-w-[200px]">
                                        {selectedCreator.bioLink}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <a
                                      href={selectedCreator.bioLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 hover:bg-white/10 rounded text-cyan-400"
                                      title="Test URL"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCreatorLink("bioLink", true)}
                                      className="p-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-400 rounded text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                                      title="Remove Bio link"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-400" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Legacy Keys Detection & Auto-Cleaner */}
                        {legacyKeys.length > 0 && (
                          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-xs text-amber-200">
                                Legacy / non-standard keys detected in this profile:{" "}
                                <strong className="text-amber-300 font-mono">
                                  {legacyKeys.join(", ")}
                                </strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCreatorsList((prev) =>
                                  prev.map((c) => {
                                    if (c.id !== selectedCreator.id) return c;
                                    const cleanedLinks = { ...c.links };
                                    legacyKeys.forEach((lk) => {
                                      delete (cleanedLinks as any)[lk];
                                    });
                                    return { ...c, links: cleanedLinks };
                                  })
                                );
                                showToast(`Purged legacy keys (${legacyKeys.join(", ")})!`);
                              }}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-bold rounded cursor-pointer whitespace-nowrap"
                            >
                              PURGE LEGACY KEYS
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Platforms Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {PLATFORMS_CONFIG.map((platform) => {
                      const currentValue = selectedCreator.links[platform.id] || "";

                      return (
                        <div
                          key={platform.id}
                          className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2 focus-within:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-white flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: platform.color }}
                              />
                              {platform.label}
                            </label>

                            {currentValue && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={currentValue}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                                >
                                  Test <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSocialLink(platform.id, "")}
                                  className="text-[10px] text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900 border border-rose-500/40 px-2 py-0.5 rounded font-bold cursor-pointer flex items-center gap-1 transition-colors"
                                  title={`Remove ${platform.label} link`}
                                >
                                  <Trash2 className="w-2.5 h-2.5 text-rose-400" /> Remove Link
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={currentValue}
                              onChange={(e) =>
                                handleUpdateSocialLink(platform.id, e.target.value)
                              }
                              placeholder={platform.placeholder}
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-white/15 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 font-mono"
                            />
                          </div>

                          {currentValue && (
                            <p className="text-[10px] text-white/40 truncate font-mono">
                              Resolved: {currentValue}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: LINK CLEANER & AUDIT */}
        {/* ========================================================================= */}
        {activeTab === "links" && (
          <LinkManagerTab
            creatorsList={creatorsList}
            onUpdateCreatorsList={(updated) => {
              setCreatorsList(updated);
              try {
                localStorage.setItem("eworld_creators_list", JSON.stringify(updated));
                broadcastAdminUpdate("CREATORS_UPDATED", updated);
              } catch (_) {}
            }}
            siteConfig={siteConfig}
            onUpdateSiteConfig={(updated) => {
              setSiteConfig(updated);
              try {
                localStorage.setItem("eworld_site_config", JSON.stringify(updated));
                broadcastAdminUpdate("SITE_CONFIG_UPDATED", updated);
              } catch (_) {}
            }}
            onSaveLocally={handleSaveLocally}
            showToast={showToast}
            onJumpToCreator={(creatorId) => {
              setSelectedCreatorId(creatorId);
              setActiveTab("creators");
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GAME REALMS & SERVER HUB */}
        {/* ========================================================================= */}
        {activeTab === "realms" && (
          <div className="space-y-8">
            {/* Minecraft SMP Server Settings */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Server className="w-4 h-4" /> MINECRAFT SMP REALM SETTINGS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    SERVER IP / DOMAIN
                  </label>
                  <input
                    type="text"
                    value={siteConfig.realms.smp.serverIp || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          smp: { ...siteConfig.realms.smp, serverIp: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    MINECRAFT VERSION
                  </label>
                  <input
                    type="text"
                    value={siteConfig.realms.smp.version || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          smp: { ...siteConfig.realms.smp, version: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    SERVER STATUS
                  </label>
                  <select
                    value={siteConfig.realms.smp.status}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          smp: {
                            ...siteConfig.realms.smp,
                            status: e.target.value as any,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="ONLINE">ONLINE / ACTIVE</option>
                    <option value="IN DEVELOPMENT">IN DEVELOPMENT</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    RADAR / BLUEMAP WEB URL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.realms.smp.externalMapUrl || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          smp: { ...siteConfig.realms.smp, externalMapUrl: e.target.value },
                        },
                      })
                    }
                    placeholder="https://map.eworld.net"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    MAX PLAYERS CAPACITY
                  </label>
                  <input
                    type="number"
                    value={siteConfig.realms.smp.maxPlayers || 100}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          smp: { ...siteConfig.realms.smp, maxPlayers: Number(e.target.value) },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* FiveM RP Server Settings */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Server className="w-4 h-4" /> FIVEM ROLEPLAY CITY SETTINGS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    DIRECT JOIN CFX CODE / LINK
                  </label>
                  <input
                    type="text"
                    value={siteConfig.realms.rp.directJoinUrl || ""}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          rp: { ...siteConfig.realms.rp, directJoinUrl: e.target.value },
                        },
                      })
                    }
                    placeholder="cfx.re/join/eworld"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    CITY STATUS
                  </label>
                  <select
                    value={siteConfig.realms.rp.status}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          rp: {
                            ...siteConfig.realms.rp,
                            status: e.target.value as any,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ONLINE">ONLINE / ACTIVE</option>
                    <option value="IN DEVELOPMENT">IN DEVELOPMENT</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    THREAT LEVEL
                  </label>
                  <select
                    value={siteConfig.realms.rp.threatLevel || "NOMINAL"}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        realms: {
                          ...siteConfig.realms,
                          rp: {
                            ...siteConfig.realms.rp,
                            threatLevel: e.target.value as any,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="NOMINAL">NOMINAL (Green)</option>
                    <option value="ELEVATED">ELEVATED (Amber)</option>
                    <option value="CRITICAL">CRITICAL (Red)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Esports Championship Settings */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles className="w-4 h-4" /> ARENA & ESPORTS TOURNAMENT
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    TOURNAMENT TITLE
                  </label>
                  <input
                    type="text"
                    value={siteConfig.tournament.title}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        tournament: { ...siteConfig.tournament, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    PRIZE POOL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.tournament.prizePool}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        tournament: { ...siteConfig.tournament, prizePool: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    SCHEDULE DATE
                  </label>
                  <input
                    type="text"
                    value={siteConfig.tournament.scheduleDate}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        tournament: { ...siteConfig.tournament, scheduleDate: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    REGISTRATION LINK
                  </label>
                  <input
                    type="text"
                    value={siteConfig.tournament.registrationUrl}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        tournament: { ...siteConfig.tournament, registrationUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">
                    STREAM BROADCAST URL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.tournament.streamBroadcastUrl}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        tournament: {
                          ...siteConfig.tournament,
                          streamBroadcastUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: EXPORT & SYNC */}
        {/* ========================================================================= */}
        {activeTab === "sync" && (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-purple-400 uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Download className="w-4 h-4" /> EXPORT & STATIC DEPLOYMENT TOOLS
              </h3>
              <p className="text-xs text-white/60 font-sans leading-relaxed">
                E-World supports both dynamic backend synchronization and static generation
                (Cloudflare Pages). Use these tools to download updated TypeScript/JSON files or
                push to your live Node.js stats orchestrator.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white uppercase block">
                    DOWNLOAD CREATORS.TS
                  </span>
                  <p className="text-[11px] text-white/50 font-sans">
                    Export a drop-in replacement for{" "}
                    <code className="text-cyan-400">app/community/data/creators.ts</code>.
                  </p>
                  <button
                    onClick={handleDownloadCreatorsTS}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD CREATORS.TS
                  </button>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white uppercase block">
                    DOWNLOAD SITECONFIG.JSON
                  </span>
                  <p className="text-[11px] text-white/50 font-sans">
                    Export complete website telemetry and realm server configuration.
                  </p>
                  <button
                    onClick={handleDownloadConfigJSON}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD CONFIG.JSON
                  </button>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white uppercase block">
                    BACKEND API ORCHESTRATOR
                  </span>
                  <p className="text-[11px] text-white/50 font-sans">
                    Push active changes to Railway / local Node.js WebSocket orchestrator.
                  </p>
                  <button
                    onClick={handleSyncWithBackend}
                    disabled={isSaving}
                    className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
                    {isSaving ? "SYNCING..." : "PUSH TO BACKEND"}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Passcode Settings */}
            <div className="p-6 bg-zinc-950/80 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Lock className="w-4 h-4 text-cyan-400" /> ADMIN SECURITY PASSCODE
              </h3>

              <div className="max-w-md space-y-2">
                <label className="text-[10px] tracking-widest text-white/50 uppercase block">
                  UPDATE MASTER ACCESS KEY
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem("eworld_admin_passcode", passcode);
                      showToast("Admin passcode updated successfully!");
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    SAVE KEY
                  </button>
                </div>
                <p className="text-[11px] text-white/40 font-sans">
                  This key guards the admin portal on this domain.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
