"use client";

import { useEffect } from "react";

export default function DevToolsGuard() {
  useEffect(() => {
    // Only run on client in browser environment
    if (typeof window === "undefined") return;

    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });

    // 2. Intercept DevTools & Source Inspection Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+I / Cmd+Option+I (DevTools Inspect)
      // Ctrl+Shift+J / Cmd+Option+J (DevTools Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      if (isCtrlOrCmd && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+Option+U (View Page Source)
      if (isCtrlOrCmd && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (isCtrlOrCmd && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    // 3. Disable Dragging & Copying
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });

    // 4. Overwrite and silence console logging
    const noop = () => {};
    const originalConsole = { ...window.console };

    const warningBanner = () => {
      originalConsole.clear();
      originalConsole.log(
        "%c[SECURITY PROTOCOL ENGAGED]\n%cDevTools terminal access and inspection operations are strictly restricted on this domain.\nAll anomalous network signatures are monitored.",
        "color: #ff0055; font-size: 18px; font-weight: bold; font-family: monospace;",
        "color: #00ffff; font-size: 12px; font-family: monospace;"
      );
    };

    window.console.log = noop;
    window.console.debug = noop;
    window.console.info = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.table = noop;

    warningBanner();
    const clearTimer = setInterval(warningBanner, 3000);

    // 5. Anti-Debugging loop (only on desktop where DevTools shortcuts exist, skipped on mobile to save CPU/battery)
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches);

    let debugTrap: any = null;
    if (!isTouchDevice && process.env.NODE_ENV === "production") {
      debugTrap = setInterval(() => {
        const startTime = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const endTime = performance.now();
        if (endTime - startTime > 100) {
          warningBanner();
        }
      }, 2500);
    }

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("dragstart", handleDragStart);
      clearInterval(clearTimer);
      clearInterval(debugTrap);
      // Restore console
      Object.assign(window.console, originalConsole);
    };
  }, []);

  return null;
}
