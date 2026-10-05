"use client";

import React, { useState } from "react";

interface BlockDashboardWidgetProps {
  tps?: string | number;
  online?: number;
  max?: number;
  ping?: number;
  version?: string;
  ip?: string;
}

export default function BlockDashboardWidget({
  tps = "20.0",
  online = 0,
  max = 100,
  ping = 45,
  version = "Purpur 1.21.11",
  ip = "151.243.226.61:25565",
}: BlockDashboardWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "console">("metrics");
  const [consoleInput, setConsoleInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    `[SYS/BOOT] Connected to Minecraft Server: ${ip}`,
    `[SYS/INFO] Engine: ${version} // Port 25565`,
    "[SYS/AUTH] Crossplay active: Java, Bedrock, TLauncher, SKLauncher",
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    const cmd = consoleInput.trim();
    setLogs((prev) => [...prev, `> ${cmd}`, `[E-WORLD/SYS] Executed: ${cmd} // OK`]);
    setConsoleInput("");
  };

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 font-mono"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          data-interactive="true"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-black/80 hover:bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 rounded-none shadow-[0_0_20px_rgba(0,255,170,0.2)] text-[11px] sm:text-xs tracking-widest uppercase transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SMP HUD DASHBOARD</span>
          <span className="text-white/40 text-[9px] sm:text-[10px]">[EXPAND]</span>
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-4 bg-black/90 backdrop-blur-2xl border border-emerald-500/50 shadow-[0_0_40px_rgba(0,255,170,0.25)] space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-white tracking-wider">
                CORE TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("metrics")}
                className={`text-[10px] uppercase px-1.5 py-0.5 ${
                  activeTab === "metrics" ? "text-emerald-400 font-bold bg-white/10" : "text-white/40"
                }`}
              >
                STATS
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={`text-[10px] uppercase px-1.5 py-0.5 ${
                  activeTab === "console" ? "text-emerald-400 font-bold bg-white/10" : "text-white/40"
                }`}
              >
                LOGS
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white text-xs ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Metrics Tab */}
          {activeTab === "metrics" ? (
            <div className="space-y-2 text-[11px] text-white/70">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/40">SERVER IP:</span>
                <span className="text-emerald-400 font-bold font-mono">{ip}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/40">ENGINE / VERSION:</span>
                <span className="text-cyan-400 font-semibold">{version}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/40">ACTIVE SURVIVORS:</span>
                <span className="text-white font-semibold">{online} / {max} Online</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/40">CLUSTER TICKS:</span>
                <span className="text-emerald-400 font-bold">{tps} / 20.0 TPS</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/40">LATENCY / PING:</span>
                <span className="text-white">{ping}ms</span>
              </div>

              <div className="pt-2">
                <div className="text-[9px] text-white/40 mb-1">TICK DELAY BUFFER</div>
                <div className="flex gap-1 h-3 items-end">
                  {[40, 42, 39, 45, 41, 40, 42, 38, 41, 40, 39, 40].map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${(val / 50) * 100}%` }}
                      className="flex-1 bg-emerald-400/80"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-36 overflow-y-auto bg-black/60 p-2 border border-white/10 text-[10px] text-white/70 space-y-1 font-mono">
                {logs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommand} className="flex gap-1">
                <input
                  type="text"
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  placeholder="Query /ping, /tps..."
                  className="flex-1 px-2 py-1 bg-white/5 border border-white/15 text-white text-[11px] focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/40"
                >
                  SEND
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
