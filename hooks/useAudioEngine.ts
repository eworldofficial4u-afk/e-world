"use client";

import { useEffect, useRef, useState, useCallback } from "react";

class SynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Stereo panner for spatial audio
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
        this.pannerNode.connect(this.masterGain);
      }

      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public startAmbience() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    if (this.osc1 || this.osc2) return; // already active

    try {
      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3);

      const target = this.pannerNode || this.masterGain!;
      droneGain.connect(target);
      this.droneGain = droneGain;

      // Sub-bass root drone (55Hz ~ A1)
      const osc1 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Celestial harmonic fifth (82.4Hz ~ E2) with slight vibrato
      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      // Filter for warm, dark cosmic atmosphere
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);

      osc1.start();
      osc2.start();

      this.osc1 = osc1;
      this.osc2 = osc2;
    } catch {
      // Audio start error
    }
  }

  public stopAmbience() {
    if (!this.ctx || !this.droneGain) return;
    try {
      this.droneGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
      setTimeout(() => {
        if (this.osc1) {
          try { this.osc1.stop(); this.osc1.disconnect(); } catch {}
          this.osc1 = null;
        }
        if (this.osc2) {
          try { this.osc2.stop(); this.osc2.disconnect(); } catch {}
          this.osc2 = null;
        }
      }, 1000);
    } catch {}
  }

  public setSpatialPan(panValue: number) {
    // panValue between -1.0 (left / community) and +1.0 (right / fivem)
    if (!this.ctx || !this.pannerNode) return;
    const clamped = Math.max(-1, Math.min(1, panValue));
    this.pannerNode.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.1);
  }

  public playHoverBlip() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  public playClickPunch() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  public playSuccessChime() {
    this.init();
    if (!this.ctx) return;
    this.resume();

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const time = this.ctx!.currentTime + index * 0.06;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch {}
  }
}

export const soundEngine = new SynthesizerEngine();

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAmbience = useCallback(() => {
    if (isPlaying) {
      soundEngine.stopAmbience();
      setIsPlaying(false);
    } else {
      soundEngine.startAmbience();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const setSpatialPan = useCallback((pan: number) => {
    soundEngine.setSpatialPan(pan);
  }, []);

  const playHover = useCallback(() => {
    soundEngine.playHoverBlip();
  }, []);

  const playClick = useCallback(() => {
    soundEngine.playClickPunch();
  }, []);

  const playSuccess = useCallback(() => {
    soundEngine.playSuccessChime();
  }, []);

  return {
    isPlaying,
    toggleAmbience,
    setSpatialPan,
    playHover,
    playClick,
    playSuccess,
  };
}
