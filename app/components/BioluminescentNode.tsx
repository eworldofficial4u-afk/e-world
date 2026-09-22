"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, extend, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial, Html } from "@react-three/drei";

const BioluminescentPlanetMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(1.0, 1.0, 1.0),
    uActive: 0.0, // 0 = default, 1 = user has clicked/selected this node
  },
  // --- VERTEX SHADER ---
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      // Calculate normal in view space for the Fresnel effect
      vNormal = normalize(normalMatrix * normal);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // --- FRAGMENT SHADER ---
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uActive;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Standard 2D Random & Noise for fluid generation
    float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Fractional Brownian Motion for layered, organic swirling
    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
      // 1. FRESNEL: Calculate the viewing angle to make the edges glow (Iridescence)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = dot(normal, viewDir);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      float rimGlow = pow(fresnel, 3.0); 

      // 2. FLUID NOISE: Warp the UVs using time to create swirling movement
      vec2 uv = vUv * 4.0;
      vec2 warp = vec2(fbm(uv + uTime * 0.2), fbm(uv - uTime * 0.3));
      float fluid = fbm(uv + warp + uTime * 0.1);

      // 3. COLOR MIXING: Drive colors into high intensity for Bloom
      vec3 baseColor = uColor * 0.5;
      vec3 highColor = uColor * 4.0; // Pushed way past 1.0 so the post-processing catches it
      
      // Mix the fluid texture with the edge rim
      vec3 finalColor = mix(baseColor, highColor, fluid * rimGlow);
      finalColor += highColor * rimGlow * 1.5;

      // 4. INTERACTION: Pulse intensely if the user has clicked this node
      float pulse = (sin(uTime * 4.0) * 0.5 + 0.5) * 0.5;
      float activeBoost = uActive * (1.0 + pulse);
      finalColor += uColor * activeBoost * 3.0;

      // 5. ALPHA: Make the dark gaps truly transparent (Requires Additive Blending)
      float alpha = clamp(rimGlow * 1.2 + fluid * 0.5 + activeBoost, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ BioluminescentPlanetMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    bioluminescentPlanetMaterial: ThreeElement<typeof BioluminescentPlanetMaterial>;
  }
}

interface PlanetaryNodeProps {
  position: [number, number, number];
  color: string;
  secondaryColor?: string;
  label: string;
  subLabel?: string;
  onClick: () => void;
  isActive: boolean;
  statsData: any;
  type: "nexus" | "block" | "grid";
}

export default function BioluminescentNode({
  position,
  color,
  secondaryColor,
  label,
  subLabel,
  onClick,
  isActive,
  statsData,
  type,
}: PlanetaryNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<InstanceType<typeof BioluminescentPlanetMaterial>>(null);


  const accentColor = useMemo(() => new THREE.Color(color), [color]);
  const secColor = useMemo(
    () => new THREE.Color(secondaryColor || color),
    [secondaryColor, color]
  );

  // Generate orbital halo particles around each node
  const haloGeometry = useMemo(() => {
    const particleCount = 180;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.8 + Math.random() * 0.9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uActive.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uActive.value,
        isActive ? 1.0 : 0.0,
        1 - Math.exp(-6 * delta)
      );
    }

    if (meshRef.current) {
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.4;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.12;
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.54;
      ringRef.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[2.0, 64, 64]} />
        <bioluminescentPlanetMaterial
          ref={materialRef}
          key={BioluminescentPlanetMaterial.key}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uColor={accentColor}

          toneMapped={false}
        />

        {/* Orbiting particulate halo */}
        <points ref={ringRef} geometry={haloGeometry}>
          <pointsMaterial
            size={0.06}
            color={secColor}
            transparent
            opacity={isActive ? 0.8 : 0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Holographic Technical Data HUD */}
        <Html position={[0, 3.2, 0]} center zIndexRange={[100, 0]}>
          <div
            style={{
              boxShadow: isActive ? `0 0 35px ${color}50` : undefined,
              borderColor: isActive ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
            }}
            className={`transition-all duration-700 w-72 p-5 border backdrop-blur-xl bg-black/75 rounded-none font-mono ${
              isActive
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            {/* Header with slash divider */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 tracking-widest font-mono">
                  {subLabel || "SECTOR NODE"}
                </span>
                <h3 className="font-bold text-sm tracking-widest text-white uppercase">
                  {label}
                </h3>
              </div>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            </div>

            {/* Dynamic Telemetry Metrics */}
            <div className="text-xs font-mono tracking-wider space-y-2 text-white/80">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/40">SYSTEM STATUS:</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 text-[10px] rounded ${
                    statsData?.status === "ONLINE"
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                      : "text-rose-400 bg-rose-500/10 border border-rose-500/30"
                  }`}
                >
                  {statsData?.status || "OFFLINE"}
                </span>
              </div>

              {type === "nexus" && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">MEMBERS:</span>
                    <span className="text-white font-semibold">{statsData?.online ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">VOICE ACTIVE:</span>
                    <span className="text-[#ffaa00] font-semibold">
                      {statsData?.voiceActive ?? 0}
                    </span>
                  </div>
                </>
              )}

              {type === "block" && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">ONLINE PLAYERS:</span>
                    <span className="text-white font-semibold">
                      {statsData?.players ?? 0} / {statsData?.max ?? 100}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">SERVER TPS:</span>
                    <span className="text-[#00ffaa] font-semibold">
                      {statsData?.tps ?? "20.0"}
                    </span>
                  </div>
                </>
              )}

              {type === "grid" && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">ACTIVE CITIZENS:</span>
                    <span className="text-white font-semibold">
                      {statsData?.players ?? 0} / {statsData?.max ?? 128}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">PRIORITY QUEUE:</span>
                    <span className="text-[#00aaff] font-semibold">
                      {statsData?.queue ?? 0}
                    </span>
                  </div>
                </>
              )}

              {/* Progress bar visual */}
              <div className="pt-2 border-t border-white/10">
                <div className="w-full bg-white/10 h-1 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(15, ((statsData?.online || statsData?.players || 20) / (statsData?.max || 150)) * 100))}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              {/* Enter Node CTA for E-WORLD SMP */}
              {type === "block" && (
                <div className="pt-2">
                  <a
                    href="/block"
                    data-interactive="true"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-[11px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.2)]"
                  >
                    <span>ENTER E-WORLD SMP</span>
                    <span>→</span>
                  </a>
                </div>
              )}

              {/* Enter Node CTA for E-WORLD RP */}
              {type === "grid" && (
                <div className="pt-2">
                  <a
                    href="/grid"
                    data-interactive="true"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-[11px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <span>ENTER E-WORLD RP</span>
                    <span>→</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Simple Label when zoomed out */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-300 font-mono tracking-widest text-[11px] whitespace-nowrap px-2 py-0.5 bg-black/50 border border-white/20 backdrop-blur-sm ${
              isActive ? "opacity-0 scale-90" : "opacity-80 text-white"
            }`}
          >
            {label}
          </div>
        </Html>
      </mesh>
    </group>
  );
}

