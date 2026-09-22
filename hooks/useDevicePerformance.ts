"use client";

import { useState, useEffect } from "react";

export interface DevicePerformance {
  isMobile: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  dpr: [number, number];
}

export function useDevicePerformance(): DevicePerformance {
  const [device, setDevice] = useState<DevicePerformance>({
    isMobile: false,
    isTouch: false,
    isLowPower: false,
    dpr: [1, 1.75],
  });

  useEffect(() => {
    const checkDevice = () => {
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches);

      const isSmallScreen = window.innerWidth < 768;
      const isMobileDevice = isTouch && isSmallScreen;

      // Detect hardware concurrency or memory limits if available
      const nav = navigator as any;
      const isLowPower =
        (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
        (nav.deviceMemory && nav.deviceMemory <= 4) ||
        isSmallScreen;

      // Set optimal DPR to protect mobile GPU & battery
      // High-density phones (iPhone, Galaxy) have DPR 3+, which melts mobile GPUs on heavy WebGL
      const dpr: [number, number] = isMobileDevice
        ? [1, 1.25]
        : isLowPower
        ? [1, 1.5]
        : [1, 1.75];

      setDevice({
        isMobile: isMobileDevice,
        isTouch,
        isLowPower,
        dpr,
      });
    };

    checkDevice();
    window.addEventListener("resize", checkDevice, { passive: true });
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return device;
}
