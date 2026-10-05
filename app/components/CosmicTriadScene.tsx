"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import { soundEngine } from "@/hooks/useAudioEngine";

interface OrbProps {
  id: string;
  name: string;
  subName?: string;
  badge: string;
  subtitle: string;
  texturePath?: string;
  videoPath?: string;
  position: [number, number, number];
  color: string;
  accentHex: string;
  isActive: boolean;
  onSelect: () => void;
  href?: string;
  size?: number;
  ringTilt?: [number, number, number];
  isVideo?: boolean;
  isLocked?: boolean;
}

// Custom hook to build glowing orbital particle rings
function useOrbParticles(size: number) {
  const particleCount = 280;
  return useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const outerPos = new Float32Array((particleCount / 2) * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const r = size * 1.55 + (Math.random() - 0.5) * 0.35;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }

    for (let i = 0; i < particleCount / 2; i++) {
      const angle = (i / (particleCount / 2)) * Math.PI * 2;
      const r = size * 1.85 + (Math.random() - 0.5) * 0.25;
      outerPos[i * 3] = Math.cos(angle) * r;
      outerPos[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      outerPos[i * 3 + 2] = Math.sin(angle) * r;
    }

    const g1 = new THREE.BufferGeometry();
    g1.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(outerPos, 3));
    return { ringGeo: g1, outerRingGeo: g2 };
  }, [size]);
}

// Precision Futuristic Gaming Typography Plate underneath each Globe
interface GlobeTypographyPlateProps {
  number: string;
  name: string;
  subName?: string;
  subtitle: string;
  accentHex?: string;
  isActive?: boolean;
  isLocked?: boolean;
  onClick: (e: any) => void;
}

function GlobeTypographyPlate({
  number,
  name,
  subName,
  subtitle,
  isActive,
  isLocked,
  onClick,
}: GlobeTypographyPlateProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${name} ${subName || number}${isLocked ? ' — coming soon' : ''}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(event);
        }
      }}
      className={`world-plate group flex flex-col items-center select-none pointer-events-auto transition-all duration-300 ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      } ${
        isActive ? "scale-105" : "hover:scale-105 opacity-95 hover:opacity-100"
      }`}
    >
      {/* Clean, sleek modern glassmorphism plate with perfect smooth borders */}
      <div
        className={`relative flex flex-col items-center text-center px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
          isLocked
            ? "bg-black/80 border border-red-500/25 group-hover:border-red-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            : "bg-black/70 border border-white/10 group-hover:border-cyan-400/40 shadow-[0_4px_24px_rgba(0,0,0,0.85)] group-hover:shadow-[0_0_20px_rgba(0,245,255,0.12)]"
        }`}
      >
        {/* Monospace numeral pill badge */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <span
            className={`font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.25em] leading-none px-2 py-0.5 rounded-full ${
              isLocked
                ? "bg-red-950/50 text-red-400/90 border border-red-500/30"
                : "bg-cyan-950/40 text-cyan-400/90 border border-cyan-500/25"
            }`}
          >
            {isLocked && <span className="mr-0.5 text-[8.5px]">🔒</span>}
            {number}
          </span>
        </div>

        {/* E-WORLD (+ SubName if present) in ONE single line */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 leading-none my-1 whitespace-nowrap">
          {/* E-WORLD - Bold condensed uppercase gaming font, crisp white with soft subtle glow */}
          <h3
            className="font-display font-black uppercase text-xs sm:text-sm md:text-base tracking-[0.16em] text-white"
            style={{
              textShadow: isLocked
                ? "0 0 8px rgba(239, 68, 68, 0.3), 0 2px 4px rgba(0, 0, 0, 0.95)"
                : "0 0 8px rgba(0, 245, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.95)",
            }}
          >
            {name}
          </h3>

          {/* SMP / COMMUNITY / FIVEM (Omitted for locked orbs to keep only E-WORLD) */}
          {Boolean(subName) && (
            <span
              className={`font-display font-bold uppercase text-[10.5px] sm:text-xs md:text-sm tracking-[0.2em] ${
                isLocked ? "text-red-400" : "text-[#00f5ff]"
              }`}
              style={{
                textShadow: isLocked
                  ? "0 0 8px rgba(239, 68, 68, 0.5)"
                  : "0 0 8px rgba(0, 245, 255, 0.4)",
              }}
            >
              {subName}
            </span>
          )}
        </div>

        {/* Hairline clean gradient divider */}
        <div
          className={`w-10 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-transparent my-1 sm:my-1.5 ${
            isLocked ? "via-red-500/35" : "via-cyan-400/30"
          }`}
        />

        {/* Subtitle / Coming Soon Status */}
        <p
          className={`font-mono text-[8.5px] sm:text-[9.5px] tracking-[0.3em] uppercase font-medium leading-none flex items-center justify-center gap-1 ${
            isLocked ? "text-amber-400 font-bold" : "text-white/70"
          }`}
        >
          {isLocked && <span className="text-[8.5px]">🔒</span>}
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// Standard Terrarium Orb with static texture (supports frosted blur & lock)
function TerrariumImageOrb({
  id,
  name,
  subName,
  badge,
  subtitle,
  texturePath = "",
  position,
  color,
  accentHex,
  isActive,
  onSelect,
  href,
  size = 2.2,
  ringTilt = [0.4, 0.2, -0.3],
  isLocked = false,
}: OrbProps) {
  const router = useRouter();
  const { camera } = useThree();
  const texture = useTexture(texturePath);
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Points>(null!);
  const ringOuterRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const [isWarping, setIsWarping] = useState(false);

  const { ringGeo, outerRingGeo } = useOrbParticles(size);

  useFrame((state, delta) => {
    if (isWarping) {
      const targetVec = new THREE.Vector3(
        position[0],
        position[1],
        position[2] + size * 0.9
      );
      camera.position.lerp(targetVec, delta * 6.5);
      camera.lookAt(position[0], position[1], position[2]);
    }

    if (meshRef.current) {
      const offset = id === "smp" ? 1 : isLocked ? 0.5 : 0;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.9 + offset) * size * 0.035;
    }

    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * (isLocked ? 0.2 : 0.45);
      ringRef.current.rotation.z += delta * 0.1;
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.y -= delta * (isLocked ? 0.15 : 0.25);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    soundEngine.playClickPunch();
    if (isLocked) {
      onSelect();
      return;
    }
    if (href) {
      setIsWarping(true);
      setTimeout(() => {
        router.push(href);
      }, 480);
    }
    onSelect();
  };

  const handlePointerOver = () => {
    if (isLocked) {
      document.body.style.cursor = "not-allowed";
      soundEngine.playHoverBlip();
      return;
    }
    document.body.style.cursor = "pointer";
    soundEngine.playHoverBlip();
    if (id === "community") soundEngine.setSpatialPan(-0.75);
    else if (id === "rp") soundEngine.setSpatialPan(0.75);
    else soundEngine.setSpatialPan(0);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
    soundEngine.setSpatialPan(0);
  };

  const shaderUniforms = useMemo(() => ({
    uMap: { value: texture },
    uIsLocked: { value: isLocked ? 1.0 : 0.0 },
  }), [texture, isLocked]);

  return (
    <group ref={meshRef} position={position}>
      {/* Interactive Trigger Sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size * 1.15, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Internal Diorama Billboard inside Glass Sphere with Frosted Blur Shader if Locked */}
      <mesh ref={coreRef}>
        <planeGeometry args={[size * 2.35, size * 2.35]} />
        <shaderMaterial
          uniforms={shaderUniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            uniform float uIsLocked;
            varying vec2 vUv;

            void main() {
              vec4 raw = texture2D(uMap, vUv);
              float rawBrightness = max(raw.r, max(raw.g, raw.b));

              // Soft perimeter circular fade to guarantee zero quad or boundary cutoff
              float radius = length(vUv - 0.5);
              float edgeFade = 1.0 - smoothstep(0.38, 0.485, radius);

              // Seamless black background keying with smooth falloff
              float keyAlpha = smoothstep(0.012, 0.08, rawBrightness);
              float finalAlpha = keyAlpha * edgeFade;

              if (finalAlpha < 0.003) discard;

              vec4 sampleColor = raw;
              if (uIsLocked > 0.5) {
                // 9-tap Frosted Gaussian blur for locked celestial sphere
                vec2 off = vec2(0.008);
                vec4 blurred = raw * 0.28;
                blurred += texture2D(uMap, vUv + vec2(off.x, 0.0)) * 0.12;
                blurred += texture2D(uMap, vUv - vec2(off.x, 0.0)) * 0.12;
                blurred += texture2D(uMap, vUv + vec2(0.0, off.y)) * 0.12;
                blurred += texture2D(uMap, vUv - vec2(0.0, off.y)) * 0.12;
                blurred += texture2D(uMap, vUv + off) * 0.06;
                blurred += texture2D(uMap, vUv - off) * 0.06;
                blurred += texture2D(uMap, vUv + vec2(off.x, -off.y)) * 0.06;
                blurred += texture2D(uMap, vUv + vec2(-off.x, off.y)) * 0.06;

                // Desaturate and apply mysterious dark frosted cyber tone
                float luma = dot(blurred.rgb, vec3(0.299, 0.587, 0.114));
                sampleColor.rgb = mix(blurred.rgb, vec3(luma), 0.76) * 0.55;
                // Only tint where actual globe content exists - NEVER on transparent background!
                sampleColor.rgb += vec3(0.12, 0.02, 0.04) * smoothstep(0.02, 0.15, rawBrightness);
              }

              gl_FragColor = vec4(sampleColor.rgb, finalAlpha);
            }
          `}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 3D Floating Holographic Padlock Badge in Center of Locked Orb */}
      {isLocked && (
        <Html position={[0, 0, 0]} center pointerEvents="none" zIndexRange={[60, 0]}>
          <div className="world-lock flex flex-col items-center select-none pointer-events-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/80 backdrop-blur-md border border-red-500/50 flex items-center justify-center text-red-400 text-xs sm:text-sm shadow-[0_0_20px_rgba(239,68,68,0.45)] animate-pulse">
              🔒
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-[7.5px] sm:text-[8px] font-mono tracking-widest text-red-300 font-bold uppercase whitespace-nowrap shadow-md">
              COMING SOON
            </span>
          </div>
        </Html>
      )}

      {/* Orbiting Particle Dust Rings */}
      <group rotation={ringTilt}>
        <points ref={ringRef} geometry={ringGeo}>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={isLocked ? 0.5 : 0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
        <points ref={ringOuterRef} geometry={outerRingGeo}>
          <pointsMaterial
            size={0.035}
            color={color}
            transparent
            opacity={isLocked ? 0.3 : 0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Label Plate Below Sphere */}
      <Html position={[0, -size * 1.28, 0]} center zIndexRange={[100, 0]}>
        <GlobeTypographyPlate
          number={badge}
          name={name}
          subName={subName}
          subtitle={subtitle}
          accentHex={accentHex}
          isActive={isActive}
          isLocked={isLocked}
          onClick={handleClick}
        />
      </Html>
    </group>
  );
}

// Video-based Terrarium Orb with square framing and white background keying
function TerrariumVideoOrb({
  id,
  name,
  subName,
  badge,
  subtitle,
  videoPath = "/assets/remove_the_bg_i_dont_want_any.mp4",
  position,
  color,
  accentHex,
  isActive,
  onSelect,
  href,
  size = 2.2,
  ringTilt = [0.4, 0.2, -0.3],
}: OrbProps) {
  const router = useRouter();
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Points>(null!);
  const ringOuterRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  const { ringGeo, outerRingGeo } = useOrbParticles(size);

  const dummyTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, 2, 2);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (!videoPath || typeof document === "undefined") return;

    const video = document.createElement("video");
    video.src = videoPath;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", tryPlay);
    tryPlay();

    const handlePointerDown = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", handlePointerDown, { once: true });
    window.addEventListener("touchstart", handlePointerDown, { once: true });

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    setVideoTexture(tex);

    return () => {
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      video.pause();
      video.removeAttribute("src");
      video.load();
      tex.dispose();
    };
  }, [videoPath]);

  useFrame((state, delta) => {
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }

    if (meshRef.current) {
      const offset = id === "smp" ? 1 : 0;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.9 + offset) * size * 0.035;
    }

    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.45;
      ringRef.current.rotation.z += delta * 0.1;
    }

    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.y -= delta * 0.25;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (href) {
      router.push(href);
    }
    onSelect();
  };

  const uniforms = useMemo(() => {
    return {
      uMap: { value: videoTexture || dummyTexture },
    };
  }, [videoTexture, dummyTexture]);

  return (
    <group ref={meshRef} position={position}>
      {/* Interactive Trigger Sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size * 1.15, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Internal Billboard: square 1:1 framing with clean black background keying & luminous glow un-multiplication */}
      <mesh ref={coreRef}>
        <planeGeometry args={[size * 2.35, size * 2.35]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            varying vec2 vUv;

            void main() {
              // Center 1:1 square crop framing from 1280x720 video
              // 750px crop out of 1280x720 keeps the entire globe & outer rings without edge cutoff
              float cropSize = 750.0;
              vec2 videoUv = vec2(
                (vUv.x - 0.5) * (cropSize / 1280.0) + 0.5,
                (vUv.y - 0.5) * (cropSize / 720.0) + 0.5
              );

              vec4 sampleColor = vec4(0.0);
              if (videoUv.x >= 0.0 && videoUv.x <= 1.0 && videoUv.y >= 0.0 && videoUv.y <= 1.0) {
                sampleColor = texture2D(uMap, videoUv);
              }

              // Key out the black background while preserving 100% exact original video colors
              float brightness = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
              float alpha = smoothstep(0.012, 0.07, brightness);

              // Soft edge vignette to avoid any hard quad cutoff boundaries
              float distFromCenter = length(vUv - 0.5);
              float edgeFade = 1.0 - smoothstep(0.38, 0.485, distFromCenter);
              alpha *= edgeFade;

              if (alpha < 0.003) discard;

              // Output original video color directly with alpha
              gl_FragColor = vec4(sampleColor.rgb, alpha);
              #include <colorspace_fragment>
            }
          `}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting Particle Dust Rings */}
      <group rotation={ringTilt}>
        <points ref={ringRef} geometry={ringGeo}>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
        <points ref={ringOuterRef} geometry={outerRingGeo}>
          <pointsMaterial
            size={0.035}
            color={color}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* Label Plate Below Sphere */}
      <Html position={[0, -size * 1.28, 0]} center zIndexRange={[100, 0]}>
        <GlobeTypographyPlate
          number={badge}
          name={name}
          subName={subName}
          subtitle={subtitle}
          accentHex={accentHex}
          isActive={isActive}
          onClick={handleClick}
        />
      </Html>
    </group>
  );
}

// TerrariumOrb dispatcher: renders video or image orb
function TerrariumOrb(props: OrbProps) {
  const isVideo = props.isVideo || Boolean(props.videoPath) || props.texturePath?.endsWith(".mp4");
  if (isVideo) {
    return <TerrariumVideoOrb {...props} />;
  }
  return <TerrariumImageOrb {...props} />;
}

// Smooth Cybernetic Trajectory Spline connecting the 5 Zig-Zag Orbs
function ZigZagTrajectories({
  p0,
  p1,
  p2,
  p3,
  p4,
}: {
  p0: [number, number, number];
  p1: [number, number, number];
  p2: [number, number, number];
  p3: [number, number, number];
  p4: [number, number, number];
}) {
  const lineGeo = useMemo(() => {
    const curve = new (THREE as any).CatmullRomCurve3(
      [
        new THREE.Vector3(...p0),
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
        new THREE.Vector3(...p3),
        new THREE.Vector3(...p4),
      ],
      false,
      "centripetal",
      0.35
    );

    const points = curve.getPoints(140);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [p0, p1, p2, p3, p4]);

  return (
    <group>
      {/* @ts-ignore */}
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

interface CosmicTriadSceneProps {
  activeWorld: string | null;
  onSelectWorld: (id: string) => void;
}

export default function CosmicTriadScene({
  activeWorld,
  onSelectWorld,
}: CosmicTriadSceneProps) {
  const { viewport } = useThree();
  // Anchor the composition in viewport fractions so resize/zoom cannot push
  // worlds off-screen. All billboards share a depth to keep paired orbs aligned.
  const config = useMemo(() => {
    const point = (x: number, y: number): [number, number, number] => [
      (x - 0.5) * viewport.width,
      (0.5 - y) * viewport.height,
      0,
    ];
    if (viewport.aspect < 1) {
      return {
        scale: Math.min(viewport.width / 13, viewport.height / 20),
        lockedScale: 0.65,
        locked1Pos: point(0.16, 0.20),
        smpPos: point(0.50, 0.29),
        locked2Pos: point(0.84, 0.20),
        communityPos: point(0.25, 0.53),
        rpPos: point(0.75, 0.53),
      };
    }
    return {
      scale: Math.min(viewport.width / 22, viewport.height / 12.6),
      lockedScale: 1,
      locked1Pos: point(0.12, 0.32),
      communityPos: point(0.275, 0.49),
      smpPos: point(0.50, 0.275),
      rpPos: point(0.725, 0.49),
      locked2Pos: point(0.88, 0.32),
    };
  }, [viewport.width, viewport.height, viewport.aspect]);

  return (
    <group>
      {/* Subtle Zig-Zag Constellation Trajectory Spline connecting the 5 Orbs */}
      <ZigZagTrajectories
        p0={config.locked1Pos}
        p1={config.communityPos}
        p2={config.smpPos}
        p3={config.rpPos}
        p4={config.locked2Pos}
      />

      {/* 4. Far Left Orb (LOCKED): E-WORLD (Crimson Red / Frosted Blur) */}
      <TerrariumOrb
        id="arena"
        name="E-WORLD"
        badge="04"
        subtitle="COMING SOON"
        texturePath="/images/community/smp-world-20260914.png"
        position={config.locked1Pos}
        color="#ef4444"
        accentHex="#f43f5e"
        size={1.9 * config.scale * config.lockedScale}
        ringTilt={[0.4, -0.2, 0.5]}
        isActive={activeWorld === "arena"}
        onSelect={() => onSelectWorld("arena")}
        isLocked={true}
      />

      {/* 1. Left Orb: E-WORLD COMMUNITY (Amber / Gold globe with cyan interface accents) */}
      <TerrariumOrb
        id="community"
        name="E-WORLD"
        subName="COMMUNITY"
        badge="01"
        subtitle="PEOPLE • EVENTS"
        texturePath="/images/community/discord-world-new.jpg"
        position={config.communityPos}
        color="#fbbf24"
        accentHex="#00f5ff"
        size={2.15 * config.scale}
        ringTilt={[0.5, 0.3, -0.4]}
        isActive={activeWorld === "community"}
        onSelect={() => onSelectWorld("community")}
        href="/community"
      />

      {/* 2. Center Top Orb: E-WORLD SMP (Emerald Green) */}
      <TerrariumOrb
        id="smp"
        name="E-WORLD"
        subName="SMP"
        badge="02"
        subtitle="BUILD • SURVIVE"
        texturePath="/images/community/smp-world-old.jpg"
        position={config.smpPos}
        color="#22c55e"
        accentHex="#00f5ff"
        size={2.35 * config.scale}
        ringTilt={[0.3, -0.4, 0.2]}
        isActive={activeWorld === "smp"}
        onSelect={() => onSelectWorld("smp")}
        href="/smp"
      />

      {/* 3. Right Orb: E-WORLD FIVEM (Electric Cyan / Blue) */}
      <TerrariumOrb
        id="rp"
        name="E-WORLD"
        subName="FIVEM"
        badge="03"
        subtitle="CITY • ROLEPLAY"
        texturePath="/images/community/fivem-world-old.jpg"
        position={config.rpPos}
        color="#38bdf8"
        accentHex="#00f5ff"
        size={2.15 * config.scale}
        ringTilt={[-0.4, 0.3, 0.3]}
        isActive={activeWorld === "rp"}
        onSelect={() => onSelectWorld("rp")}
        href="/grid"
      />

      {/* 5. Far Right Orb (LOCKED): E-WORLD (Amethyst Violet / Frosted Blur) */}
      <TerrariumOrb
        id="labs"
        name="E-WORLD"
        badge="05"
        subtitle="COMING SOON"
        texturePath="/images/community/fivem-world-20260914.png"
        position={config.locked2Pos}
        color="#a855f7"
        accentHex="#a855f7"
        size={1.9 * config.scale * config.lockedScale}
        ringTilt={[-0.3, 0.4, -0.4]}
        isActive={activeWorld === "labs"}
        onSelect={() => onSelectWorld("labs")}
        isLocked={true}
      />
    </group>
  );
}

