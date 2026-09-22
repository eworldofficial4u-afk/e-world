"use client";

import { useEffect, useState, useRef } from "react";

interface NodeItem {
  id: string;
  type: string;
  label: string;
  index: string;
  color: string;
}

interface BrutalistFrameProps {
  activeId: string | null;
  onSelectNode: (id: string) => void;
  isConnected: boolean;
  nodes: NodeItem[];
}

export default function BrutalistFrame({
  activeId,
  onSelectNode,
  isConnected,
  nodes,
}: BrutalistFrameProps) {
  const [coords, setCoords] = useState({ x: "0.00", y: "0.00" });
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Normalized mouse coordinates [-1 to 1]
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const normX = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(2);
      const normY = (1 - (e.clientY / window.innerHeight) * 2).toFixed(2);
      setCoords({
        x: normX.startsWith("-") ? normX : `+${normX}`,
        y: normY.startsWith("-") ? normY : `+${normY}`,
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Web Audio API ambient drone and interaction synthesizer
  const toggleAudio = () => {
    if (!isAudioActive) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        if (ctx.state === "suspended") {
          ctx.resume();
        }

        // Master output gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Lowpass filter for deep cosmic drone
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, ctx.currentTime);
        filter.connect(masterGain);

        // Sub-bass drone oscillator 1 (55Hz - A1 note)
        const osc1 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(55, ctx.currentTime);
        osc1.connect(filter);

        // Detuned drone oscillator 2 (55.4Hz for subtle phasing)
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(55.6, ctx.currentTime);
        osc2.connect(filter);

        osc1.start();
        osc2.start();

        droneNodesRef.current = { osc1, osc2, gain: masterGain };
        setIsAudioActive(true);
        playTactileBeep(ctx, 880, 0.08);
      } catch (err) {
        console.warn("Audio Context init error:", err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        droneNodesRef.current = null;
      }
      setIsAudioActive(false);
    }
  };

  const playTactileBeep = (ctx: AudioContext | null, freq: number, duration: number) => {
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignored
    }
  };

  const handleNodeClickAudio = (id: string) => {
    onSelectNode(id);
    if (audioCtxRef.current) {
      playTactileBeep(audioCtxRef.current, 1200, 0.12);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none font-mono text-xs text-white/70 overflow-hidden">
      {/* Corner crosshairs */}
      <span className="absolute top-3 left-3 text-white/30 text-sm font-light">+</span>
      <span className="absolute top-3 right-3 text-white/30 text-sm font-light">+</span>
      <span className="absolute bottom-3 left-3 text-white/30 text-sm font-light">+</span>
      <span className="absolute bottom-3 right-3 text-white/30 text-sm font-light">+</span>

      {/* TOP LEFT: Coordinate Tracker & System Telemetry */}
      <header className="absolute top-6 left-6 flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-widest text-white">E-WORLD // SYS</span>
          <span className="text-white/30">//////////////////</span>
          <span className="px-1.5 py-0.5 bg-white/10 text-[10px] tracking-wider rounded border border-white/20">
            ACTIVE THEORY V7
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/50 text-[11px] font-mono tracking-wider">
          <p>
            COORD <span className="text-white font-semibold">[X: {coords.x} Y: {coords.y}]</span>
          </p>
          <span className="text-white/20">|</span>
          <p>
            GRID: <span className="text-white/80">HEX.SPACE</span>
          </p>
          <span className="text-white/20">|</span>
          <p className="flex items-center gap-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-rose-500 animate-pulse"
              }`}
            />
            <span className={isConnected ? "text-emerald-400" : "text-rose-400"}>
              {isConnected ? "UPLINK LIVE" : "SYNCING..."}
            </span>
          </p>
        </div>
      </header>

      {/* TOP RIGHT: Global Telemetry HUD */}
      <aside aria-label="System Metrics" className="absolute top-6 right-6 flex flex-col items-end gap-1 pointer-events-auto text-right">
        <div className="flex items-center gap-2">
          <span className="text-white/30">//////////////////</span>
          <span className="text-white/90 font-semibold tracking-widest text-xs">TELEMETRY STREAM</span>
        </div>
        <div className="flex items-center gap-3 text-white/50 text-[10px] tracking-widest">
          <span>PORT: 8080</span>
          <span className="text-white/20">/</span>
          <span>LATENCY: 12ms</span>
          <span className="text-white/20">/</span>
          <span className="text-white/70">WSS: SECURE</span>
        </div>
      </aside>

      {/* BOTTOM LEFT: Active Theory Planet Index Counters */}
      <nav aria-label="Planet Index" className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-auto">
        <div className="text-white/30 text-[10px] tracking-widest flex items-center gap-2">
          <span>DESTINATION DIRECTORY</span>
          <span>//////////////////</span>
        </div>
        <div className="flex flex-col gap-1">
          {nodes.map((n) => {
            const isActive = activeId === n.id;
            return (
              <button
                key={n.id}
                onClick={() => handleNodeClickAudio(n.id)}
                data-interactive="true"
                className={`flex items-center gap-3 text-left py-1 px-2.5 rounded transition-all duration-300 group cursor-pointer border ${
                  isActive
                    ? "bg-white/15 border-white/40 text-white font-semibold translate-x-2"
                    : "bg-black/30 border-transparent text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: n.color,
                    boxShadow: isActive ? `0 0 10px ${n.color}` : "none",
                  }}
                />
                <span className="tracking-wider text-xs font-mono">{n.index}</span>
                <span className="tracking-widest text-xs uppercase">{n.label}</span>
                {isActive && (
                  <span className="ml-2 text-[10px] text-white/70 tracking-widest animate-pulse">
                    [LOCKED]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM RIGHT: Minimalist Sound Toggle */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="text-white/30 text-[10px] tracking-widest flex items-center gap-2">
          <span>//////////////////</span>
          <span>SONIC AMBIENCE</span>
        </div>
        <button
          onClick={toggleAudio}
          data-interactive="true"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded border transition-all duration-300 cursor-pointer ${
            isAudioActive
              ? "bg-white/15 border-white/40 text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              : "bg-black/40 border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAudioActive ? "bg-emerald-400 animate-ping" : "bg-white/30"
            }`}
          />
          <span className="tracking-widest text-[11px] font-mono">
            [ {isAudioActive ? "AUDIO: ACTIVE" : "TOGGLE AUDIO"} ]
          </span>
        </button>
      </div>

      {/* Top & Bottom Ambient Technical Borders */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}
