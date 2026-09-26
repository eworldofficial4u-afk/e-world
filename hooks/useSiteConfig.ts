"use client";

import { useState, useEffect } from "react";
import { defaultSiteConfig, SiteConfig } from "../app/community/data/siteConfig";

export function useSiteConfig() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let hasLocalConfig = false;
    const local = localStorage.getItem("eworld_site_config");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === "object") {
          setSiteConfig(parsed);
          hasLocalConfig = true;
        }
      } catch (err) {
        console.warn("[SiteConfig] Failed to parse local config:", err);
      }
    }
    setIsLoaded(true);

    // 2. Fetch from Live Backend Server (only fill if no local overrides)
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://e-world-bot-production.up.railway.app";
    fetch(`${apiUrl}/api/site-config`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.config && Object.keys(data.config).length > 0 && !hasLocalConfig) {
          setSiteConfig((prev) => ({
            ...prev,
            ...data.config,
          }));
        }
      })
      .catch(() => {
        // Backend offline or unreachable - local config is used
      });

    // 3. BroadcastChannel for instant cross-tab real-time sync with Admin Panel
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("eworld_admin_channel");
        channel.onmessage = (event) => {
          if (event.data?.type === "SITE_CONFIG_UPDATED" && event.data.payload) {
            setSiteConfig(event.data.payload);
          }
        };
      } catch (err) {
        console.warn("[SiteConfig] BroadcastChannel init error:", err);
      }
    }

    // 4. Listen for storage events (cross-tab fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eworld_site_config" && e.newValue) {
        try {
          setSiteConfig(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("[SiteConfig] Storage sync error:", err);
        }
      }
    };

    // 5. In-page CustomEvent for immediate propagation within same tab
    const handleCustomUpdate = (e: any) => {
      if (e.detail) {
        setSiteConfig(e.detail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("eworld:siteconfig-updated", handleCustomUpdate);

    return () => {
      if (channel) {
        try {
          channel.close();
        } catch (_) {}
      }
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("eworld:siteconfig-updated", handleCustomUpdate);
    };
  }, []);

  return { siteConfig, isLoaded };
}
