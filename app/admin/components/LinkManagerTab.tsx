"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Creator,
  CreatorSocials,
} from "../../community/data/creators";
import { SiteConfig } from "../../community/data/siteConfig";
import {
  Link2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  Globe,
  Radio,
  RefreshCw,
  X,
} from "lucide-react";

export interface ManagedLinkItem {
  id: string; // unique item id
  entityType: "creator" | "site_social" | "realm" | "tournament";
  entityId: string; // creator id or section id
  entityName: string; // creator name or section title
  entityAvatar?: string;
  entityGradient?: string;
  entityCategory?: string;
  platformKey: string;
  platformLabel: string;
  platformColor: string;
  url: string;
  isLegacy: boolean; // e.g. "bio", "domain", non-standard keys
  isBioLink?: boolean;
}

const KNOWN_PLATFORM_META: Record<string, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "#ef4444" },
  twitch: { label: "Twitch", color: "#a855f7" },
  twitter: { label: "Twitter / X", color: "#38bdf8" },
  instagram: { label: "Instagram", color: "#ec4899" },
  discord: { label: "Discord", color: "#6366f1" },
  kick: { label: "Kick", color: "#10b981" },
  spotify: { label: "Spotify", color: "#22c55e" },
  steam: { label: "Steam", color: "#3b82f6" },
  github: { label: "GitHub", color: "#9ca3af" },
  reddit: { label: "Reddit", color: "#f97316" },
  bluesky: { label: "Bluesky", color: "#0284c7" },
  roblox: { label: "Roblox", color: "#ef4444" },
  epicgames: { label: "Epic Games", color: "#ffffff" },
  playstation: { label: "PlayStation Network", color: "#3b82f6" },
  xbox: { label: "Xbox Live", color: "#22c55e" },
  battlenet: { label: "Battle.net", color: "#0284c7" },
  riotgames: { label: "Riot Games", color: "#f43f5e" },
  paypal: { label: "PayPal", color: "#0284c7" },
  website: { label: "Website", color: "#06b6d4" },
  store: { label: "Merch / Store", color: "#eab308" },
  tiktok: { label: "TikTok", color: "#f43f5e" },
};

interface LinkManagerTabProps {
  creatorsList: Creator[];
  onUpdateCreatorsList: (updated: Creator[]) => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (updated: SiteConfig) => void;
  onSaveLocally: () => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  onJumpToCreator: (creatorId: string) => void;
}

export default function LinkManagerTab({
  creatorsList,
  onUpdateCreatorsList,
  siteConfig,
  onUpdateSiteConfig,
  onSaveLocally,
  showToast,
  onJumpToCreator,
}: LinkManagerTabProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "creators" | "site_social" | "realms" | "legacy"
  >("all");
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  // 1. Build Comprehensive Inventory of all active links
  const allLinks = useMemo<ManagedLinkItem[]>(() => {
    const list: ManagedLinkItem[] = [];

    // A. Creator Social Links & Bio Links
    creatorsList.forEach((creator) => {
      // Platform links inside creator.links
      if (creator.links) {
        Object.entries(creator.links).forEach(([key, val]) => {
          if (typeof val === "string" && val.trim().length > 0) {
            const isKnown = Boolean(KNOWN_PLATFORM_META[key]);
            const meta = KNOWN_PLATFORM_META[key] || {
              label: key.toUpperCase(),
              color: "#f59e0b",
            };

            list.push({
              id: `creator_${creator.id}_link_${key}`,
              entityType: "creator",
              entityId: creator.id,
              entityName: creator.name,
              entityAvatar: creator.avatarUrl,
              entityGradient: creator.avatarGradient,
              entityCategory: creator.category,
              platformKey: key,
              platformLabel: meta.label,
              platformColor: meta.color,
              url: val.trim(),
              isLegacy: !isKnown || key === "bio" || key === "domain",
            });
          }
        });
      }

      // Standalone creator.bioLink
      if (creator.bioLink && creator.bioLink.trim().length > 0) {
        list.push({
          id: `creator_${creator.id}_biolink`,
          entityType: "creator",
          entityId: creator.id,
          entityName: creator.name,
          entityAvatar: creator.avatarUrl,
          entityGradient: creator.avatarGradient,
          entityCategory: creator.category,
          platformKey: "bioLink",
          platformLabel: "Bio Link (Card Link)",
          platformColor: "#06b6d4",
          url: creator.bioLink.trim(),
          isLegacy: false,
          isBioLink: true,
        });
      }
    });

    // B. Official Site Socials
    if (siteConfig.socials) {
      Object.entries(siteConfig.socials).forEach(([key, val]) => {
        if (typeof val === "string" && val.trim().length > 0) {
          const meta = KNOWN_PLATFORM_META[key] || {
            label: key.toUpperCase(),
            color: "#06b6d4",
          };
          list.push({
            id: `site_social_${key}`,
            entityType: "site_social",
            entityId: "site_socials",
            entityName: "Official E-World Social Channels",
            platformKey: key,
            platformLabel: `Official ${meta.label}`,
            platformColor: meta.color,
            url: val.trim(),
            isLegacy: false,
          });
        }
      });
    }

    // C. Realms & Servers Links
    if (siteConfig.realms.smp.externalMapUrl) {
      list.push({
        id: "realm_smp_map",
        entityType: "realm",
        entityId: "smp",
        entityName: "Minecraft SMP Realm",
        platformKey: "externalMapUrl",
        platformLabel: "BlueMap / Web Radar",
        platformColor: "#10b981",
        url: siteConfig.realms.smp.externalMapUrl,
        isLegacy: false,
      });
    }

    if (siteConfig.realms.rp.directJoinUrl) {
      list.push({
        id: "realm_rp_direct",
        entityType: "realm",
        entityId: "rp",
        entityName: "FiveM Roleplay City",
        platformKey: "directJoinUrl",
        platformLabel: "FiveM CFX Direct Connect",
        platformColor: "#06b6d4",
        url: siteConfig.realms.rp.directJoinUrl,
        isLegacy: false,
      });
    }

    // D. Tournament Links
    if (siteConfig.tournament.registrationUrl) {
      list.push({
        id: "tournament_registration",
        entityType: "tournament",
        entityId: "tournament",
        entityName: "Esports Tournament",
        platformKey: "registrationUrl",
        platformLabel: "Tournament Registration URL",
        platformColor: "#f59e0b",
        url: siteConfig.tournament.registrationUrl,
        isLegacy: false,
      });
    }

    if (siteConfig.tournament.streamBroadcastUrl) {
      list.push({
        id: "tournament_stream",
        entityType: "tournament",
        entityId: "tournament",
        entityName: "Esports Tournament",
        platformKey: "streamBroadcastUrl",
        platformLabel: "Live Broadcast Stream URL",
        platformColor: "#ef4444",
        url: siteConfig.tournament.streamBroadcastUrl,
        isLegacy: false,
      });
    }

    return list;
  }, [creatorsList, siteConfig]);

  // 2. Filtered list based on search and category
  const filteredLinks = useMemo(() => {
    return allLinks.filter((item) => {
      // Type filter
      if (selectedFilter === "creators" && item.entityType !== "creator") return false;
      if (selectedFilter === "site_social" && item.entityType !== "site_social") return false;
      if (
        selectedFilter === "realms" &&
        item.entityType !== "realm" &&
        item.entityType !== "tournament"
      )
        return false;
      if (selectedFilter === "legacy" && !item.isLegacy) return false;

      // Query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = item.entityName.toLowerCase().includes(q);
        const matchPlatform = item.platformLabel.toLowerCase().includes(q);
        const matchKey = item.platformKey.toLowerCase().includes(q);
        const matchUrl = item.url.toLowerCase().includes(q);
        return matchName || matchPlatform || matchKey || matchUrl;
      }

      return true;
    });
  }, [allLinks, selectedFilter, searchQuery]);

  // Count legacy / flagged links
  const legacyLinksCount = useMemo(() => {
    return allLinks.filter((l) => l.isLegacy).length;
  }, [allLinks]);

  // 3. Remove a single link
  const handleRemoveSingleLink = (item: ManagedLinkItem) => {
    if (item.entityType === "creator") {
      const updated = creatorsList.map((c) => {
        if (c.id !== item.entityId) return c;
        if (item.isBioLink) {
          const { bioLink, ...rest } = c;
          return { ...rest, bioLink: "" };
        }
        const updatedLinks = { ...c.links };
        delete updatedLinks[item.platformKey as keyof CreatorSocials];
        return { ...c, links: updatedLinks };
      });
      onUpdateCreatorsList(updated);
      showToast(`Removed ${item.platformLabel} link from ${item.entityName}!`);
    } else if (item.entityType === "site_social") {
      const updatedSocials = { ...siteConfig.socials };
      delete (updatedSocials as any)[item.platformKey];
      onUpdateSiteConfig({ ...siteConfig, socials: updatedSocials });
      showToast(`Removed ${item.platformLabel} from official site channels!`);
    } else if (item.entityType === "realm") {
      if (item.entityId === "smp") {
        onUpdateSiteConfig({
          ...siteConfig,
          realms: {
            ...siteConfig.realms,
            smp: { ...siteConfig.realms.smp, externalMapUrl: "" },
          },
        });
      } else if (item.entityId === "rp") {
        onUpdateSiteConfig({
          ...siteConfig,
          realms: {
            ...siteConfig.realms,
            rp: { ...siteConfig.realms.rp, directJoinUrl: "" },
          },
        });
      }
      showToast(`Removed ${item.platformLabel}!`);
    } else if (item.entityType === "tournament") {
      onUpdateSiteConfig({
        ...siteConfig,
        tournament: {
          ...siteConfig.tournament,
          [item.platformKey]: "",
        },
      });
      showToast(`Removed ${item.platformLabel}!`);
    }

    // Remove from selected set
    setSelectedLinkIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  };

  // 4. Batch Remove Selected Links
  const handleBatchRemoveSelected = () => {
    if (selectedLinkIds.size === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "BATCH REMOVE UNWANTED LINKS",
      message: `Are you sure you want to permanently remove ${selectedLinkIds.size} selected link(s)? This will delete them from creators and site configs.`,
      action: () => {
        const toRemove = allLinks.filter((l) => selectedLinkIds.has(l.id));

        // Group creator updates
        let updatedCreators = [...creatorsList];
        let updatedSiteConfig = { ...siteConfig };

        toRemove.forEach((item) => {
          if (item.entityType === "creator") {
            updatedCreators = updatedCreators.map((c) => {
              if (c.id !== item.entityId) return c;
              if (item.isBioLink) {
                const { bioLink, ...rest } = c;
                return { ...rest, bioLink: "" };
              }
              const nextLinks = { ...c.links };
              delete nextLinks[item.platformKey as keyof CreatorSocials];
              return { ...c, links: nextLinks };
            });
          } else if (item.entityType === "site_social") {
            const nextSocials = { ...updatedSiteConfig.socials };
            delete (nextSocials as any)[item.platformKey];
            updatedSiteConfig.socials = nextSocials;
          } else if (item.entityType === "realm") {
            if (item.entityId === "smp") {
              updatedSiteConfig.realms.smp.externalMapUrl = "";
            } else if (item.entityId === "rp") {
              updatedSiteConfig.realms.rp.directJoinUrl = "";
            }
          } else if (item.entityType === "tournament") {
            (updatedSiteConfig.tournament as any)[item.platformKey] = "";
          }
        });

        onUpdateCreatorsList(updatedCreators);
        onUpdateSiteConfig(updatedSiteConfig);
        setSelectedLinkIds(new Set());
        setConfirmModal(null);
        showToast(`Successfully purged ${toRemove.length} unwanted links!`);
      },
    });
  };

  // 5. Purge All Legacy / Flagged Links with 1 Click
  const handlePurgeAllLegacy = () => {
    const legacyItems = allLinks.filter((l) => l.isLegacy);
    if (legacyItems.length === 0) {
      showToast("No legacy or unrecognized links found!", "info");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "PURGE ALL LEGACY / OUTDATED LINKS",
      message: `Found ${legacyItems.length} legacy link(s) (such as obsolete 'bio' keys or non-standard URLs). Do you want to purge them all now?`,
      action: () => {
        let updatedCreators = [...creatorsList];

        legacyItems.forEach((item) => {
          if (item.entityType === "creator") {
            updatedCreators = updatedCreators.map((c) => {
              if (c.id !== item.entityId) return c;
              const nextLinks = { ...c.links };
              delete nextLinks[item.platformKey as keyof CreatorSocials];
              return { ...c, links: nextLinks };
            });
          }
        });

        onUpdateCreatorsList(updatedCreators);
        setConfirmModal(null);
        showToast(`Purged ${legacyItems.length} legacy link keys successfully!`);
      },
    });
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedLinkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedLinkIds.size === filteredLinks.length) {
      setSelectedLinkIds(new Set());
    } else {
      setSelectedLinkIds(new Set(filteredLinks.map((l) => l.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-zinc-950/90 border border-white/10 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] text-rose-400 uppercase font-bold">
                // LINK COMMAND & PURGE ENGINE
              </span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white uppercase tracking-wide">
              REMOVE UNWANTED & OUTDATED LINKS
            </h2>
            <p className="text-xs text-white/50 max-w-2xl mt-1 font-sans leading-relaxed">
              Audit, filter, and permanently delete old social handles, broken URLs, legacy metadata
              keys, and outdated destination links across all creators, realms, and website channels.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {legacyLinksCount > 0 && (
              <button
                onClick={handlePurgeAllLegacy}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PURGE {legacyLinksCount} LEGACY LINKS</span>
              </button>
            )}

            {selectedLinkIds.size > 0 && (
              <button
                onClick={handleBatchRemoveSelected}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>REMOVE SELECTED ({selectedLinkIds.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl">
          <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
            TOTAL ACTIVE LINKS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-cyan-400">
              {allLinks.length}
            </span>
            <span className="text-[11px] text-white/40 font-sans">across all systems</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl">
          <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
            CREATOR CHANNELS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-amber-400">
              {allLinks.filter((l) => l.entityType === "creator").length}
            </span>
            <span className="text-[11px] text-white/40 font-sans">
              ({creatorsList.length} creators)
            </span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl">
          <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
            FLAGGED / LEGACY KEYS
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-display font-black ${
                legacyLinksCount > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {legacyLinksCount}
            </span>
            <span className="text-[11px] text-white/40 font-sans">
              {legacyLinksCount > 0 ? "Ready to clean" : "All standard"}
            </span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/80 border border-white/10 rounded-xl">
          <span className="text-[10px] tracking-widest text-white/40 uppercase block mb-1">
            SELECTED FOR DELETION
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-rose-500">
              {selectedLinkIds.size}
            </span>
            <span className="text-[11px] text-white/40 font-sans">links checked</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Bulk Selector */}
      <div className="p-4 bg-zinc-950/90 border border-white/10 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by creator, URL, platform, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black border border-white/20 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-rose-400 font-mono"
          />
        </div>

        {/* Center: Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            ALL ({allLinks.length})
          </button>

          <button
            onClick={() => setSelectedFilter("creators")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              selectedFilter === "creators"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            CREATORS ({allLinks.filter((l) => l.entityType === "creator").length})
          </button>

          <button
            onClick={() => setSelectedFilter("site_social")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              selectedFilter === "site_social"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            OFFICIAL SITE ({allLinks.filter((l) => l.entityType === "site_social").length})
          </button>

          <button
            onClick={() => setSelectedFilter("realms")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              selectedFilter === "realms"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            REALMS & TOURNAMENTS
          </button>

          {legacyLinksCount > 0 && (
            <button
              onClick={() => setSelectedFilter("legacy")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === "legacy"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                  : "bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/50"
              }`}
            >
              LEGACY / UNWANTED ({legacyLinksCount})
            </button>
          )}
        </div>

        {/* Right: Select All Filtered */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          <button
            onClick={handleSelectAllFiltered}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] text-white/70 hover:text-white cursor-pointer transition-colors"
          >
            {selectedLinkIds.size > 0 && selectedLinkIds.size === filteredLinks.length ? (
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-white/40" />
            )}
            <span>
              {selectedLinkIds.size === filteredLinks.length && filteredLinks.length > 0
                ? "DESELECT ALL"
                : "SELECT ALL"}
            </span>
          </button>
        </div>
      </div>

      {/* Link Inventory Items List */}
      {filteredLinks.length === 0 ? (
        <div className="p-12 bg-zinc-950/60 border border-white/10 rounded-2xl text-center space-y-2">
          <Link2 className="w-8 h-8 text-white/30 mx-auto" />
          <h3 className="text-sm font-bold uppercase text-white/80">No Links Found</h3>
          <p className="text-xs text-white/40 font-sans">
            {searchQuery
              ? `No active links match "${searchQuery}". Try a different keyword.`
              : "No links match the selected filter category."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLinks.map((item) => {
            const isChecked = selectedLinkIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isChecked
                    ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.15)]"
                    : "bg-zinc-950/80 border-white/10 hover:border-white/20 hover:bg-zinc-900/60"
                }`}
              >
                {/* Left: Checkbox & Source Entity Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleSelect(item.id)}
                    className="shrink-0 p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title={isChecked ? "Deselect" : "Select for batch removal"}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-white/30" />
                    )}
                  </button>

                  {/* Owner Avatar / Icon */}
                  {item.entityType === "creator" ? (
                    <div
                      onClick={() => onJumpToCreator(item.entityId)}
                      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white border border-white/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: item.entityGradient }}
                      title="Jump to edit this creator"
                    >
                      {item.entityAvatar ? (
                        <Image
                          src={item.entityAvatar}
                          alt={item.entityName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        item.entityName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  ) : item.entityType === "site_social" ? (
                    <div className="w-9 h-9 rounded-lg shrink-0 bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Globe className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg shrink-0 bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Layers className="w-4 h-4" />
                    </div>
                  )}

                  {/* Entity Name & Platform Badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => {
                          if (item.entityType === "creator") onJumpToCreator(item.entityId);
                        }}
                        className={`font-bold text-xs text-white truncate ${
                          item.entityType === "creator"
                            ? "hover:text-amber-400 cursor-pointer"
                            : ""
                        }`}
                      >
                        {item.entityName}
                      </span>

                      {/* Platform Tag */}
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 border shrink-0"
                        style={{
                          backgroundColor: `${item.platformColor}15`,
                          borderColor: `${item.platformColor}50`,
                          color: item.platformColor,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.platformColor }}
                        />
                        {item.platformLabel}
                      </span>

                      {/* Legacy / Warning Badge */}
                      {item.isLegacy && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold uppercase shrink-0">
                          LEGACY KEY: {item.platformKey}
                        </span>
                      )}

                      {item.isBioLink && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold uppercase shrink-0">
                          CARD BIO LINK
                        </span>
                      )}
                    </div>

                    {/* URL Link Text */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-white/60 hover:text-cyan-400 transition-colors font-mono truncate max-w-md block"
                        title={item.url}
                      >
                        {item.url}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Test Link & Remove Button) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 rounded-lg text-white/60 hover:text-cyan-300 transition-colors text-xs flex items-center gap-1 font-bold"
                    title="Test destination in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">TEST</span>
                  </a>

                  <button
                    onClick={() => handleRemoveSingleLink(item)}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    title="Remove this link"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>REMOVE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-[0_0_50px_rgba(225,29,72,0.3)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                  {confirmModal.title}
                </h3>
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                className="p-1 text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                onClick={confirmModal.action}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CONFIRM DELETION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
