"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { galaxyNodes, GalaxyNode } from "../data/galaxyNodes";

export default function CommunityGalaxyView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GalaxyNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Node state for dynamic angles
    const nodes = galaxyNodes.map((n) => ({ ...n }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Orbit Rings
      nodes.forEach((node) => {
        if (node.orbitRadius > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, node.orbitRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Update & Draw Nodes
      nodes.forEach((node) => {
        if (node.orbitRadius > 0) {
          node.angle += node.orbitSpeed * 1.5;
        }

        const nodeX = centerX + Math.cos(node.angle) * node.orbitRadius;
        const nodeY = centerY + Math.sin(node.angle) * node.orbitRadius;

        // Draw faint tether line to center
        if (node.orbitRadius > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nodeX, nodeY);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Outer Glow Aura
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const currentRadius = isHovered || isSelected ? node.radius * 1.25 : node.radius;

        const gradient = ctx.createRadialGradient(
          nodeX,
          nodeY,
          currentRadius * 0.2,
          nodeX,
          nodeY,
          currentRadius * 2.2
        );
        gradient.addColorStop(0, node.glowColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(nodeX, nodeY, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Solid Sphere
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 25 : 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.font = "600 10px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "center";
        ctx.fillText(node.name, nodeX, nodeY + currentRadius + 14);

        ctx.font = "400 8px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText(node.category.toUpperCase(), nodeX, nodeY + currentRadius + 24);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = width / 2;
      const centerY = height / 2;

      let found: GalaxyNode | null = null;
      for (const node of nodes) {
        const nodeX = centerX + Math.cos(node.angle) * node.orbitRadius;
        const nodeY = centerY + Math.sin(node.angle) * node.orbitRadius;
        const dist = Math.hypot(mouseX - nodeX, mouseY - nodeY);
        if (dist <= node.radius * 1.5) {
          found = node;
          break;
        }
      }

      setHoveredNode(found);
      canvas.style.cursor = found ? "pointer" : "default";
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = width / 2;
      const centerY = height / 2;

      for (const node of nodes) {
        const nodeX = centerX + Math.cos(node.angle) * node.orbitRadius;
        const nodeY = centerY + Math.sin(node.angle) * node.orbitRadius;
        const dist = Math.hypot(mouseX - nodeX, mouseY - nodeY);
        if (dist <= node.radius * 1.5) {
          setSelectedNode(node);
          return;
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
    };
  }, [selectedNode, hoveredNode]);

  return (
    <section id="galaxy" className="relative w-full py-20 px-6 font-mono z-20">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col items-center text-center">
        <span className="text-amber-400 text-xs tracking-widest font-bold mb-2">
          // 04 ECOSYSTEM TOPOLOGY
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-md">
          COMMUNITY GALAXY
        </h2>
        <p className="text-white/60 text-xs sm:text-sm tracking-wider max-w-xl mt-3">
          Interactive topological network connecting our survival realms, roleplay
          city, tournaments, and creators into one orbital ecosystem.
        </p>
      </div>

      {/* Galaxy Canvas Viewport */}
      <div className="relative max-w-5xl mx-auto h-[620px] rounded-xl border border-white/10 hologram-glass overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Instructions */}
        <div className="absolute top-4 left-4 text-[10px] text-white/40 tracking-widest flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>CLICK ANY CELESTIAL SATELLITE TO INSPECT</span>
        </div>

        {/* Slide-in Detail Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 hologram-glass p-6 rounded-lg border border-white/20 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 pointer-events-auto">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] text-white/40 tracking-widest block">
                    {selectedNode.category.toUpperCase()}
                  </span>
                  <h3
                    className="text-lg font-bold tracking-wider uppercase mt-1"
                    style={{ color: selectedNode.color }}
                  >
                    {selectedNode.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-white/50 hover:text-white text-base cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                {selectedNode.desc}
              </p>

              <div className="p-3 bg-white/5 rounded border border-white/10 mb-4">
                <span className="text-[9px] text-white/40 tracking-widest block mb-1">
                  TELEMETRY / METRICS
                </span>
                <span className="text-xs text-white font-semibold tracking-wider">
                  {selectedNode.stats}
                </span>
              </div>
            </div>

            {selectedNode.actionLabel && (
              <div>
                {selectedNode.link?.startsWith("/") ? (
                  <Link
                    href={selectedNode.link}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold text-xs tracking-widest uppercase rounded hover:bg-amber-400 transition-colors"
                  >
                    <span>{selectedNode.actionLabel}</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <a
                    href={selectedNode.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-widest uppercase rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  >
                    <span>{selectedNode.actionLabel}</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
