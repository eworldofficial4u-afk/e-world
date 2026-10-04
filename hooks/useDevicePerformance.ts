"use client";

import { useState, useEffect } from "react";

export type RenderQuality = "low" | "medium" | "high";

export interface DevicePerformance {
  isMobile: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  isPageVisible: boolean;
  quality: RenderQuality;
  enablePostProcessing: boolean;
  enableShaderBackground: boolean;
  dpr: [number, number];
}

const SOFTWARE_RENDERER_PATTERN = /swiftshader|llvmpipe|software|microsoft basic render/i;

function isSoftwareWebGLRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { powerPreference: "high-performance" })
      ?? canvas.getContext("webgl", { powerPreference: "high-performance" });
    if (!gl) return true;
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "")
      : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return SOFTWARE_RENDERER_PATTERN.test(renderer);
  } catch {
    return true;
  }
}

export function useDevicePerformance(): DevicePerformance {
  const [device, setDevice] = useState<DevicePerformance>({
    isMobile: false,
    isTouch: false,
    isLowPower: false,
    isPageVisible: true,
    quality: "medium",
    enablePostProcessing: true,
    enableShaderBackground: false,
    dpr: [1, 1.5],
  });

  useEffect(() => {
    let forcedLowQuality = false;
    let animationFrame = 0;
    let previousFrame = performance.now();
    let measuredFrames = 0;
    let accumulatedFrameTime = 0;
    const softwareRenderer = isSoftwareWebGLRenderer();

    const checkDevice = () => {
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches);

      const isSmallScreen = window.innerWidth < 768;
      const isMobileDevice = isTouch && isSmallScreen;
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const constrainedHardware =
        (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 4);
      const isLowPower = forcedLowQuality || constrainedHardware || isSmallScreen ||
        prefersReducedMotion || Boolean(nav.connection?.saveData) || softwareRenderer;
      const quality: RenderQuality = isLowPower
        ? "low"
        : nav.hardwareConcurrency >= 8 && (nav.deviceMemory ?? 8) >= 8
          ? "high"
          : "medium";
      const dpr: [number, number] = quality === "high"
        ? [1, 1.5]
        : quality === "medium"
          ? [1, 1.25]
          : [0.75, 1];

      setDevice({
        isMobile: isMobileDevice,
        isTouch,
        isLowPower,
        isPageVisible: !document.hidden,
        quality,
        enablePostProcessing: quality !== "low",
        enableShaderBackground: quality === "high" && !prefersReducedMotion,
        dpr,
      });
    };

    const measureFrameRate = (now: number) => {
      const frameTime = Math.min(now - previousFrame, 100);
      previousFrame = now;
      if (!document.hidden && measuredFrames < 180) {
        accumulatedFrameTime += frameTime;
        measuredFrames += 1;
        if (measuredFrames === 180 && accumulatedFrameTime / measuredFrames > 24) {
          forcedLowQuality = true;
          checkDevice();
        }
      }
      if (measuredFrames < 180) {
        animationFrame = requestAnimationFrame(measureFrameRate);
      }
    };

    const handleVisibility = () => checkDevice();

    checkDevice();
    animationFrame = requestAnimationFrame(measureFrameRate);
    window.addEventListener("resize", checkDevice, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", checkDevice);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return device;
}
